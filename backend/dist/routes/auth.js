"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const passwordHash_1 = require("../utils/passwordHash");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * POST /auth/register
 * Register a new user with email and password.
 * Assigns VIEWER role by default.
 */
router.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;
    // Input validation
    if (!email || !password) {
        return (0, response_1.sendError)(res, 'Email and password are required', 400);
    }
    if (password.length < 8) {
        return (0, response_1.sendError)(res, 'Password must be at least 8 characters', 400);
    }
    try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return (0, response_1.sendError)(res, 'User with this email already exists', 409);
        }
        // Hash password
        const passwordHash = await (0, passwordHash_1.hashPassword)(password);
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
            where: { name: client_1.RoleName.VIEWER }
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
        const token = (0, jwt_1.signToken)({
            userId: user.id,
            email: user.email,
            roles: [client_1.RoleName.VIEWER]
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName
            },
            token
        }, 201);
    }
    catch (error) {
        console.error('Registration error:', error);
        return (0, response_1.sendError)(res, 'Internal server error', 500);
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
        return (0, response_1.sendError)(res, 'Email and password are required', 400);
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
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Verify password
        const { verifyPassword } = await import('../utils/passwordHash');
        const passwordValid = await verifyPassword(password, user.passwordHash);
        if (!passwordValid) {
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Extract role names
        const roles = user.userRoles.map(ur => ur.role.name);
        // Generate token
        const token = (0, jwt_1.signToken)({
            userId: user.id,
            email: user.email,
            roles
        });
        return (0, response_1.sendSuccess)(res, {
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                roles
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return (0, response_1.sendError)(res, 'Internal server error', 500);
    }
});
/**
 * GET /auth/profile
 * Fetch current authenticated user's profile.
 * Requires valid JWT token.
 */
router.get('/profile', auth_1.authMiddleware, async (req, res) => {
    if (!req.userId) {
        return (0, response_1.sendError)(res, 'Not authenticated', 401);
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
            return (0, response_1.sendError)(res, 'User not found', 404);
        }
        return (0, response_1.sendSuccess)(res, {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            roles: user.userRoles.map(ur => ur.role.name),
            createdAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        return (0, response_1.sendError)(res, 'Internal server error', 500);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map