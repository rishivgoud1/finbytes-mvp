import { Router } from 'express';
import { ManuscriptStatus } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

/**
 * Public, unauthenticated read API for the website.
 * Only PUBLISHED manuscripts are ever exposed here.
 */
const router: Router = Router();

const PUBLIC_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  category: true,
  coverImage: true,
  readTime: true,
  bodyMarkdown: true,
  publishedAt: true,
  author: { select: { displayName: true, email: true } },
  assets: {
    select: { id: true, filename: true, mimeType: true, publicUrl: true },
  },
};

/** Shape a manuscript into the article format the frontend expects. */
function toArticle(m: any) {
  return {
    id: m.id,
    slug: m.slug,
    product: m.category,
    title: m.title,
    subtitle: m.subtitle ?? undefined,
    excerpt: m.excerpt ?? '',
    author: m.author?.displayName || m.author?.email || 'Finbytes',
    authorTitle: 'Contributor',
    date: m.publishedAt
      ? new Date(m.publishedAt).toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    publishedAt: m.publishedAt,
    readTime: m.readTime ?? '5 min read',
    image: m.coverImage ?? '',
    bodyMarkdown: m.bodyMarkdown,
    assets: m.assets ?? [],
  };
}

/**
 * GET /public/articles?category=&limit=
 * Published articles, newest first.
 */
router.get('/articles', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const category = req.query.category as string | undefined;

  try {
    const items = await prisma.manuscript.findMany({
      where: {
        status: ManuscriptStatus.PUBLISHED,
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: PUBLIC_SELECT,
    });

    return sendSuccess(res, items.map(toArticle));
  } catch (err) {
    console.error('public articles error:', err);
    return sendError(res, 'Failed to load articles', 500);
  }
});

/**
 * GET /public/articles/:slug
 * A single published article by slug.
 */
router.get('/articles/:slug', async (req, res) => {
  try {
    const item = await prisma.manuscript.findFirst({
      where: {
        slug: req.params.slug,
        status: ManuscriptStatus.PUBLISHED,
      },
      select: PUBLIC_SELECT,
    });

    if (!item) return sendError(res, 'Article not found', 404);
    return sendSuccess(res, toArticle(item));
  } catch (err) {
    console.error('public article error:', err);
    return sendError(res, 'Failed to load article', 500);
  }
});

export default router;
