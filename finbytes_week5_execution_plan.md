# Finbytes Media & Research Platform
## Week 5 Developer Implementation Plan
### Contributor Authoring Suite — Markdown Editor · Signed-URL Uploads · MIME Validation · Artifact Metadata

---

## Overview

This is a sequential, copy-paste-ready execution guide for **Week 5: Contributor Authoring Suite**, giving Researcher-role contributors a workspace to draft manuscripts, attach datasets/figures, and submit for editorial review — **without** the ability to self-publish to live. Each step builds on the Week 1–4 foundation — follow them in order.

The authoring flow respects the RBAC matrix: a **Researcher** has full CRUD on their *own* drafts and can upload assets, but cannot move a manuscript to `PUBLISHED`. That transition belongs to an **Editor** (built in Week 6).

**Prerequisites:**
- ✅ Week 1 complete: PostgreSQL, Prisma schema, 4 seeded RBAC roles
- ✅ Week 2 complete: Express API with JWT + RBAC route guards
- ✅ Week 3 complete: Next.js frontend live (navbar, auth context, article pages)
- ✅ Week 4 complete: search + multi-filter shipped
- ✅ Backend health check: `curl https://api.finbytes.in/health` returns 200
- ✅ An S3-compatible bucket exists (Cloudflare R2 or AWS S3) with credentials — used for signed-URL uploads

**Tech Stack (Week 5 additions):**
- **Editor:** Markdown editor (`@uiw/react-md-editor`) with live preview
- **Object storage:** Cloudflare R2 / AWS S3 via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- **Upload flow:** browser → request presigned PUT URL from API → upload straight to bucket
- **Validation:** strict MIME allow-list — `application/pdf`, `image/webp`, `text/csv`
- **Data:** `Manuscript` + `Asset` Prisma models tracking authorship, state, and artifact metadata

**Deliverables (Definition of Done):**
- Researcher can create, edit, list, and delete their own draft manuscripts
- Manuscripts have a state machine field defaulting to `DRAFT`; Researchers can submit to `AWAITING_REVIEW` but no further
- Secure signed-URL uploads for PDF/WebP/CSV with server-side MIME + size enforcement
- Every upload is tracked as an `Asset` row (filename, MIME, size, owner, manuscript link)
- Authoring UI at `/studio` with editor, asset panel, and submit action
- RBAC enforced end-to-end — a Viewer cannot reach authoring routes; a Researcher cannot publish

---

## STEP 1: DATABASE — MANUSCRIPT & ASSET MODELS

### 1.1 — Extend the Prisma schema

**`./backend/prisma/schema.prisma`** — add the enum and two models:

```prisma
enum ManuscriptStatus {
  DRAFT
  AWAITING_REVIEW
  EDITOR_ASSIGNED
  APPROVED
  PUBLISHED
  REJECTED
}

model Manuscript {
  id          String            @id @default(cuid())
  title       String
  subtitle    String?
  category    String
  bodyMarkdown String           @default("")
  status      ManuscriptStatus  @default(DRAFT)
  authorId    String
  author      User              @relation(fields: [authorId], references: [id])
  assets      Asset[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([authorId])
  @@index([status])
}

model Asset {
  id           String     @id @default(cuid())
  key          String     @unique          // storage object key
  filename     String
  mimeType     String
  sizeBytes    Int
  ownerId      String
  owner        User        @relation(fields: [ownerId], references: [id])
  manuscriptId String?
  manuscript   Manuscript? @relation(fields: [manuscriptId], references: [id])
  createdAt    DateTime    @default(now())

  @@index([ownerId])
  @@index([manuscriptId])
}
```

Add the back-relations on the existing `User` model:

```prisma
model User {
  // ...existing fields...
  manuscripts Manuscript[]
  assets      Asset[]
}
```

### 1.2 — Migrate

```bash
cd backend
npx prisma migrate dev --name authoring_suite
npx prisma generate
```

### 1.3 — Verify

```sql
\d "Manuscript"    -- confirm columns + ManuscriptStatus enum default DRAFT
\d "Asset"         -- confirm mimeType, sizeBytes, ownerId, manuscriptId
```

---

## STEP 2: BACKEND — RBAC GUARD & MANUSCRIPT ROUTES

### 2.1 — Role guard middleware (if not already present)

