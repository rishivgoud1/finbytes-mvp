import { Router } from 'express';
import { ManuscriptStatus } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

const router: Router = Router();

const EDITOR_ROLES = ['CONTRIBUTOR_EDITOR', 'ADMIN'];

/** Guard: caller must hold an editorial role. */
function requireEditor(req: AuthRequest, res: any): boolean {
  if (!req.userId || !req.roles) {
    sendError(res, 'Not authenticated', 401);
    return false;
  }
  if (!req.roles.some((r) => EDITOR_ROLES.includes(r))) {
    sendError(res, 'Access Denied: editorial role required', 403);
    return false;
  }
  return true;
}

/** Write an immutable audit row for every workflow transition. */
async function recordAudit(params: {
  manuscriptId: string;
  actorId: string;
  action: string;
  fromStatus?: ManuscriptStatus | null;
  toStatus?: ManuscriptStatus | null;
  note?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      manuscriptId: params.manuscriptId,
      actorId: params.actorId,
      action: params.action,
      fromStatus: params.fromStatus ?? null,
      toStatus: params.toStatus ?? null,
      note: params.note ?? null,
    },
  });
}

/** Build a URL-safe slug, ensuring uniqueness against existing manuscripts. */
async function generateSlug(title: string, manuscriptId: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'article';

  let candidate = base;
  let suffix = 1;

  while (true) {
    const clash = await prisma.manuscript.findUnique({
      where: { slug: candidate },
    });
    if (!clash || clash.id === manuscriptId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

/**
 * GET /editorial/queue
 * Manuscripts awaiting editorial attention.
 * Optional ?status= filter; defaults to the active review states.
 */
router.get('/queue', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireEditor(req, res)) return;

  const statusParam = req.query.status as string | undefined;
  const defaultStates: ManuscriptStatus[] = [
    ManuscriptStatus.AWAITING_REVIEW,
    ManuscriptStatus.EDITOR_ASSIGNED,
    ManuscriptStatus.APPROVED,
  ];

  const where =
    statusParam && statusParam in ManuscriptStatus
      ? { status: statusParam as ManuscriptStatus }
      : { status: { in: defaultStates } };

  try {
    const items = await prisma.manuscript.findMany({
      where,
      orderBy: { updatedAt: 'asc' },
      include: {
        author: { select: { id: true, email: true, displayName: true } },
        editor: { select: { id: true, email: true, displayName: true } },
        assets: true,
      },
    });
    return sendSuccess(res, items);
  } catch (err) {
    console.error('editorial queue error:', err);
    return sendError(res, 'Failed to load review queue', 500);
  }
});

/**
 * GET /editorial/:id/audit
 * Full workflow history for one manuscript.
 */
router.get('/:id/audit', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireEditor(req, res)) return;

  try {
    const logs = await prisma.auditLog.findMany({
      where: { manuscriptId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, email: true, displayName: true } },
      },
    });
    return sendSuccess(res, logs);
  } catch (err) {
    console.error('audit fetch error:', err);
    return sendError(res, 'Failed to load audit trail', 500);
  }
});

/**
 * Shared transition handler: validates the state machine, applies the
 * update, and records an audit entry.
 */
async function transition(
  req: AuthRequest,
  res: any,
  opts: {
    action: string;
    allowedFrom: ManuscriptStatus[];
    toStatus: ManuscriptStatus;
    extraData?: (m: any) => Promise<Record<string, any>> | Record<string, any>;
    requireNote?: boolean;
  }
) {
  if (!requireEditor(req, res)) return;

  const note = (req.body?.note ?? '').toString().trim();
  if (opts.requireNote && !note) {
    return sendError(res, 'A note explaining the decision is required', 400);
  }

  try {
    const manuscript = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
    });
    if (!manuscript) return sendError(res, 'Manuscript not found', 404);

    if (!opts.allowedFrom.includes(manuscript.status)) {
      return sendError(
        res,
        `Cannot ${opts.action} a manuscript in ${manuscript.status} state`,
        409
      );
    }

    const extra = opts.extraData ? await opts.extraData(manuscript) : {};

    const updated = await prisma.manuscript.update({
      where: { id: manuscript.id },
      data: {
        status: opts.toStatus,
        ...(note ? { reviewNote: note } : {}),
        ...extra,
      },
    });

    await recordAudit({
      manuscriptId: manuscript.id,
      actorId: req.userId!,
      action: opts.action,
      fromStatus: manuscript.status,
      toStatus: opts.toStatus,
      note: note || null,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    console.error(`${opts.action} error:`, err);
    return sendError(res, `Failed to ${opts.action} manuscript`, 500);
  }
}

/** POST /editorial/:id/assign — take ownership of a submission. */
router.post('/:id/assign', authMiddleware, (req: AuthRequest, res) =>
  transition(req, res, {
    action: 'assign',
    allowedFrom: [ManuscriptStatus.AWAITING_REVIEW],
    toStatus: ManuscriptStatus.EDITOR_ASSIGNED,
    extraData: () => ({ editorId: req.userId! }),
  })
);

/** POST /editorial/:id/approve — cleared for publication. */
router.post('/:id/approve', authMiddleware, (req: AuthRequest, res) =>
  transition(req, res, {
    action: 'approve',
    allowedFrom: [
      ManuscriptStatus.AWAITING_REVIEW,
      ManuscriptStatus.EDITOR_ASSIGNED,
    ],
    toStatus: ManuscriptStatus.APPROVED,
    extraData: () => ({ editorId: req.userId! }),
  })
);

/** POST /editorial/:id/reject — send back to the author with a note. */
router.post('/:id/reject', authMiddleware, (req: AuthRequest, res) =>
  transition(req, res, {
    action: 'reject',
    allowedFrom: [
      ManuscriptStatus.AWAITING_REVIEW,
      ManuscriptStatus.EDITOR_ASSIGNED,
      ManuscriptStatus.APPROVED,
    ],
    toStatus: ManuscriptStatus.REJECTED,
    requireNote: true,
    extraData: () => ({ editorId: req.userId! }),
  })
);

/** POST /editorial/:id/publish — goes live on the public site. */
router.post('/:id/publish', authMiddleware, (req: AuthRequest, res) =>
  transition(req, res, {
    action: 'publish',
    allowedFrom: [
      ManuscriptStatus.APPROVED,
      ManuscriptStatus.EDITOR_ASSIGNED,
    ],
    toStatus: ManuscriptStatus.PUBLISHED,
    extraData: async (m) => ({
      editorId: req.userId!,
      publishedAt: m.publishedAt ?? new Date(),
      slug: m.slug ?? (await generateSlug(m.title, m.id)),
    }),
  })
);

/** POST /editorial/:id/unpublish — pull a live article back to APPROVED. */
router.post('/:id/unpublish', authMiddleware, (req: AuthRequest, res) =>
  transition(req, res, {
    action: 'unpublish',
    allowedFrom: [ManuscriptStatus.PUBLISHED],
    toStatus: ManuscriptStatus.APPROVED,
  })
);

export default router;
