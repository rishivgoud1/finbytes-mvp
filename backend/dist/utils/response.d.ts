import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code: number;
}
/**
 * Send a standardized success response.
 */
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number): Response;
/**
 * Send a standardized error response.
 */
export declare function sendError(res: Response, error: string, statusCode?: number): Response;
