/**
 * Grant a role to a user.
 *
 * Usage:
 *   npx tsx scripts/grant-role.ts <email> <ROLE_NAME>
 *
 * Example:
 *   npx tsx scripts/grant-role.ts info@finbytesgrant.com CONTRIBUTOR_RESEARCHER
 *
 * Valid roles: VIEWER, CONTRIBUTOR_RESEARCHER, CONTRIBUTOR_EDITOR, ADMIN
 */
import { PrismaClient, RoleName } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [email, roleArg] = process.argv.slice(2);

  if (!email || !roleArg) {
    console.error('Usage: npx tsx scripts/grant-role.ts <email> <ROLE_NAME>');
    process.exit(1);
  }

  const roleName = roleArg as RoleName;
  if (!Object.values(RoleName).includes(roleName)) {
    console.error(
      `Invalid role "${roleArg}". Valid: ${Object.values(RoleName).join(', ')}`
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    console.error(`Role ${roleName} not found — run the seed first.`);
    process.exit(1);
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  const roles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: { role: true },
  });

  console.log(`✓ ${email} now has roles: ${roles.map((r) => r.role.name).join(', ')}`);
  console.log('Log out and log back in so your token picks up the new role.');
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
