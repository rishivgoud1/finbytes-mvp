/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `manuscripts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "manuscripts" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "editorId" TEXT,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "readTime" TEXT,
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "manuscriptId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "fromStatus" "ManuscriptStatus",
    "toStatus" "ManuscriptStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_manuscriptId_idx" ON "audit_logs"("manuscriptId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "manuscripts_slug_key" ON "manuscripts"("slug");

-- CreateIndex
CREATE INDEX "manuscripts_publishedAt_idx" ON "manuscripts"("publishedAt");

-- AddForeignKey
ALTER TABLE "manuscripts" ADD CONSTRAINT "manuscripts_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "manuscripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
