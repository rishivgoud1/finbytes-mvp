# Finishing Setup — Three Steps

Work through these in order. Each step says what to run, what you should see, and what to do if it goes wrong.

---

## STEP 1 — Get login working

### 1.1 Set your password

Open PowerShell (not Command Prompt) and run:

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main\backend
$env:DATABASE_URL="postgresql://postgres.jhkifhfuypejgdhabwhg:Finbytes2026DB@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
npx tsx scripts/set-password.ts info@finbytesgrant.com Finbytes2026Login
```

**Expect:** `✓ Password updated for info@finbytesgrant.com`

**If it says "No user found"** → the account doesn't exist. Create it:
```powershell
Invoke-RestMethod -Uri "https://api.finbytes.in/auth/register" -Method Post -ContentType "application/json" -Body '{"email":"info@finbytesgrant.com","password":"Finbytes2026Login","displayName":"Rishi"}'
```

### 1.2 Verify against the API

```powershell
Invoke-RestMethod -Uri "https://api.finbytes.in/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"info@finbytesgrant.com","password":"Finbytes2026Login"}'
```

**Expect:** a response containing `success: True` and a token.

This is the important checkpoint — if the API accepts your login, the browser will too.

### 1.3 Confirm your roles

```powershell
npx tsx scripts/grant-role.ts info@finbytesgrant.com CONTRIBUTOR_EDITOR
```

**Expect:** `✓ info@finbytesgrant.com now has roles: VIEWER, CONTRIBUTOR_RESEARCHER, CONTRIBUTOR_EDITOR`

You need CONTRIBUTOR_RESEARCHER (to write) and CONTRIBUTOR_EDITOR (to publish).

### 1.4 Push the pending code fixes

There are uncommitted fixes: failed logins no longer redirect, prefilled dev credentials removed, and the password script itself.

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main
git add -A
git commit -m "fix login redirect, add password script"
git push
```

Then in hPanel, check the **frontend** app's Deployments tab until the new commit shows **Completed**.

### 1.5 Sign in

Go to `finbytes.in` → **Sign in** (top bar) → enter:

- Email: `info@finbytesgrant.com`
- Password: `Finbytes2026Login`

**Expect:** you land on the homepage, and the top bar now shows **Studio** and **Sign out**.

**If you see "Invalid email or password"** → step 1.2 would have failed too; recheck that.
**If it redirects but no Studio link** → sign out and sign in once more (token refresh), and confirm 1.3 listed the contributor roles.

---

## STEP 2 — Enable file uploads

Uploads fail with "File storage is not configured" until these environment variables exist on the server.

### 2.1 Add the variables

hPanel → **Websites** → **api.finbytes.in** → **Environment variables**.

Keep the existing `DATABASE_URL` and `NODE_ENV`, and add these six (each Key in the left box, Value in the right box — use "Add more" for each new row):

| Key | Value |
|---|---|
| `S3_ENDPOINT` | `https://1d1686e571b68501337e2ba89393b903.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `finbytes-assets` |
| `S3_ACCESS_KEY_ID` | your R2 Access Key ID |
| `S3_SECRET_ACCESS_KEY` | your R2 Secret Access Key |
| `S3_PUBLIC_BASE` | `https://pub-ba33513f03d74785a27f191a495cca81.r2.dev` |

If you no longer have the R2 keys, create a new token: Cloudflare → R2 → **Manage API Tokens** → **Create API Token** → **Object Read & Write** → scope to `finbytes-assets`. Leave IP filtering empty.

### 2.2 Redeploy

Click **Redeploy** on the backend app and wait for **Completed**. Environment changes do not apply until a redeploy finishes.

### 2.3 Confirm the bucket CORS policy

Cloudflare → R2 → `finbytes-assets` → **Settings** → **CORS Policy**. It should contain:

```json
[
  {
    "AllowedOrigins": ["https://finbytes.in", "http://localhost:3001"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Without this, the browser blocks the upload even though the server signs it correctly.

Also confirm **Public Development URL** is enabled on that Settings page — that's what makes uploaded files viewable.

---

## STEP 3 — Test the full publishing loop

Do this signed in, ideally in a normal (non-incognito) window.

### 3.1 Create a manuscript

`finbytes.in/studio` → **New manuscript**. Fill in:

- **Headline** — e.g. `Testing the Finbytes Publishing Pipeline`
- **Subtitle** — optional
- **Excerpt** — one or two sentences (this shows on homepage cards; without it the card looks bare)
- **Cover image URL** — any image link, e.g.
  `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=700&fit=crop&auto=format`
- **Read time** — e.g. `4 min read`
- **Category** — e.g. `Decode`
- **Body** — some Markdown:

```markdown
## The first test

This paragraph has **bold text** and *italics*.

> A pull quote to check the styling.

- First point
- Second point
```

Click **Preview** to check it renders, then **Save draft**.

**Expect:** the status line shows "Saved" and the URL changes from `/studio/new` to `/studio/<id>`.

### 3.2 Attach a file (tests Step 2)

Click **Attach PDF / WebP / CSV** and pick a small PDF or CSV.

**Expect:** "Uploading…" then "Uploaded", and the file appears under *Attached assets*. Click its name — it should open from the r2.dev URL.

**If you see "File storage is not configured"** → Step 2.1/2.2 didn't take effect; recheck the env vars and redeploy.
**If you see "Upload failed"** → it's the bucket CORS policy (Step 2.3).
**If you see "Only PDF, WebP and CSV files are allowed"** → that's correct behaviour; try a real PDF.

### 3.3 Submit for review

Click **Submit for review**.

**Expect:** status becomes **AWAITING REVIEW**, and the fields lock (they're read-only while under review — that's intended).

### 3.4 Review and publish

Go to `/studio` → **Review queue** → select your manuscript. Then:

1. **Assign to me** → status becomes EDITOR ASSIGNED
2. **Approve** → status becomes APPROVED
3. **Publish** → status becomes PUBLISHED

**Expect:** the Audit trail at the bottom lists every action with your name and timestamps.

Also try **Reject** on a second test manuscript — it should refuse without a note, and with a note it sends the manuscript back to the author as editable again.

### 3.5 Confirm it's live

- Open `finbytes.in` — your article should be at the top of "Latest From Finbytes"
- Open its category page (e.g. `finbytes.in/decode`) — it should be there too
- Click the article — it opens on its own page via the auto-generated slug
- Check the raw API: `https://api.finbytes.in/public/articles` should list it as JSON

**If the article doesn't appear**, hard-refresh (Ctrl+Shift+R). If the CDN is switched back on, flush its cache or re-enable Development mode.

---

## When all three steps pass

Weeks 4, 5 and 6 are genuinely complete and verified:

- Search and multi-filter (Week 4)
- Authoring suite with file uploads (Week 5)
- Editorial workflow, audit log and live publishing (Week 6)

Remaining known gaps, none blocking: no public sign-up page, no password reset, seeded test accounts can't log in, and a failed upload can leave an unused asset row.
