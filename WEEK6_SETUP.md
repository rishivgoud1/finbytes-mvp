# Week 6 — Editorial Review, Audit Log & Live Publishing

Week 6 closes the loop: an author submits, an editor reviews and publishes, and the article appears on finbytes.in. Every transition is recorded in an immutable audit log.

---

## The publishing workflow

```
Author (Researcher)                Editor
─────────────────────              ─────────────────────
DRAFT
  │ submit
  ▼
AWAITING_REVIEW ───────────────►  assign  → EDITOR_ASSIGNED
                                   approve → APPROVED
                                   publish → PUBLISHED   ← live on finbytes.in
                                   reject  → REJECTED (back to author, note required)
                                   unpublish (PUBLISHED → APPROVED)
```

Authors can edit while in DRAFT or REJECTED; content locks once submitted.

---

## 1. Run the migration

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main\backend
$env:DATABASE_URL="postgresql://postgres.jhkifhfuypejgdhabwhg:Finbytes2026DB@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
npx prisma migrate dev --name editorial_workflow
npx prisma generate
npm run build
```

**Verify:** migration applies with no errors and the build ends with `dist\index.js`.

---

## 2. Push and deploy

```powershell
cd C:\Users\HP\Downloads\mvp-model-main\mvp-model-main
git add -A
git commit -m "week 6: editorial workflow, audit log, live publishing"
git push
```

Both Hostinger apps auto-deploy. Confirm each shows the new commit as Completed.

---

## 3. Give yourself the editor role

You need both roles to test the full loop (author *and* editor):

```powershell
cd backend
npx tsx scripts/grant-role.ts info@finbytesgrant.com CONTRIBUTOR_EDITOR
```

Log out and back in on the site so your token carries the new role.

---

## 4. Publish your first database article — end to end

1. `finbytes.in/studio` → **New manuscript**
2. Fill in: headline, excerpt, **cover image URL**, read time, category
3. Write the body in Markdown → **Save draft**
4. **Submit for review** → status becomes AWAITING REVIEW
5. Go to **Review queue** (button on the studio dashboard)
6. Select the manuscript → **Assign to me** → **Approve** → **Publish**
7. Open `finbytes.in` — your article now appears at the top of the homepage and on its category page
8. Click it — the article page loads from the database via its generated slug

---

## 5. Verification checklist

- [ ] Migration applied; `manuscripts` has slug/publishedAt/editorId, `audit_logs` table exists
- [ ] Author can submit; content locks after submission
- [ ] Editor sees the item in **Review queue**
- [ ] Assign → Approve → Publish transitions all succeed
- [ ] Reject without a note is refused; with a note it returns the manuscript to the author (editable again)
- [ ] Published article appears on the homepage and its category page
- [ ] Article detail page opens via the auto-generated slug
- [ ] **Audit trail** on the review page lists every action with actor and timestamp
- [ ] `https://api.finbytes.in/public/articles` returns your published article as JSON
- [ ] A Viewer account cannot reach `/studio/review` (access-required screen)
- [ ] Unpublish pulls the article off the public site

---

## How the public site works now

`useArticles()` (in `lib/useArticles.ts`) fetches published manuscripts from `/public/articles` and merges them **ahead of** the original built-in articles in `lib/articles.ts`. Both render through the same cards and article view.

This means:

- Your existing hardcoded content stays visible — nothing was removed
- New published articles appear above it, newest first
- If the API is unreachable, the site silently falls back to the local content and never breaks

When you eventually want the site to be database-only, delete the entries in `lib/articles.ts` — no other change is needed.

---

## New API surface

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /editorial/queue?status=` | Editor/Admin | Review queue |
| `GET /editorial/:id/audit` | Editor/Admin | Full workflow history |
| `POST /editorial/:id/assign` | Editor/Admin | Take ownership |
| `POST /editorial/:id/approve` | Editor/Admin | Clear for publication |
| `POST /editorial/:id/reject` | Editor/Admin | Return to author (note required) |
| `POST /editorial/:id/publish` | Editor/Admin | Go live, generates slug |
| `POST /editorial/:id/unpublish` | Editor/Admin | Pull back to APPROVED |
| `GET /public/articles` | Public | Published articles for the website |
| `GET /public/articles/:slug` | Public | One published article |

---

## Notes for Week 7+

**Week 7:** Typography, dark mode & WCAG AA accessibility
**Week 8:** Stripe subscription & paywall
**Week 9:** Data visualizations + Live Sandbox
**Week 10:** SHA-256 integrity engine & version history — builds directly on the `audit_logs` table created here
