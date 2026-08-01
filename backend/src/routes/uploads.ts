import { Router } from 'express';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { prisma } from '../lib/prisma';

const router: Router = Router();

const AUTHOR_ROLES = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

/**
 * Strict MIME allow-list per the architecture spec.
 * Anything not listed here is rejected before a URL is ever signed.
 */
const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/webp': 'webp',
  'text/csv': 'csv',
};

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const URL_TTL_SECONDS = 300; // presigned URL valid for 5 minutes

let s3Client: S3Client | null = null;

/** Lazily construct the S3 client so the API still boots without S3 env vars. */
function getS3(): S3Client | null {
  if (
    !process.env.S3_BUCKET ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY
  ) {
    return null;
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT, // Cloudflare R2 endpoint; undefined for AWS S3
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function requireAuthor(req: AuthRequest, res: any): boolean {
  if (!req.userId || !req.roles) {
    sendError(res, 'Not authenticated', 401);
    return false;
  }
  if (!req.roles.some((r) => AUTHOR_ROLES.includes(r))) {
    sendError(res, 'Access Denied: contributor role required to upload', 403);
    return false;
  }
  return true;
}

/**
 * POST /uploads/sign
 * Body: { filename, mimeType, sizeBytes, manuscriptId? }
 * Validates type/size, records an Asset row, and returns a presigned PUT URL
 * so the browser uploads directly to object storage (never through this API).
 */
router.post('/sign', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  const s3 = getS3();
  if (!s3) {
    return sendError(res, 'File storage is not configured on this server', 503);
  }

  const { filename, mimeType, sizeBytes, manuscriptId } = req.body ?? {};

  if (!filename || typeof filename !== 'string') {
    return sendError(res, 'filename is required', 400);
  }
  const extension = ALLOWED_MIME[mimeType];
  if (!extension) {
    return sendError(
      res,
      'Unsupported file type. Allowed: PDF, WebP, CSV',
      415
    );
  }
  const size = Number(sizeBytes);
  if (!size || Number.isNaN(size) || size <= 0) {
    return sendError(res, 'sizeBytes is required', 400);
  }
  if (size > MAX_BYTES) {
    return sendError(res, 'File too large (maximum 20 MB)', 413);
  }

  try {
    // If attaching to a manuscript, verify the caller owns it.
    if (manuscriptId) {
      const manuscript = await prisma.manuscript.findUnique({
        where: { id: manuscriptId },
      });
      if (!manuscript) return sendError(res, 'Manuscript not found', 404);
      if (
        manuscript.authorId !== req.userId &&
        !req.roles!.includes('ADMIN')
      ) {
        return sendError(res, 'Access Denied: not your manuscript', 403);
      }
    }

    const key = `uploads/${req.userId}/${randomUUID()}.${extension}`;
    const publicBase = (process.env.S3_PUBLIC_BASE || '').replace(/\/$/, '');
    const publicUrl = publicBase ? `${publicBase}/${key}` : null;

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ContentType: mimeType,
        ContentLength: size,
      }),
      { expiresIn: URL_TTL_SECONDS }
    );

    const asset = await prisma.asset.create({
      data: {
        key,
        filename: String(filename).slice(0, 255),
        mimeType,
        sizeBytes: size,
        publicUrl,
        ownerId: req.userId!,
        manuscriptId: manuscriptId ?? null,
      },
    });

    return sendSuccess(res, {
      assetId: asset.id,
      key,
      uploadUrl,
      publicUrl,
      expiresIn: URL_TTL_SECONDS,
    });
  } catch (err) {
    console.error('sign upload error:', err);
    return sendError(res, 'Failed to prepare upload', 500);
  }
});

/**
 * GET /uploads/manuscript/:id
 * List assets attached to a manuscript the caller owns.
 */
router.get('/manuscript/:id', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const manuscript = await prisma.manuscript.findUnique({
      where: { id: req.params.id },
    });
    if (!manuscript) return sendError(res, 'Manuscript not found', 404);

    const editor =
      req.roles!.includes('CONTRIBUTOR_EDITOR') || req.roles!.includes('ADMIN');
    if (manuscript.authorId !== req.userId && !editor) {
      return sendError(res, 'Access Denied: not your manuscript', 403);
    }

    const assets = await prisma.asset.findMany({
      where: { manuscriptId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, assets);
  } catch (err) {
    console.error('list assets error:', err);
    return sendError(res, 'Failed to load assets', 500);
  }
});

/**
 * DELETE /uploads/:assetId
 * Remove an asset record and the underlying object.
 */
router.delete('/:assetId', authMiddleware, async (req: AuthRequest, res) => {
  if (!requireAuthor(req, res)) return;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.assetId },
    });
    if (!asset) return sendError(res, 'Asset not found', 404);

    if (asset.ownerId !== req.userId && !req.roles!.includes('ADMIN')) {
      return sendError(res, 'Access Denied: not your asset', 403);
    }

    const s3 = getS3();
    if (s3) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET!,
            Key: asset.key,
          })
        );
      } catch (storageErr) {
        // Log but continue — the DB record should still be removed.
        console.error('storage delete failed:', storageErr);
      }
    }

    await prisma.asset.delete({ where: { id: req.params.assetId } });
    return sendSuccess(res, { id: req.params.assetId });
  } catch (err) {
    console.error('delete asset error:', err);
    return sendError(res, 'Failed to delete asset', 500);
  }
});

export default router;
