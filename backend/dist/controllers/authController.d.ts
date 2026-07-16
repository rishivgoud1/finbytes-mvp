import { Request, Response } from 'express';
/**
 * Controller: Register a new user
 * Route: POST /api/auth/register
 */
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Controller: Log in an existing user
 * Route: POST /api/auth/login
 */
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
