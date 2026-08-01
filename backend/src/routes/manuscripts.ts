import { Router } from 'express';
import { ManuscriptStatus } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// Roles permitted to use the authoring suite.
const AUTHOR_ROLES = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

const VALID_CATEGORIES = [
  'Finbytes of the Day',
  'Decode',
  'Strategy Room',
  'Power Desk',
  'Editorial',
];

/** True when the caller holds an editorial/admin role. */
function isEditor(roles: string[] = []): boolean {
  return roles.includes('CONTRIBUTOR_EDITOR') || roles.includes('ADMIN');
}

/** Guard: caller must be authenticated AND hold an authoring role. */
function requireAuthor(req: AuthRequest, res: any): boolean {
  if (!req.userId || !req.roles) {
    sendError(res, 'Not authenticated', 401);
    return false;
  }
  if (!req.roles.some((r) => AUTHOR_ROLES.includes(r))) {
    sendError(
      res,
      'Access Denied: contributor role required to use the authoring suite',
      403
    );
    return false;
  }
  return true;
}

/**
 * GET /manuscripts
 * List manuscripts. Researchers see only their own; editors/admins see all.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const where = isEditor(req.roles) ? {} : { authorId: req.userId! };

    const manuscripts = await prisma.manuscript.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        assets: true,
        author: { select: { id: true, email: true, displayName: true } },
      },
    });

    return sendSuccess(res, manuscripts);
  } catch (err) {
    console.error('list manuscripts error:', err);
    return sendError(res, 'Failed to load manuscripts', 500);
  }
});

/**
 * GET /manuscripts/:id
 * Fetch one manuscript. Must be the owner, or an editor/admin.
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const manuscript = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
      include: {
        assets: { orderBy: { createdAt: 'desc' } },
        author: { select: { id: true, email: true, displayName: true } },
      },
    });

    if (!manuscript) return sendError(res, 'Manuscript not found', 404);

    if (manuscript.authorId !== req.userId && !isEditor(req.roles)) {
      return sendError(res, 'Access Denied: not your manuscript', 403);
    }

    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error('get manuscript error:', err);
    return sendError(res, 'Failed to load manuscript', 500);
  }
});

/**
 * POST /manuscripts
 * Create a new DRAFT owned by the caller.
 */
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  const { title, subtitle, category, bodyMarkdown } = req.body ?? {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return sendError(res, 'title is required', 400);
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return sendError(
      res,
      `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      400
    );
  }

  try {
    const manuscript = await prisma.manuscript.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ?? null,
        category,
        bodyMarkdown: bodyMarkdown ?? '',
        authorId: req.userId!,
        status: ManuscriptStatus.DRAFT,
      },
    });

    return sendSuccess(res, manuscript, 201);
  } catch (err) {
    console.error('create manuscript error:', err);
    return sendError(res, 'Failed to create manuscript', 500);
  }
});

/**
 * PUT /manuscripts/:id
 * Update own manuscript. Only DRAFT or REJECTED manuscripts are editable
 * by the author — once submitted, content is frozen pending review.
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  const { title, subtitle, category, bodyMarkdown } = req.body ?? {};

  if (category && !VALID_CATEGORIES.includes(category)) {
    return sendError(
      res,
      `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      400
    );
  }

  try {
    const existing = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return sendError(res, 'Manuscript not found', 404);

    if (existing.authorId !== req.userId && !isEditor(req.roles)) {
      return sendError(res, 'Access Denied: not your manuscript', 403);
    }

    const editableStates: ManuscriptStatus[] = [
      ManuscriptStatus.DRAFT,
      ManuscriptStatus.REJECTED,
    ];
    if (!editableStates.includes(existing.status) && !isEditor(req.roles)) {
      return sendError(
        res,
        `Cannot edit a manuscript in ${existing.status} state`,
        409
      );
    }

    const manuscript = await prisma.manuscript.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(bodyMarkdown !== undefined ? { bodyMarkdown } : {}),
      },
    });

    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error('update manuscript error:', err);
    return sendError(res, 'Failed to update manuscript', 500);
  }
});

/**
 * POST /manuscripts/:id/submit
 * Author transition: DRAFT | REJECTED -> AWAITING_REVIEW.
 * Researchers can never publish — that is an editor action (Week 6).
 */
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const existing = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return sendError(res, 'Manuscript not found', 404);

    if (existing.authorId !== req.userId) {
      return sendError(res, 'Access Denied: not your manuscript', 403);
    }

    const submittable: ManuscriptStatus[] = [
      ManuscriptStatus.DRAFT,
      ManuscriptStatus.REJECTED,
    ];
    if (!submittable.includes(existing.status)) {
      return sendError(
        res,
        `Only DRAFT or REJECTED manuscripts can be submitted (current: ${existing.status})`,
        409
      );
    }

    if (!existing.title.trim() || !existing.bodyMarkdown.trim()) {
      return sendError(
        res,
        'A title and body are required before submitting for review',
        400
      );
    }

    const manuscript = await prisma.manuscript.update({
      where: { id: req.params.id },
      data: { status: ManuscriptStatus.AWAITING_REVIEW },
    });

    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error('submit manuscript error:', err);
    return sendError(res, 'Failed to submit manuscript', 500);
  }
});

/**
 * DELETE /manuscripts/:id
 * Authors may delete their own drafts only.
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const existing = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return sendError(res, 'Manuscript not found', 404);

    const admin = req.roles?.includes('ADMIN');
    if (existing.authorId !== req.userId && !admin) {
      return sendError(res, 'Access Denied: not your manuscript', 403);
    }
    if (existing.status !== ManuscriptStatus.DRAFT && !admin) {
      return sendError(res, 'Only DRAFT manuscripts can be deleted', 409);
    }

    await prisma.manuscript.delete({ where: { id: req.params.id } });
    return sendSuccess(res, { id: req.params.id });
  } catch (err) {
    console.error('delete manuscript error:', err);
    return sendError(res, 'Failed to delete manuscript', 500);
  }
});

export default router;
