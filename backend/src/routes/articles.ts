import { Router } from 'express';
import { PrismaClient, ArticleStatus } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

import { prisma } from '../lib/prisma'; // Import the shared instance

const router: Router = Router();

/**
 * GET /articles?status=PUBLISHED&limit=20&offset=0
 * Fetch articles with role-based filtering.
 * 
 * - VIEWER: only PUBLISHED articles
 * - CONTRIBUTOR_*: own drafts + all published
 * - ADMIN: all articles including drafts/review
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId || !req.roles) {
    return sendError(res, 'Not authenticated', 401);
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    let whereClause: any = {};

    // Role-based article filtering
    if (req.roles.includes('VIEWER')) {
      // Viewers see only published articles
      whereClause.status = ArticleStatus.PUBLISHED;
    } else if (req.roles.includes('CONTRIBUTOR_EDITOR') || req.roles.includes('ADMIN')) {
      // Editors and admins see all articles
      // No restriction
    } else if (req.roles.includes('CONTRIBUTOR_RESEARCHER')) {
      // Researchers see their own articles + published
      whereClause.OR = [
        { status: ArticleStatus.PUBLISHED },
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

    return sendSuccess(res, {
      articles,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

/**
 * GET /articles/:id
 * Fetch a single article by ID with role-based access.
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId || !req.roles) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { id } = req.params;

  try {
    const article = await prisma.article.findUnique({
      where: { id: id as string },
      include: {
        author: {
          select: { id: true, email: true, displayName: true }
        }
      }
    });

    if (!article) {
      return sendError(res, 'Article not found', 404);
    }

    // Access control
    const isAuthor = article.authorId === req.userId;
    const isEditor = req.roles.includes('CONTRIBUTOR_EDITOR') || req.roles.includes('ADMIN');
    const isViewer = req.roles.includes('VIEWER');

    if (isViewer && article.status !== ArticleStatus.PUBLISHED) {
      return sendError(res, 'Forbidden: only published articles are visible', 403);
    }

    if (!isAuthor && !isEditor && article.status !== ArticleStatus.PUBLISHED) {
      return sendError(res, 'Forbidden: you cannot access this draft', 403);
    }

    return sendSuccess(res, article);
  } catch (error) {
    console.error('Article fetch error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

export default router;
