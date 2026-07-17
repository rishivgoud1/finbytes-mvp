import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Load RSA keys from the app's .keys directory.
// Checks several candidate locations so it works in dev (tsx), the old
// tsc layout (dist/utils/), and the bundled tsup layout (dist/).
function findKeysDir(): string {
  const candidates = [
    path.join(process.cwd(), '.keys'),
    path.join(__dirname, '../.keys'),
    path.join(__dirname, '../../.keys'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'private.pem'))) return dir;
  }
  throw new Error(
    `.keys directory with private.pem not found. Searched: ${candidates.join(', ')}`
  );
}

const keysDir = findKeysDir();
const PRIVATE_KEY = fs.readFileSync(path.join(keysDir, 'private.pem'), 'utf8');
const PUBLIC_KEY = fs.readFileSync(path.join(keysDir, 'public.pem'), 'utf8');

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token with RS256 (RSA signature).
 * Token expires in 1 hour by default.
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '1h'
  });
}

/**
 * Verify and decode a JWT token using the public key.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256']
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT from Bearer authorization header.
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}