**`./backend/src/middleware/rbac.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

// Usage: router.post('/', requireAuth, requireRole('CONTRIBUTOR_RESEARCHER','ADMIN'), handler)
export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles: string[] = req.user?.roles ?? [];
    if (!roles.some((r) => allowed.includes(r))) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 403 });
    }
    next();
  };
}
```

### 2.2 — Manuscript routes (owner-scoped CRUD)

**`./backend/src/routes/manuscripts.ts`**

```typescript
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

const AUTHORS = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

// List my manuscripts
router.get('/', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const items = await prisma.manuscript.findMany({
    where: { authorId: req.user!.userId },
    orderBy: { updatedAt: 'desc' },
    include: { assets: true },
  });
  res.json({ success: true, data: items, code: 200 });
});

// Get one (must own it, unless editor/admin)
router.get('/:id', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const m = await prisma.manuscript.findUnique({
    where: { id: req.params.id },
    include: { assets: true },
  });
  if (!m) return res.status(404).json({ success: false, error: 'Not found', code: 404 });

  const roles = req.user!.roles;
  const isEditor = roles.includes('CONTRIBUTOR_EDITOR') || roles.includes('ADMIN');
  if (m.authorId !== req.user!.userId && !isEditor) {
    return res.status(403).json({ success: false, error: 'Forbidden', code: 403 });
  }
  res.json({ success: true, data: m, code: 200 });
});

// Create draft
router.post('/', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const { title, subtitle, category, bodyMarkdown } = req.body;
  if (!title || !category) {
    return res.status(400).json({ success: false, error: 'title and category required', code: 400 });
  }
  const m = await prisma.manuscript.create({
    data: {
      title, subtitle, category,
      bodyMarkdown: bodyMarkdown ?? '',
      authorId: req.user!.userId,
      status: 'DRAFT',
    },
  });
  res.status(201).json({ success: true, data: m, code: 201 });
});

// Update own draft
router.put('/:id', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const existing = await prisma.manuscript.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Not found', code: 404 });
  if (existing.authorId !== req.user!.userId) {
    return res.status(403).json({ success: false, error: 'Forbidden', code: 403 });
  }

  const { title, subtitle, category, bodyMarkdown } = req.body;
  const m = await prisma.manuscript.update({
    where: { id: req.params.id },
    data: { title, subtitle, category, bodyMarkdown },
  });
  res.json({ success: true, data: m, code: 200 });
});

// Submit for review — Researcher may go DRAFT -> AWAITING_REVIEW ONLY.
router.post('/:id/submit', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const m = await prisma.manuscript.findUnique({ where: { id: req.params.id } });
  if (!m) return res.status(404).json({ success: false, error: 'Not found', code: 404 });
  if (m.authorId !== req.user!.userId) {
    return res.status(403).json({ success: false, error: 'Forbidden', code: 403 });
  }
  if (m.status !== 'DRAFT') {
    return res.status(409).json({ success: false, error: 'Only DRAFT can be submitted', code: 409 });
  }
  const updated = await prisma.manuscript.update({
    where: { id: req.params.id },
    data: { status: 'AWAITING_REVIEW' },
  });
  res.json({ success: true, data: updated, code: 200 });
});

// Delete own draft
router.delete('/:id', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const m = await prisma.manuscript.findUnique({ where: { id: req.params.id } });
  if (!m) return res.status(404).json({ success: false, error: 'Not found', code: 404 });
  if (m.authorId !== req.user!.userId) {
    return res.status(403).json({ success: false, error: 'Forbidden', code: 403 });
  }
  await prisma.manuscript.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: { id: req.params.id }, code: 200 });
});

export default router;
```

### 2.3 — Register the router

**`./backend/src/index.ts`** — mount it:

```typescript
import manuscriptRoutes from './routes/manuscripts';
// ...
app.use('/manuscripts', manuscriptRoutes);
```

### 2.4 — Verify

```bash
# needs a Researcher Bearer token — export it as $TOK
curl -X POST https://api.finbytes.in/manuscripts \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"title":"Test Draft","category":"Decode"}'

curl https://api.finbytes.in/manuscripts -H "Authorization: Bearer $TOK"

# RBAC: a Viewer token must get 403
curl https://api.finbytes.in/manuscripts -H "Authorization: Bearer $VIEWER_TOK"
```

---

## STEP 3: BACKEND — SIGNED-URL UPLOADS & MIME VALIDATION

