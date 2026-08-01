# Week 5 — Setup & Verification

The code is written. These are the steps only you can run (installs, migration, env vars).

---

## 1. Install the backend AWS SDK (needed for R2 uploads)

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main\backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

No new frontend packages are required — the Markdown editor is dependency-free.

---

## 2. Create the database tables

Run against your Supabase database (same connection string used in Week 4):

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main\backend
$env:DATABASE_URL="postgresql://postgres:Pranathi%401957@db.jhkifhfuypejgdhabwhg.supabase.co:5432/postgres"
npx prisma migrate dev --name authoring_suite
npx prisma generate
```

**Verify:** the command reports the migration applied, and `npx prisma migrate status` says the schema is up to date.

---

## 3. Rebuild the backend

```powershell
npm run build
```

**Verify:** it ends with `dist\index.js` and no errors.

---

## 4. Add the R2 environment variables in Hostinger

hPanel → **api.finbytes.in** app → **Environment variables** → add these five (keep the existing `DATABASE_URL` and `NODE_ENV`):

| Key | Value |
|---|---|
| `S3_ENDPOINT` | `https://1d1686e571b68501337e2ba89393b903.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `finbytes-assets` |
| `S3_ACCESS_KEY_ID` | *(your R2 Access Key ID)* |
| `S3_SECRET_ACCESS_KEY` | *(your R2 Secret Access Key)* |
| `S3_PUBLIC_BASE` | `https://pub-ba33513f03d74785a27f191a495cca81.r2.dev` |

---

## 5. Push and deploy

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main
git add -A
git commit -m "week 5: contributor authoring suite"
git push
```

Both Hostinger apps auto-deploy. Confirm each shows the new commit as **Current / Completed**.

---

## 6. Give yourself a contributor role

The studio requires `CONTRIBUTOR_RESEARCHER`, `CONTRIBUTOR_EDITOR`, or `ADMIN`. If your account is only a VIEWER, grant a role via Prisma Studio:

```powershell
cd backend
npx prisma studio
```

Open the `user_roles` table → add a row linking your `userId` to the `CONTRIBUTOR_RESEARCHER` role id (from the `roles` table). Log out and back in so the new JWT carries the role.

---

## 7. Verification checklist

Sign in on `finbytes.in`, then:

- [ ] Visit `/studio` — the dashboard loads (not the "access required" screen)
- [ ] Click **New manuscript** → enter a headline, pick a category, write some Markdown
- [ ] Click **Preview** in the editor → headings/bold/lists render
- [ ] Click **Save draft** → shows "Saved" and the URL changes to `/studio/<id>`
- [ ] Return to `/studio` → the draft is listed with status **DRAFT**
- [ ] Click **Attach PDF / WebP / CSV** → upload a small PDF or CSV → shows "Uploaded" and it appears under *Attached assets*
- [ ] Click the asset filename → the file opens from the r2.dev URL
- [ ] Try attaching a `.txt` or `.exe` → rejected ("Only PDF, WebP and CSV files are allowed")
- [ ] Click **Submit for review** → status changes to **AWAITING REVIEW** and the fields lock
- [ ] Press Submit again → refused (already submitted)
- [ ] Log in as a VIEWER account → `/studio` shows "Contributor access required"

---

## What Week 5 delivers

- `manuscripts` and `assets` tables with a six-state workflow enum
- `GET/POST/PUT/DELETE /manuscripts` + `POST /manuscripts/:id/submit`, all owner-scoped with role guards
- Researchers can submit (DRAFT → AWAITING_REVIEW) but **cannot publish** — publishing is Week 6's editor flow
- `POST /uploads/sign` issues 5-minute presigned R2 URLs; files upload browser→bucket, never through the API
- Strict MIME allow-list (PDF/WebP/CSV) and a 20 MB cap, enforced server-side before any URL is signed
- Every upload tracked as an `Asset` row with owner, size, type, and public URL
- `/studio` dashboard, `/studio/[id]` Markdown editor with live preview, contributor-only route guard

## Not included (by design)

The public site still renders its existing local content. Wiring published manuscripts through to the live site belongs with **Week 6**, when editors gain the approve/publish transition.
