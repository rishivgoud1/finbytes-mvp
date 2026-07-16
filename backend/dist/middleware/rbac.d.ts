import { Request, Response, NextFunction } from 'express';
/**
 * Generic factory to create role-checking middlewares.
 * Checks if the authenticated user has at least one of the allowed roles.
 */
export declare function requireAnyRole(allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireContributor: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireSubscriber: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
