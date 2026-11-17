import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(serverDirectory, '..');
const dataDirectory = resolve(serverDirectory, 'data');
const profilePath = resolve(dataDirectory, 'profile.json');
const photoPath = resolve(dataDirectory, 'profile-photo');
const workPath = resolve(dataDirectory, 'work.json');
const workPhotosDirectory = resolve(dataDirectory, 'work-photos');
const initialPhotoPath = resolve(projectDirectory, 'WhatsApp Image 2026-11-16 at 6.08.12 PM.jpeg');
const port = Number(process.env.PORT || 3001);
const adminPassword = process.env.ADMIN_PASSWORD || '';
const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;
const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

if (adminPassword.length < 12) {
  console.error('Set ADMIN_PASSWORD to a unique password of at least 12 characters before starting the profile server.');
  process.exit(1);
}

await mkdir(dataDirectory, { recursive: true });
await mkdir(workPhotosDirectory, { recursive: true });

try {
  await stat(profilePath);
} catch {
  await writeFile(profilePath, JSON.stringify({
    name: 'Rich Victor Jeremiah',
    title: 'Chief Executive Officer',
    bio: 'Rich Victor Jeremiah leads Greenfarm & Tech Ventures at the meeting point of agriculture and technology. His work is guided by practical innovation, sustainable growth and creating opportunity for people and communities.',
    photoType: 'image/jpeg',
    photoVersion: Date.now(),
  }, null, 2));
}

try {
  await stat(photoPath);
} catch {
  await copyFile(initialPhotoPath, photoPath);
}

let profile = JSON.parse(await readFile(profilePath, 'utf8'));

try {
  await stat(workPath);
} catch {
  await writeFile(workPath, '[]');
}

let workEntries = JSON.parse(await readFile(workPath, 'utf8'));

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

function publicProfile() {
  return {
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    photoVersion: profile.photoVersion,
  };
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

async function readJson(request, maxBytes = 8 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Send a valid JSON request.');
    error.status = 400;
    throw error;
  }
}

function setSessionCookie(response, token, request) {
  const secure = process.env.NODE_ENV === 'production' || request.headers['x-forwarded-proto'] === 'https';
  response.setHeader('Set-Cookie', `gf_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}${secure ? '; Secure' : ''}`);
}

function clearSessionCookie(response, request) {
  const secure = process.env.NODE_ENV === 'production' || request.headers['x-forwarded-proto'] === 'https';
  response.setHeader('Set-Cookie', `gf_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`);
}

function getSession(request) {
  const cookie = request.headers.cookie || '';
  const token = cookie.match(/(?:^|;\s*)gf_admin=([^;]+)/)?.[1];
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt || expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  sessions.set(token, Date.now() + sessionLifetime);
  return true;
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
  const key = request.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= Date.now()) {
    loginAttempts.set(key, { count: 0, resetAt: Date.now() + 15 * 60 * 1000 });
    return { key, count: 0 };
  }
  return { key, count: attempt.count };
}

function passwordMatches(input) {
  if (typeof input !== 'string' || input.length > 256) return false;
  const expected = createHash('sha256').update(adminPassword).digest();
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
    const error = new Error('Send a valid work entry object.');
    error.status = 400;
    throw error;
  }
  return value;
}

function validPortrait(image, type) {
  if (type === 'image/jpeg') return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  if (type === 'image/png') return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === 'image/webp') return image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

function validWorkId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function parseWorkImage(body) {
  if (!allowedPhotoTypes.has(body.photoType) || typeof body.photo !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.photo)) {
    const error = new Error('Choose a valid JPG, PNG or WebP work photo.');
    error.status = 400;
    throw error;
  }
  const image = Buffer.from(body.photo, 'base64');
  if (
    !image.length ||
    image.length > 5 * 1024 * 1024 ||
    image.toString('base64') !== body.photo ||
    !validPortrait(image, body.photoType)
  ) {
    const error = new Error('The work photo must be a valid JPG, PNG or WebP image no larger than 5 MB.');
    error.status = 400;
    throw error;
  }
  return image;
}

