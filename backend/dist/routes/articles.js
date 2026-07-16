"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /articles?status=PUBLISHED&limit=20&offset=0
 * Fetch articles with role-based filtering.
 *
 * - VIEWER: only PUBLISHED articles
 * - CONTRIBUTOR_*: own drafts + all published
 * - ADMIN: all articles including drafts/review
 */
router.get('/', auth_1.authMiddleware, async (req, res) => {
    if (!req.userId || !req.roles) {
        return (0, response_1.sendError)(res, 'Not authenticated', 401);
    }
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    try {
        let whereClause = {};
        // Role-based article filtering
        if (req.roles.includes('VIEWER')) {
            // Viewers see only published articles
            whereClause.status = client_1.ArticleStatus.PUBLISHED;
        }
        else if (req.roles.includes('CONTRIBUTOR_EDITOR') || req.roles.includes('ADMIN')) {
            // Editors and admins see all articles
            // No restriction
        }
        else if (req.roles.includes('CONTRIBUTOR_RESEARCHER')) {
            // Researchers see their own articles + published
            whereClause.OR = [
                { status: client_1.ArticleStatus.PUBLISHED },
                { authorId: req.userId }
            ];
        }
        // Fetch articles with pagination
        const articles = await prisma.article.findMany({
            where: whereClause,
            include: {
                author: {
                    select: { id: true, email: true, displayName: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        // Get total count for pagination metadata
        const total = await prisma.article.count({ where: whereClause });
        return (0, response_1.sendSuccess)(res, {
            articles,
            pagination: {
                limit,
                offset,
                total,
                hasMore: offset + limit < total
            }
        });
    }
    catch (error) {
        console.error('Article fetch error:', error);
        return (0, response_1.sendError)(res, 'Internal server error', 500);
    }
});
/**
 * GET /articles/:id
 * Fetch a single article by ID with role-based access.
 */
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    if (!req.userId || !req.roles) {
        return (0, response_1.sendError)(res, 'Not authenticated', 401);
    }
    const { id } = req.params;
    try {
        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, email: true, displayName: true }
                }
            }
        });
        if (!article) {
            return (0, response_1.sendError)(res, 'Article not found', 404);
        }
        // Access control
        const isAuthor = article.authorId === req.userId;
        const isEditor = req.roles.includes('CONTRIBUTOR_EDITOR') || req.roles.includes('ADMIN');
        const isViewer = req.roles.includes('VIEWER');
        if (isViewer && article.status !== client_1.ArticleStatus.PUBLISHED) {
            return (0, response_1.sendError)(res, 'Forbidden: only published articles are visible', 403);
        }
        if (!isAuthor && !isEditor && article.status !== client_1.ArticleStatus.PUBLISHED) {
            return (0, response_1.sendError)(res, 'Forbidden: you cannot access this draft', 403);
        }
        return (0, response_1.sendSuccess)(res, article);
    }
    catch (error) {
        console.error('Article fetch error:', error);
        return (0, response_1.sendError)(res, 'Internal server error', 500);
    }
});
exports.default = router;
//# sourceMappingURL=articles.js.map