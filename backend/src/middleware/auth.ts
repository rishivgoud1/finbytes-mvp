import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  roles?: string[];
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return void res.status(401).json({
      success: false,
      error: 'Missing or malformed Authorization header',
      code: 401
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return void res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 401
    });
  }

  req.userId = payload.userId;
  req.email = payload.email;
  req.roles = payload.roles;

  next();
}