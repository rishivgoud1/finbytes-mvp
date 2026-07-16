import { Router } from 'express';
import { PrismaClient, RoleName } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest, authMiddleware } from '../middleware/auth';

// 1. Initialize the connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Instantiate the adapter and PrismaClient
const adapter = new PrismaPg(pool);
const prisma: PrismaClient = new PrismaClient({ adapter });
const router: Router = Router();

// ... rest of your code ...
// ... rest of your code ...
/**
 * POST /auth/register
 * Register a new user with email and password.
 * Assigns VIEWER role by default.
 */
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  // Input validation
  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  if (password.length < 8) {
    return sendError(res, 'Password must be at least 8 characters', 400);
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with VIEWER role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || email.split('@')[0]
      }
    });

    // Assign VIEWER role
    const viewerRole = await prisma.role.findUnique({
      where: { name: RoleName.VIEWER }
    });

    if (viewerRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: viewerRole.id
        }
      });
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      roles: [RoleName.VIEWER]
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

/**
 * POST /auth/login
 * Authenticate with email and password.
 * Returns JWT token and user profile.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email and password are required', 400);
  }

  try {
    // Fetch user with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Verify password using top-level import
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Extract role names
    const roles = user.userRoles.map(ur => ur.role.name);

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      roles
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

/**
 * GET /auth/profile
 * Fetch current authenticated user's profile.
 * Requires valid JWT token.
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return sendError(res, 'Not authenticated', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles.map(ur => ur.role.name),
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

export default router;