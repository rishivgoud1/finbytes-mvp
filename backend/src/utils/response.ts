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
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    code: statusCode
  });
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    code: statusCode
  });
}