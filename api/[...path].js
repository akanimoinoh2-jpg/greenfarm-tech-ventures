import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';

const dataPath = 'private/admin-data.json';
const sessionLifetime = 8 * 60 * 60 * 1000;
const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const loginAttempts = new Map();
const defaultProfile = {
  name: 'Rich Victor Jeremiah',
  title: 'Chief Executive Officer',
  bio: 'Rich Victor Jeremiah leads Greenfarm & Tech Ventures at the meeting point of agriculture and technology. His work is guided by practical innovation, sustainable growth and creating opportunity for people and communities.',
  photoType: 'image/jpeg',
  photoPath: null,
  photoVersion: null,
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '64kb',
    },
  },
};

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (secret.length < 32) throw new Error('Set ADMIN_SESSION_SECRET to a random value of at least 32 characters.');
  return createHash('sha256').update(secret).digest();
}

function signSession(payload) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('hex');
}

function getSession(request) {
  const cookie = request.headers.cookie || '';
  const token = cookie.match(/(?:^|;\s*)gf_admin=([^;]+)/)?.[1];
  if (!token) return false;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;

  const expected = Buffer.from(signSession(payload), 'hex');
  const supplied = Buffer.from(signature, 'hex');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;

  const expiresAt = Number(Buffer.from(payload, 'base64url').toString('utf8').split('.')[0]);
  return Number.isSafeInteger(expiresAt) && expiresAt > Date.now();
}

function setSessionCookie(response, token, request) {
  const secure = process.env.VERCEL === '1' || request.headers['x-forwarded-proto'] === 'https';
  response.setHeader('Set-Cookie', `gf_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}${secure ? '; Secure' : ''}`);
}

function clearSessionCookie(response, request) {
  const secure = process.env.VERCEL === '1' || request.headers['x-forwarded-proto'] === 'https';
  response.setHeader('Set-Cookie', `gf_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`);
}

function createSessionToken() {
  const expiresAt = Date.now() + sessionLifetime;
  const payload = Buffer.from(`${expiresAt}.${randomBytes(24).toString('hex')}`).toString('base64url');
  return `${payload}.${signSession(payload)}`;
}

function hasTrustedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function loginLimit(request) {
  const key = request.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || request.socket?.remoteAddress
    || 'unknown';
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= Date.now()) {
    loginAttempts.set(key, { count: 0, resetAt: Date.now() + 15 * 60 * 1000 });
    return { key, count: 0 };
  }
  return { key, count: attempt.count };
}

function passwordMatches(input) {
  const password = process.env.ADMIN_PASSWORD || '';
  if (password.length < 12 || typeof input !== 'string' || input.length > 256) return false;
  const expected = createHash('sha256').update(password).digest();
  const supplied = createHash('sha256').update(input).digest();
  return timingSafeEqual(expected, supplied);
}

function cleanText(value, field, maxLength) {
  if (typeof value !== 'string') {
    const error = new Error(`${field} must be text.`);
    error.status = 400;
    throw error;
  }
  const text = value.trim();
  if (!text || text.length > maxLength) {
    const error = new Error(`${field} must be between 1 and ${maxLength} characters.`);
    error.status = 400;
    throw error;
  }
  return text;
}

function requireObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error('Send a valid request object.');
    error.status = 400;
    throw error;
  }
  return value;
}

function publicProfile(profile) {
  return {
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    photoVersion: profile.photoVersion,
  };
}

function publicWorkEntry(entry) {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    alt: entry.alt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    imageVersion: entry.imageVersion,
  };
}

function newState() {
  return { profile: { ...defaultProfile }, work: [] };
}

async function loadState() {
  const result = await get(dataPath, { access: 'private', useCache: false });
  if (!result) {
    const state = newState();
    const saved = await put(dataPath, JSON.stringify(state), {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    });
    return { state, etag: saved.etag };
  }
  if (!result.stream) throw new Error('The saved profile data could not be read.');
  const state = JSON.parse(await new Response(result.stream).text());
  if (!state?.profile || !Array.isArray(state.work)) {
    throw new Error('The saved profile data has an invalid format.');
  }
  return { state, etag: result.blob.etag };
}

