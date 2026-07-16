import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Generic factory to create role-checking middlewares.
 * Checks if the authenticated user has at least one of the allowed roles.
 */
export function requireAnyRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication context missing', 500);
    }

    const hasPermission = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return sendError(
        res,
        `Access Denied: Requires one of the following roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    return next();
  };
}

// Named exports for explicit route mapping across endpoints
export const requireAdmin = requireAnyRole(['ADMIN']);
export const requireContributor = requireAnyRole(['ADMIN', 'CONTRIBUTOR']);
export const requireSubscriber = requireAnyRole(['ADMIN', 'CONTRIBUTOR', 'SUBSCRIBER']);