async function saveWorkEntries(nextEntries) {
  await writeFile(workPath, JSON.stringify(nextEntries, null, 2));
  workEntries = nextEntries;
}

async function saveProfile(nextProfile) {
  await writeFile(profilePath, JSON.stringify(nextProfile, null, 2));
  profile = nextProfile;
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  try {
    if (request.method === 'GET' && pathname === '/api/health') {
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'GET' && pathname === '/api/profile') {
      return sendJson(response, 200, publicProfile());
    }

    if (request.method === 'GET' && pathname === '/api/profile/photo') {
      const photo = await readFile(photoPath);
      response.writeHead(200, {
        'Content-Type': profile.photoType || 'image/jpeg',
        'Content-Length': photo.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      return response.end(photo);
    }

    if (request.method === 'GET' && pathname === '/api/work') {
      return sendJson(response, 200, {
        work: [...workEntries]
          .sort((left, right) => right.createdAt - left.createdAt)
          .map(publicWorkEntry),
      });
    }

    const workPhotoMatch = pathname.match(/^\/api\/work\/([^/]+)\/photo$/);
    if (request.method === 'GET' && workPhotoMatch) {
      const [, id] = workPhotoMatch;
      if (!validWorkId(id)) return sendJson(response, 400, { error: 'That work entry identifier is not valid.' });
      const entry = workEntries.find((candidate) => candidate.id === id);
      if (!entry) return sendJson(response, 404, { error: 'That work entry could not be found.' });
      const image = await readFile(resolve(workPhotosDirectory, `${id}.${entry.extension}`));
      response.writeHead(200, {
        'Content-Type': entry.photoType,
        'Content-Length': image.length,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      });
      return response.end(image);
    }

    if (request.method === 'GET' && pathname === '/api/admin/session') {
      const authenticated = getSession(request);
      return sendJson(response, authenticated ? 200 : 401, { authenticated });
    }

    if (request.method === 'POST' && pathname === '/api/admin/login') {
      if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
      const attempts = loginLimit(request);
      if (attempts.count >= 8) return sendJson(response, 429, { error: 'Too many sign-in attempts. Try again in 15 minutes.' });
      const body = await readJson(request, 32 * 1024);
      if (!passwordMatches(body.password)) {
        loginAttempts.set(attempts.key, {
          count: attempts.count + 1,
          resetAt: Date.now() + 15 * 60 * 1000,
        });
        return sendJson(response, 401, { error: 'That password did not match. Please try again.' });
      }
      loginAttempts.delete(attempts.key);
      const token = randomBytes(32).toString('hex');
      sessions.set(token, Date.now() + sessionLifetime);
      setSessionCookie(response, token, request);
      return sendJson(response, 200, { authenticated: true });
    }

    if (request.method === 'POST' && pathname === '/api/admin/logout') {
      if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
      const cookie = request.headers.cookie || '';
      const token = cookie.match(/(?:^|;\s*)gf_admin=([^;]+)/)?.[1];
      if (token) sessions.delete(token);
      clearSessionCookie(response, request);
      return sendJson(response, 200, { authenticated: false });
    }

    if (request.method === 'PUT' && pathname === '/api/admin/profile') {
      if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
      if (!getSession(request)) return sendJson(response, 401, { error: 'Please sign in again to edit this profile.' });

      const body = await readJson(request);
      const nextProfile = {
        name: cleanText(body.name, 'Name', 100),
        title: cleanText(body.title, 'Title', 100),
        bio: cleanText(body.bio, 'Introduction', 1000),
        photoType: profile.photoType || 'image/jpeg',
        photoVersion: profile.photoVersion || Date.now(),
      };

      if (body.photo !== undefined) {
        if (!allowedPhotoTypes.has(body.photoType) || typeof body.photo !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.photo)) {
          return sendJson(response, 400, { error: 'Choose a valid JPG, PNG or WebP portrait.' });
        }
        const image = Buffer.from(body.photo, 'base64');
        if (
          !image.length ||
          image.length > 5 * 1024 * 1024 ||
          image.toString('base64') !== body.photo ||
          !validPortrait(image, body.photoType)
        ) {
          return sendJson(response, 400, { error: 'The portrait must be a valid image no larger than 5 MB.' });
        }
        await writeFile(photoPath, image);
        nextProfile.photoType = body.photoType;
        nextProfile.photoVersion = Date.now();
      }

      await saveProfile(nextProfile);
      return sendJson(response, 200, { profile: publicProfile() });
    }

    if (pathname.startsWith('/api/admin/work')) {
      if (!hasTrustedOrigin(request)) return sendJson(response, 403, { error: 'Request origin was not accepted.' });
      if (!getSession(request)) return sendJson(response, 401, { error: 'Please sign in again to manage work entries.' });

      if (request.method === 'POST' && pathname === '/api/admin/work') {
        const body = requireObject(await readJson(request));
        const title = cleanText(body.title, 'Title', 100);
        const category = cleanText(body.category, 'Category', 80);
        const alt = cleanText(body.alt, 'Image description', 240);
        const image = parseWorkImage(body);
        const id = randomUUID();
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[body.photoType];
        const now = Date.now();
        await writeFile(resolve(workPhotosDirectory, `${id}.${extension}`), image, { flag: 'wx' });
        const entry = { id, title, category, alt, photoType: body.photoType, extension, imageVersion: now, createdAt: now, updatedAt: now };
        try {
          await saveWorkEntries([...workEntries, entry]);
        } catch (error) {
          await unlink(resolve(workPhotosDirectory, `${id}.${extension}`)).catch(() => {});
          throw error;
        }
        return sendJson(response, 201, { work: publicWorkEntry(entry) });
      }

      const workMatch = pathname.match(/^\/api\/admin\/work\/([^/]+)$/);
      if (workMatch) {
        const [, id] = workMatch;
        if (!validWorkId(id)) return sendJson(response, 400, { error: 'That work entry identifier is not valid.' });
        const index = workEntries.findIndex((entry) => entry.id === id);
        if (index < 0) return sendJson(response, 404, { error: 'That work entry could not be found.' });
        const existing = workEntries[index];

        if (request.method === 'PUT') {
          const body = requireObject(await readJson(request));
          const nextEntry = {
            ...existing,
            title: cleanText(body.title, 'Title', 100),
            category: cleanText(body.category, 'Category', 80),
            alt: cleanText(body.alt, 'Image description', 240),
            updatedAt: Date.now(),
          };
          if (body.photo !== undefined) {
            const image = parseWorkImage(body);
            const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[body.photoType];
            const imagePath = resolve(workPhotosDirectory, `${id}.${extension}`);
            await writeFile(imagePath, image);
            if (existing.extension !== extension) {
              await unlink(resolve(workPhotosDirectory, `${id}.${existing.extension}`)).catch(() => {});
            }
            nextEntry.photoType = body.photoType;
            nextEntry.extension = extension;
            nextEntry.imageVersion = nextEntry.updatedAt;
          }
          const nextEntries = [...workEntries];
          nextEntries[index] = nextEntry;
          await saveWorkEntries(nextEntries);
          return sendJson(response, 200, { work: publicWorkEntry(nextEntry) });
        }

        if (request.method === 'DELETE') {
          const nextEntries = workEntries.filter((entry) => entry.id !== id);
          await saveWorkEntries(nextEntries);
          await unlink(resolve(workPhotosDirectory, `${id}.${existing.extension}`)).catch(() => {});
          return sendJson(response, 200, { deleted: true });
        }
      }
    }

    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    if (error.status) return sendJson(response, error.status, { error: error.message });
    console.error('Profile service request failed:', error.message);
    return sendJson(response, 500, { error: 'The profile service could not complete that request.' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Greenfarm profile service listening on port ${port}`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
