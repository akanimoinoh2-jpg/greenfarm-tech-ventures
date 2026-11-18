import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { put, head, del } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';

const dataPath = 'greenfarm/admin-data.json';
const sessionLifetime = 8 * 60 * 60 * 1000;
const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxPhotoBytes = 5 * 1024 * 1024;
const loginAttempts = new Map();

const defaultProfile = {
  name: 'Rich Victor Jeremiah',
  title: 'Chief Executive Officer',
  bio: 'Rich Victor Jeremiah leads Greenfarm & Tech Ventures at the meeting point of agriculture and technology. His work is guided by practical innovation, sustainable growth and creating opportunity for people and communities.',
  photoVersion: null,
  photoUrl: null,
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
  if (secret.length >= 32) return createHash('sha256').update(secret).digest();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password) return createHash('sha256').update('greenfarm-development-secret').digest();
  return createHash('sha256').update(`greenfarm:${password}`).digest();
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

  const expiresAt = Number(Buffer.from(payload, 'base64url').toString('utf8'));
  return Number.isSafeInteger(expiresAt) && expiresAt > Date.now();
}

function isSecure(request) {
  return process.env.VERCEL === '1' || request.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(response, token, request) {
  response.setHeader('Set-Cookie', `gf_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}${isSecure(request) ? '; Secure' : ''}`);
}

function clearSessionCookie(response, request) {
  response.setHeader('Set-Cookie', `gf_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${isSecure(request) ? '; Secure' : ''}`);
}

function createSessionToken() {
  const expiresAt = Date.now() + sessionLifetime;
  const payload = Buffer.from(String(expiresAt)).toString('base64url');
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
  const key = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= Date.now()) {
    loginAttempts.set(key, { count: 0, resetAt: Date.now() + 15 * 60 * 1000 });
    return { key, count: 0 };
  }
  return { key, count: attempt.count };
}

function passwordMatches(input) {
  const password = process.env.ADMIN_PASSWORD || '';
  if (!password || typeof input !== 'string' || input.length > 256) return false;
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
    photoVersion: profile.photoVersion ?? null,
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
  try {
    const found = await head(dataPath);
    if (found?.url) {
      const text = await (await fetch(found.url, { cache: 'no-store' })).text();
      const state = JSON.parse(text);
      if (state?.profile && Array.isArray(state.work)) return state;
    }
  } catch {
    // No saved data yet — fall through and create it.
  }
  const state = newState();
  try {
    await put(dataPath, JSON.stringify(state), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error('Could not create the initial data file:', error.message);
  }
  return state;
}

async function saveState(state) {
  await put(dataPath, JSON.stringify(state), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
  });
}

function isAllowedPhotoType(type) {
  return typeof type === 'string' && allowedPhotoTypes.has(type);
}

function validUploadPath(path, folder) {
  return typeof path === 'string'
    && new RegExp(`^uploads/${folder}/[0-9a-f-]{36}\\.(jpg|png|webp)$`, 'i').test(path);
}

function redirectTo(response, url) {
  response.writeHead(302, {
    Location: url,
    'Cache-Control': 'public, max-age=60',
  });
  response.end();
}

