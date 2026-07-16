import { hash, verify } from 'argon2';

/**
 * Hash a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    type: 2, // Argon2id
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}

/**
 * Verify a plaintext password against a stored Argon2id hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await verify(hash, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}