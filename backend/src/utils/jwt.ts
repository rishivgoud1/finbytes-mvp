import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Load RSA keys from your secure keys directory
const privateKeyPath = path.join(__dirname, '../../.keys/private.pem');
const publicKeyPath = path.join(__dirname, '../../.keys/public.pem');

const PRIVATE_KEY = fs.readFileSync(privateKeyPath, 'utf8');
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, 'utf8');

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