async function saveState(state, etag) {
  try {
    const saved = await put(dataPath, JSON.stringify(state), {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
      ifMatch: etag,
    });
    return saved.etag;
  } catch (error) {
    if (error.name === 'BlobPreconditionFailedError' || error.statusCode === 412) {
      const conflict = new Error('Another admin change was saved at the same time. Refresh the page and try again.');
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
}

function validUploadPath(path, folder) {
  return typeof path === 'string'
    && new RegExp(`^uploads/${folder}/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(jpg|png|webp)$`, 'i').test(path);
}

function validImage(image, type) {
  if (type === 'image/jpeg') return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  if (type === 'image/png') return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === 'image/webp') return image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

async function streamBlob(response, pathname) {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (!result?.stream || result.statusCode !== 200) return sendJson(response, 404, { error: 'That photo could not be found.' });
  const image = Buffer.from(await new Response(result.stream).arrayBuffer());
  response.writeHead(200, {
    'Content-Type': result.blob.contentType || 'application/octet-stream',
    'Content-Length': image.length,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(image);
}

async function deleteBlob(pathname) {
  if (!pathname) return;
  const result = await get(pathname, { access: 'private', useCache: false });
  if (result?.blob?.url) await del(result.blob.url);
}

async function uploadPhoto(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });

  try {
    const result = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!hasTrustedOrigin(request)) throw new Error('Request origin was not accepted.');
        if (!getSession(request)) throw new Error('Please sign in again to upload a photo.');
        const validPath = validUploadPath(pathname, 'profile') || validUploadPath(pathname, 'work');
        if (!validPath) throw new Error('That upload path is not accepted.');
        return {
          allowedContentTypes: [...allowedPhotoTypes],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        const isProfile = validUploadPath(blob.pathname, 'profile');
        const isWork = validUploadPath(blob.pathname, 'work');
        if ((!isProfile && !isWork) || !allowedPhotoTypes.has(blob.contentType) || blob.size > 5 * 1024 * 1024) {
          await del(blob.url);
          throw new Error('The uploaded photo is not a valid JPG, PNG or WebP image under 5 MB.');
        }
        const saved = await get(blob.url, { access: 'private', useCache: false });
        if (!saved?.stream) throw new Error('The uploaded photo could not be verified.');
        const image = Buffer.from(await new Response(saved.stream).arrayBuffer());
        if (!validImage(image, blob.contentType)) {
          await del(blob.url);
          throw new Error('The uploaded photo is not a valid JPG, PNG or WebP image.');
        }
      },
    });
    return sendJson(response, 200, result);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || 'The photo upload could not be authorized.' });
  }
}

