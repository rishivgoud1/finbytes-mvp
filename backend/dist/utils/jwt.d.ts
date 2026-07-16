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
export declare function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
/**
 * Verify and decode a JWT token using the public key.
 */
export declare function verifyToken(token: string): JwtPayload | null;
/**
 * Extract JWT from Bearer authorization header.
 */
export declare function extractTokenFromHeader(authHeader?: string): string | null;
