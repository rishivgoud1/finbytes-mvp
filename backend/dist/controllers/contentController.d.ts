import { Request, Response } from 'express';
/**
 * Controller: Get Public News Feed
 * Accessible by: ALL users (Subscribers, Contributors, Admins)
 * Route: GET /api/content/news
 */
export declare function getNewsFeed(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Controller: Get Premium Research Insights
 * Accessible by: CONTRIBUTORS and ADMINS only
 * Route: GET /api/content/research
 */
export declare function getResearchInsights(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Controller: Get System Audit Logs
 * Accessible by: ADMINS only
 * Route: GET /api/content/admin-logs
 */
export declare function getAdminLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