### 3.1 — Environment variables

**`./backend/.env`** (and set the same in the Hostinger backend app's Environment variables):

```dotenv
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com   # omit for AWS S3
S3_REGION=auto
S3_BUCKET=finbytes-assets
S3_ACCESS_KEY_ID=xxxxxxxx
S3_SECRET_ACCESS_KEY=xxxxxxxx
S3_PUBLIC_BASE=https://assets.finbytes.in                    # public read base URL
```

### 3.2 — Install the SDK

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3.3 — Storage client + upload routes

**`./backend/src/routes/uploads.ts`**

```typescript
import { Router } from 'express';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
const AUTHORS = ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'];

// Strict allow-list: MIME -> extension. Anything else is rejected.
const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/webp': 'webp',
  'text/csv': 'csv',
};
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,       // undefined for AWS S3
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

// 1) Ask for a presigned PUT URL (validates MIME + size up front)
router.post('/sign', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const { filename, mimeType, sizeBytes, manuscriptId } = req.body;

  if (!ALLOWED[mimeType]) {
    return res.status(415).json({ success: false, error: 'Unsupported file type', code: 415 });
  }
  if (!sizeBytes || sizeBytes > MAX_BYTES) {
    return res.status(413).json({ success: false, error: 'File too large (max 20MB)', code: 413 });
  }

  const key = `uploads/${req.user!.userId}/${randomUUID()}.${ALLOWED[mimeType]}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: 300 } // 5 minutes
  );

  // Pre-record the asset (confirmed in step 2)
  const asset = await prisma.asset.create({
    data: {
      key, filename, mimeType, sizeBytes,
      ownerId: req.user!.userId,
      manuscriptId: manuscriptId ?? null,
    },
  });

  res.json({
    success: true,
    data: { uploadUrl: url, key, assetId: asset.id,
            publicUrl: `${process.env.S3_PUBLIC_BASE}/${key}` },
    code: 200,
  });
});

