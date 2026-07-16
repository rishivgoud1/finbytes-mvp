"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsFeed = getNewsFeed;
exports.getResearchInsights = getResearchInsights;
exports.getAdminLogs = getAdminLogs;
const response_1 = require("../utils/response");
/**
 * Controller: Get Public News Feed
 * Accessible by: ALL users (Subscribers, Contributors, Admins)
 * Route: GET /api/content/news
 */
async function getNewsFeed(req, res) {
    const publicNews = [
        {
            id: 'news-1',
            title: 'Global Markets Open with Steady Gains',
            summary: 'Major indexes show positive momentum amid refreshing tech sector earnings reports.',
            publishedAt: new Date()
        },
        {
            id: 'news-2',
            title: 'Introduction to Compound Interest Basics',
            summary: 'A simple, foundational guide to understanding how time boosts your personal savings architecture.',
            publishedAt: new Date()
        }
    ];
    return (0, response_1.sendSuccess)(res, {
        scope: 'SUBSCRIBER_FEED',
        count: publicNews.length,
        articles: publicNews
    });
}
/**
 * Controller: Get Premium Research Insights
 * Accessible by: CONTRIBUTORS and ADMINS only
 * Route: GET /api/content/research
 */
async function getResearchInsights(req, res) {
    const premiumResearch = [
        {
            id: 'res-101',
            title: 'Deep-Dive Analysis: The 2026 Macroeconomic Shifts',
            author: 'Senior Research Analyst',
            insights: 'An extensive framework evaluating central bank rate movements and liquidity maps.',
            confidentiality: 'Restricted - Contributor Tier'
        }
    ];
    return (0, response_1.sendSuccess)(res, {
        scope: 'CONTRIBUTOR_RESEARCH',
        userContext: {
            email: req.user?.email,
            activeRoles: req.user?.roles
        },
        data: premiumResearch
    });
}
/**
 * Controller: Get System Audit Logs
 * Accessible by: ADMINS only
 * Route: GET /api/content/admin-logs
 */
async function getAdminLogs(req, res) {
    const systemLogs = [
        {
            timestamp: new Date(),
            event: 'SECURITY_KEY_ROTATION',
            status: 'SUCCESS',
            message: 'Asymmetric cryptographic infrastructure verified.'
        },
        {
            timestamp: new Date(),
            event: 'DATABASE_MIGRATION',
            status: 'SYNCED',
            message: 'Prisma Client schema synced cleanly with schema.prisma.'
        }
    ];
    return (0, response_1.sendSuccess)(res, {
        scope: 'ADMIN_SYSTEM_LOGS',
        systemAlert: 'Highly Confidential - Root View Only',
        logs: systemLogs
    });
}
//# sourceMappingURL=contentController.js.map