function findWorkEntry(state, id) {
  return state.work.find((candidate) => candidate.id === id) || null;
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
          maximumSizeInBytes: maxPhotoBytes,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        const isProfile = validUploadPath(blob.pathname, 'profile');
        const isWork = validUploadPath(blob.pathname, 'work');
        if ((!isProfile && !isWork) || !isAllowedPhotoType(blob.contentType) || blob.size > maxPhotoBytes) {
          await del(blob.url).catch(() => {});
          throw new Error('The uploaded photo is not a valid JPG, PNG or WebP image under 5 MB.');
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
    const state = await loadState();
    return sendJson(response, 200, publicProfile(state.profile));
  }

  if (request.method === 'GET' && pathname === '/api/profile/photo') {
    const state = await loadState();
    if (!state.profile.photoUrl) return sendJson(response, 404, { error: 'No updated profile photo has been uploaded.' });
    return redirectTo(response, state.profile.photoUrl);
  }

  if (request.method === 'GET' && pathname === '/api/work') {
    const state = await loadState();
    return sendJson(response, 200, {
      work: [...state.work].sort((left, right) => right.createdAt - left.createdAt).map(publicWorkEntry),
    });
  }

  const workPhotoMatch = pathname.match(/^\/api\/work\/([^/]+)\/photo$/);
  if (request.method === 'GET' && workPhotoMatch) {
    const state = await loadState();
    const entry = findWorkEntry(state, workPhotoMatch[1]);
    if (!entry?.photoUrl) return sendJson(response, 404, { error: 'That work entry could not be found.' });
    return redirectTo(response, entry.photoUrl);
  }

  if (request.method === 'GET' && pathname === '/api/admin/session') {
    const authenticated = getSession(request);
    return sendJson(response, authenticated ? 200 : 401, { authenticated });
  }

  if (request.method === 'POST' && pathname === '/api/admin/login') {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    if (!process.env.ADMIN_PASSWORD) {
      return sendJson(response, 503, { error: 'Administrator sign-in is not configured. Set ADMIN_PASSWORD in Vercel.' });
    }
    const attempts = loginLimit(request);
    if (attempts.count >= 8) return sendJson(response, 429, { error: 'Too many sign-in attempts. Try again in 15 minutes.' });
    const body = requireObject(request.body);
    if (!passwordMatches(body.password)) {
      loginAttempts.set(attempts.key, { count: attempts.count + 1, resetAt: Date.now() + 15 * 60 * 1000 });
      return sendJson(response, 401, { error: 'That password did not match. Please try again.' });
    }
    loginAttempts.delete(attempts.key);
    setSessionCookie(response, createSessionToken(), request);
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
    const state = await loadState();
    const oldUrl = state.profile.photoUrl;
    const nextProfile = {
      ...state.profile,
      name: cleanText(body.name, 'Name', 100),
      title: cleanText(body.title, 'Title', 100),
      bio: cleanText(body.bio, 'Introduction', 1000),
    };
    if (body.photoUrl !== undefined) {
      if (!validUploadPath(body.photoPath, 'profile') || !isAllowedPhotoType(body.photoType)) {
        return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP portrait.' });
      }
      nextProfile.photoUrl = body.photoUrl;
      nextProfile.photoVersion = Date.now();
    }
    state.profile = nextProfile;
    await saveState(state);
    if (oldUrl && oldUrl !== nextProfile.photoUrl) await del(oldUrl).catch(() => {});
    return sendJson(response, 200, { profile: publicProfile(nextProfile) });
  }

  if (pathname === '/api/admin/work' || pathname.startsWith('/api/admin/work/')) {
    if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
    if (!getSession(request)) return sendJson(response, 401, { error: 'Please sign in again to manage work entries.' });

    const state = await loadState();
    if (request.method === 'POST' && pathname === '/api/admin/work') {
      const body = requireObject(request.body);
      if (!validUploadPath(body.photoPath, 'work') || !isAllowedPhotoType(body.photoType) || !body.photoUrl) {
        return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP work photo.' });
      }
      const now = Date.now();
      const entry = {
        id: randomUUID(),
        title: cleanText(body.title, 'Title', 100),
        category: cleanText(body.category, 'Category', 80),
        alt: cleanText(body.alt, 'Image description', 240),
        photoUrl: body.photoUrl,
        imageVersion: now,
        createdAt: now,
        updatedAt: now,
      };
      state.work.push(entry);
      await saveState(state);
      return sendJson(response, 201, { work: publicWorkEntry(entry) });
    }

    const workMatch = pathname.match(/^\/api\/admin\/work\/([0-9a-f-]+)$/i);
    if (!workMatch) return sendJson(response, 404, { error: 'Not found.' });
    const existing = findWorkEntry(state, workMatch[1]);
    if (!existing) return sendJson(response, 404, { error: 'That work entry could not be found.' });

    if (request.method === 'PUT') {
      const body = requireObject(request.body);
      const nextEntry = {
        ...existing,
        title: cleanText(body.title, 'Title', 100),
        category: cleanText(body.category, 'Category', 80),
        alt: cleanText(body.alt, 'Image description', 240),
        updatedAt: Date.now(),
      };
      if (body.photoUrl !== undefined) {
        if (!validUploadPath(body.photoPath, 'work') || !isAllowedPhotoType(body.photoType)) {
          return sendJson(response, 400, { error: 'Choose a verified JPG, PNG or WebP work photo.' });
        }
        nextEntry.photoUrl = body.photoUrl;
        nextEntry.imageVersion = nextEntry.updatedAt;
      }
      state.work = state.work.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry));
      await saveState(state);
      if (nextEntry.photoUrl !== existing.photoUrl) await del(existing.photoUrl).catch(() => {});
      return sendJson(response, 200, { work: publicWorkEntry(nextEntry) });
    }

    if (request.method === 'DELETE') {
      state.work = state.work.filter((entry) => entry.id !== existing.id);
      await saveState(state);
      await del(existing.photoUrl).catch(() => {});
      return sendJson(response, 200, { deleted: true });
    }

    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  return sendJson(response, 404, { error: 'Not found.' });
}

export default async function handler(request, response) {
  try {
    await handleApi(request, response);
  } catch (error) {
    if (error.status) return sendJson(response, error.status, { error: error.message });
    console.error('Greenfarm API request failed:', error.message);
    return sendJson(response, 500, { error: 'The profile service could not complete that request.' });
  }
}