// 2) List assets for a manuscript (owner-scoped)
router.get('/manuscript/:id', requireAuth, requireRole(...AUTHORS), async (req, res) => {
  const assets = await prisma.asset.findMany({
    where: { manuscriptId: req.params.id, ownerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: assets, code: 200 });
});

export default router;
```

Mount it in **`./backend/src/index.ts`**:

```typescript
import uploadRoutes from './routes/uploads';
app.use('/uploads', uploadRoutes);
```

### 3.4 — Verify

```bash
# valid type returns an uploadUrl
curl -X POST https://api.finbytes.in/uploads/sign \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"filename":"data.csv","mimeType":"text/csv","sizeBytes":1024}'

# rejected type returns 415
curl -X POST https://api.finbytes.in/uploads/sign \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"filename":"x.exe","mimeType":"application/x-msdownload","sizeBytes":1024}'
```

---

## STEP 4: FRONTEND — API CLIENT

**`./frontend/apps/web/src/lib/api.ts`** — add authoring + upload helpers:

```typescript
export const manuscriptsAPI = {
  list:   () => apiCall('/manuscripts'),
  get:    (id: string) => apiCall(`/manuscripts/${id}`),
  create: (payload: any) => apiCall('/manuscripts', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: any) => apiCall(`/manuscripts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  submit: (id: string) => apiCall(`/manuscripts/${id}/submit`, { method: 'POST' }),
  remove: (id: string) => apiCall(`/manuscripts/${id}`, { method: 'DELETE' }),
};

export const uploadsAPI = {
  sign: (payload: { filename: string; mimeType: string; sizeBytes: number; manuscriptId?: string }) =>
    apiCall<{ uploadUrl: string; key: string; assetId: string; publicUrl: string }>(
      '/uploads/sign', { method: 'POST', body: JSON.stringify(payload) }
    ),
  forManuscript: (id: string) => apiCall(`/uploads/manuscript/${id}`),
};

// Upload a File directly to the bucket using a presigned URL.
export async function uploadFile(
  file: File,
  manuscriptId?: string
): Promise<{ ok: boolean; publicUrl?: string; error?: string }> {
  const signed = await uploadsAPI.sign({
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    manuscriptId,
  });
  if (!signed.success || !signed.data) return { ok: false, error: signed.error };

  const put = await fetch(signed.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) return { ok: false, error: 'Upload failed' };
  return { ok: true, publicUrl: signed.data.publicUrl };
}
```

---

## STEP 5: FRONTEND — AUTHORING STUDIO UI

### 5.1 — Install the Markdown editor

```bash
cd frontend/apps/web
npm install @uiw/react-md-editor
```

### 5.2 — Studio editor page

**`./frontend/apps/web/src/app/studio/[id]/page.tsx`**

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { manuscriptsAPI, uploadFile, uploadsAPI } from '@/lib/api';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const CATEGORIES = ['Finbytes of the Day', 'Decode', 'Strategy Room', 'Power Desk', 'Editorial'];

export default function StudioEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Decode');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [assets, setAssets] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (id === 'new') return;
    manuscriptsAPI.get(id).then((res) => {
      if (res.success && res.data) {
        const m = res.data as any;
        setTitle(m.title); setSubtitle(m.subtitle ?? '');
        setCategory(m.category); setBody(m.bodyMarkdown ?? '');
        setStatus(m.status); setAssets(m.assets ?? []);
      }
    });
  }, [id]);

  const save = useCallback(async () => {
    setSaving(true); setMsg('');
    const payload = { title, subtitle, category, bodyMarkdown: body };
    const res = id === 'new'
      ? await manuscriptsAPI.create(payload)
      : await manuscriptsAPI.update(id, payload);
    setSaving(false);
    if (res.success) {
      setMsg('Saved');
      if (id === 'new' && (res.data as any)?.id) {
        router.replace(`/studio/${(res.data as any).id}`);
      }
    } else {
      setMsg(res.error || 'Save failed');
    }
  }, [id, title, subtitle, category, body, router]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('Uploading…');
    const r = await uploadFile(file, id === 'new' ? undefined : id);
    if (r.ok) {
      setMsg('Uploaded');
      if (id !== 'new') {
        const list = await uploadsAPI.forManuscript(id);
        if (list.success) setAssets(list.data as any[]);
      }
    } else {
      setMsg(r.error || 'Upload failed');
    }
  };

  const submit = async () => {
    if (id === 'new') { setMsg('Save first'); return; }
    const res = await manuscriptsAPI.submit(id);
    if (res.success) { setStatus('AWAITING_REVIEW'); setMsg('Submitted for review'); }
    else setMsg(res.error || 'Submit failed');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C9A84C]">
          {status.replace('_', ' ')}
        </span>
        <div className="flex gap-3 items-center">
          {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
          <button onClick={save} disabled={saving}
            className="border border-border px-4 py-2 text-sm hover:border-[#C9A84C]">
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button onClick={submit} disabled={status !== 'DRAFT'}
            className="bg-[#C9A84C] text-black px-4 py-2 text-sm font-semibold disabled:opacity-40">
            Submit for review
          </button>
        </div>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline"
        className="w-full text-[28px] font-bold [font-family:var(--ff-display)] border-b border-border pb-2 mb-4 bg-transparent focus:outline-none" />
      <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle / deck"
        className="w-full text-lg italic text-muted-foreground border-b border-border pb-2 mb-4 bg-transparent focus:outline-none" />

      <div className="flex items-center gap-4 mb-6">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-border p-2 text-sm bg-transparent">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className="text-sm border border-border px-4 py-2 cursor-pointer hover:border-[#C9A84C]">
          Attach PDF / WebP / CSV
          <input type="file" accept=".pdf,.webp,.csv,application/pdf,image/webp,text/csv"
            onChange={onUpload} className="hidden" />
        </label>
      </div>

      <div data-color-mode="light">
        <MDEditor value={body} onChange={(v) => setBody(v ?? '')} height={480} />
      </div>

      {assets.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C9A84C] mb-3">
            Attached assets
          </p>
          <ul className="space-y-1 text-sm">
            {assets.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-border py-2">
                <span>{a.filename}</span>
                <span className="text-muted-foreground">{a.mimeType} · {(a.sizeBytes/1024).toFixed(0)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 5.3 — Studio dashboard (list of my manuscripts)

**`./frontend/apps/web/src/app/studio/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { manuscriptsAPI } from '@/lib/api';

export default function StudioDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    manuscriptsAPI.list().then((res) => {
      if (res.success) setItems(res.data as any[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[30px] sm:text-[38px] font-bold [font-family:var(--ff-display)]">
          My Manuscripts
        </h1>
        <Link href="/studio/new"
          className="bg-[#C9A84C] text-black px-4 py-2 text-sm font-semibold">
          + New manuscript
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No manuscripts yet. Create your first draft.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((m) => (
            <li key={m.id}>
              <Link href={`/studio/${m.id}`} className="flex justify-between py-4 hover:text-[#C9A84C]">
                <span className="font-semibold [font-family:var(--ff-display)]">{m.title}</span>
                <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                  {m.status.replace('_', ' ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5.4 — Guard the studio for contributors only

**`./frontend/apps/web/src/app/studio/layout.tsx`**

```typescript
'use client';

import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-16">Loading…</div>;

  const canAuthor = user?.roles?.some((r) =>
    ['CONTRIBUTOR_RESEARCHER', 'CONTRIBUTOR_EDITOR', 'ADMIN'].includes(r)
  );

  if (!canAuthor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="[font-family:var(--ff-display)] text-xl mb-2">Contributor access required</p>
        <p className="text-sm text-muted-foreground mb-4">
          The authoring studio is available to Researcher and Editor accounts.
        </p>
        <Link href="/login" className="text-[#C9A84C] underline">Sign in</Link>
      </div>
    );
  }
  return <>{children}</>;
}
```

---

## STEP 6: INSTALLATION & STARTUP

```bash
# Backend
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npx prisma migrate dev --name authoring_suite
npx prisma generate
npm run dev

# Frontend (new terminal)
cd frontend/apps/web
npm install @uiw/react-md-editor
npm run dev
```

Open `http://localhost:3001/studio` (signed in as a Researcher).

---

## STEP 7: DEPLOYMENT

```bash
# 1. Migrate PRODUCTION database (set prod DATABASE_URL first)
cd backend
npx prisma migrate deploy

# 2. Add the S3_* env vars to the Hostinger BACKEND app (Environment variables), then redeploy it

# 3. Merge & push — both Web Apps auto-deploy
cd ../..
git add -A
git commit -m "week 5: contributor authoring suite (editor + signed-URL uploads)"
git push
```

Confirm the bucket's CORS policy allows `PUT` from `https://finbytes.in`, and public read from `S3_PUBLIC_BASE`.

---

## STEP 8: VERIFICATION CHECKLIST

```bash
# 1. Migration applied
npx prisma migrate status        # up to date

# 2. Researcher can create + list
curl -X POST https://api.finbytes.in/manuscripts -H "Authorization: Bearer $TOK" \
  -H "Content-Type: application/json" -d '{"title":"T","category":"Decode"}'
curl https://api.finbytes.in/manuscripts -H "Authorization: Bearer $TOK"

# 3. Viewer gets 403 on authoring routes
# 4. Submit moves DRAFT -> AWAITING_REVIEW; a second submit returns 409
# 5. /uploads/sign accepts pdf/webp/csv, rejects others with 415, oversize with 413
# 6. Frontend: /studio lists drafts; /studio/new saves; file attach uploads to bucket
```

**Done when:**
- [ ] `Manuscript` + `Asset` tables live in production
- [ ] Researcher can create, edit, list, delete own drafts
- [ ] Submit transitions DRAFT → AWAITING_REVIEW; Researcher cannot publish
- [ ] Viewer receives 403 on `/manuscripts` and `/uploads/*`
- [ ] Signed-URL upload works for PDF/WebP/CSV; other MIME types rejected (415); >20 MB rejected (413)
- [ ] Every upload creates an `Asset` row with correct owner + metadata
- [ ] `/studio` dashboard + `/studio/[id]` editor render and save
- [ ] Studio guarded — non-contributors see the access-required screen
- [ ] Deployed and smoke-tested on `finbytes.in` + `api.finbytes.in`

---

## NOTES FOR WEEK 6+

**Week 6:** Editorial review & audit log — Editor dashboards, state machine (AWAITING_REVIEW → EDITOR_ASSIGNED → APPROVED → PUBLISHED), immutable audit tables, status notifications
**Week 7:** Typography, dark mode & WCAG AA accessibility
**Week 8:** Stripe subscription & paywall
**Week 9:** Data visualizations + Live Sandbox
**Week 10:** SHA-256 integrity engine & version history (builds on the `Manuscript` + `Asset` records created here)

---

**Week 5 Complete ✅ — Contributor Authoring Suite Live**
