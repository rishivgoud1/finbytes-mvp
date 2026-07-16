import { PrismaClient, RoleName, ArticleStatus } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Placeholder hash for Week 1 — Week 2 swaps this for argon2.hash()
function mockPasswordHash(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex')
  return `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`
}

const TEST_USERS = [
  { email: 'viewer@finbytes.dev',     displayName: 'Alex Viewer',          password: 'DevViewer2024!',     role: RoleName.VIEWER },
  { email: 'researcher@finbytes.dev', displayName: 'Dr. Jordan Researcher', password: 'DevResearcher2024!', role: RoleName.CONTRIBUTOR_RESEARCHER },
  { email: 'editor@finbytes.dev',     displayName: 'Morgan Editor',        password: 'DevEditor2024!',      role: RoleName.CONTRIBUTOR_EDITOR },
  { email: 'admin@finbytes.dev',      displayName: 'System Admin',         password: 'DevAdmin2024!',       role: RoleName.ADMIN },
]

const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [RoleName.VIEWER]: 'Read-only access to published articles',
  [RoleName.CONTRIBUTOR_RESEARCHER]: 'Create and manage own draft articles',
  [RoleName.CONTRIBUTOR_EDITOR]: 'Review, edit, and publish any article',
  [RoleName.ADMIN]: 'Full system access including RBAC management',
}

async function main() {
  console.log('Seeding roles...')
  const roleRecords: Record<string, { id: string }> = {}
  for (const name of Object.values(RoleName)) {
    roleRecords[name] = await prisma.role.upsert({
      where: { name },
      update: { description: ROLE_DESCRIPTIONS[name] },
      create: { name, description: ROLE_DESCRIPTIONS[name] },
    })
  }

  console.log('Seeding test users...')
  const createdUsers: Record<string, { id: string }> = {}
  for (const u of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.displayName },
      create: {
        email: u.email,
        displayName: u.displayName,
        passwordHash: mockPasswordHash(u.password),
      },
    })
    createdUsers[u.role] = user

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roleRecords[u.role].id } },
      update: {},
      create: { userId: user.id, roleId: roleRecords[u.role].id },
    })

    console.log(`  ✓ ${u.role.padEnd(24)} ${u.email} / ${u.password}`)
  }

  console.log('Seeding sample articles...')
  const researcher = createdUsers[RoleName.CONTRIBUTOR_RESEARCHER]
  const editor = createdUsers[RoleName.CONTRIBUTOR_EDITOR]

  await prisma.article.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Q1 Market Volatility Outlook',
        subtitle: 'A first look at emerging risk signals',
        body: 'Draft body content for the Q1 outlook piece...',
        status: ArticleStatus.DRAFT,
        authorId: researcher.id,
      },
      {
        title: 'Sector Rotation: Energy vs. Tech',
        subtitle: 'Comparative analysis for institutional readers',
        body: 'In-review body content comparing sector performance...',
        status: ArticleStatus.IN_REVIEW,
        authorId: researcher.id,
      },
      {
        title: 'Year-End Macro Recap',
        subtitle: 'Published flagship research piece',
        body: 'Published body content summarizing the year...',
        status: ArticleStatus.PUBLISHED,
        authorId: editor.id,
      },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch(e => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })