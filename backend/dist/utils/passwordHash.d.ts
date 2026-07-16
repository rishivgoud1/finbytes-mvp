/**
 * Hash a plaintext password using Argon2id.
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a plaintext password against a stored Argon2id hash.
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