async function handleApi(request, response) {
  const pathname = new URL(request.url, 'https://vercel.local').pathname;

  if (pathname === '/api/admin/upload') return uploadPhoto(request, response);
  if (request.method === 'GET' && pathname === '/api/health') return sendJson(response, 200, { ok: true });

  if (request.method === 'GET' && pathname === '/api/profile') {
    const { state } = await loadState();
    return sendJson(response, 200, publicProfile(state.profile));
  }

  if (request.method === 'GET' && pathname === '/api/profile/photo') {
    const { state } = await loadState();
    if (!state.profile.photoPath) return sendJson(response, 404, { error: 'No updated profile photo has been uploaded.' });
    return streamBlob(response, state.profile.photoPath);
  }

  if (request.method === 'GET' && pathname === '/api/work') {
    const { state } = await loadState();
    return sendJson(response, 200, {
      work: [...state.work].sort((left, right) => right.createdAt - left.createdAt).map(publicWorkEntry),
    });
  }

  const workPhotoMatch = pathname.match(/^\/api\/work\/([^/]+)\/photo$/);
  if (request.method === 'GET' && workPhotoMatch) {
    const { state } = await loadState();
    const entry = state.work.find((candidate) => candidate.id === workPhotoMatch[1]);
    if (!entry) return sendJson(response, 404, { error: 'That work entry could not be found.' });
    return streamBlob(response, entry.photoPath);
  }

  if (request.method === 'GET' && pathname === '/api/admin/session') {
    const authenticated = getSession(request);
    return sendJson(response, authenticated ? 200 : 401, { authenticated });
  }

  if (request.method === 'POST' && pathname === '/api/admin/login') {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    if ((process.env.ADMIN_PASSWORD || '').length < 12 || (process.env.ADMIN_SESSION_SECRET || '').length < 32) {
      return sendJson(response, 503, { error: 'Administrator sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel.' });
    }
    const attempts = loginLimit(request);
    if (attempts.count >= 8) return sendJson(response, 429, { error: 'Too many sign-in attempts. Try again in 15 minutes.' });
    const body = requireObject(request.body);
    if (!passwordMatches(body.password)) {
      loginAttempts.set(attempts.key, { count: attempts.count + 1, resetAt: Date.now() + 15 * 60 * 1000 });
      return sendJson(response, 401, { error: 'That password did not match. Please try again.' });
    }
    loginAttempts.delete(attempts.key);
    const token = createSessionToken();
    setSessionCookie(response, token, request);
    return sendJson(response, 200, { authenticated: true });
  }

  if (request.method === 'POST' && pathname === '/api/admin/logout') {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    clearSessionCookie(response, request);
    return sendJson(response, 200, { authenticated: false });
  }

  if (pathname === '/api/admin/profile' && request.method === 'PUT') {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    if (!getSession(request)) return sendJson(response, 401, { error: 'Please sign in again to edit this profile.' });

    const body = requireObject(request.body);
    const { state, etag } = await loadState();
    const oldPhotoPath = state.profile.photoPath;
    const nextProfile = {
      ...state.profile,
      name: cleanText(body.name, 'Name', 100),
      title: cleanText(body.title, 'Title', 100),
      bio: cleanText(body.bio, 'Introduction', 1000),
    };
    if (body.photoPath !== undefined) {
      if (!validUploadPath(body.photoPath, 'profile') || !allowedPhotoTypes.has(body.photoType)) {
        return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP portrait.' });
      }
      nextProfile.photoPath = body.photoPath;
      nextProfile.photoType = body.photoType;
      nextProfile.photoVersion = Date.now();
    }
    state.profile = nextProfile;
    await saveState(state, etag);
    if (oldPhotoPath && oldPhotoPath !== nextProfile.photoPath) await deleteBlob(oldPhotoPath);
    return sendJson(response, 200, { profile: publicProfile(nextProfile) });
  }

  if (pathname === '/api/admin/work' || pathname.startsWith('/api/admin/work/')) {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    if (!getSession(request)) return sendJson(response, 401, { error: 'Please sign in again to manage work entries.' });

    const { state, etag } = await loadState();
    if (request.method === 'POST' && pathname === '/api/admin/work') {
      const body = requireObject(request.body);
      if (!validUploadPath(body.photoPath, 'work') || !allowedPhotoTypes.has(body.photoType)) {
        return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP work photo.' });
      }
      const now = Date.now();
      const entry = {
        id: randomUUID(),
        title: cleanText(body.title, 'Title', 100),
        category: cleanText(body.category, 'Category', 80),
        alt: cleanText(body.alt, 'Image description', 240),
        photoType: body.photoType,
        photoPath: body.photoPath,
        imageVersion: now,
        createdAt: now,
        updatedAt: now,
      };
      state.work.push(entry);
      await saveState(state, etag);
      return sendJson(response, 201, { work: publicWorkEntry(entry) });
    }

    const workMatch = pathname.match(/^\/api\/admin\/work\/([0-9a-f-]+)$/i);
    if (!workMatch) return sendJson(response, 404, { error: 'Not found.' });
    const index = state.work.findIndex((entry) => entry.id === workMatch[1]);
    if (index < 0) return sendJson(response, 404, { error: 'That work entry could not be found.' });
    const existing = state.work[index];

    if (request.method === 'PUT') {
      const body = requireObject(request.body);
      const nextEntry = {
        ...existing,
        title: cleanText(body.title, 'Title', 100),
        category: cleanText(body.category, 'Category', 80),
        alt: cleanText(body.alt, 'Image description', 240),
        updatedAt: Date.now(),
      };
      if (body.photoPath !== undefined) {
        if (!validUploadPath(body.photoPath, 'work') || !allowedPhotoTypes.has(body.photoType)) {
          return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP work photo.' });
        }
        nextEntry.photoType = body.photoType;
        nextEntry.photoPath = body.photoPath;
        nextEntry.imageVersion = nextEntry.updatedAt;
      }
      state.work[index] = nextEntry;
      await saveState(state, etag);
      if (nextEntry.photoPath !== existing.photoPath) await deleteBlob(existing.photoPath);
      return sendJson(response, 200, { work: publicWorkEntry(nextEntry) });
    }

    if (request.method === 'DELETE') {
      state.work.splice(index, 1);
      await saveState(state, etag);
      await deleteBlob(existing.photoPath);
      return sendJson(response, 200, { deleted: true });
    }
  }

  return sendJson(response, 404, { error: 'Not found.' });
}

export default async function handler(request, response) {
  try {
    await handleApi(request, response);
  } catch (error) {
    if (error.status) return sendJson(response, error.status, { error: error.message });
    console.error('Vercel profile service request failed:', error.message);
    return sendJson(response, 500, { error: 'The profile service could not complete that request.' });
  }
}
