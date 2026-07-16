"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const client_1 = require("@prisma/client");
const passwordHash_1 = require("../utils/passwordHash");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const prisma = new client_1.PrismaClient();
/**
 * Controller: Register a new user
 * Route: POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, 'Email and password are required', 400);
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return (0, response_1.sendError)(res, 'A user with this email already exists', 409);
        }
        // Hash the password securely using Argon2id
        const hashedPassword = await (0, passwordHash_1.hashPassword)(password);
        // Create user in database with default SUBSCRIBER role
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                roles: ['SUBSCRIBER']
            }
        });
        // Generate JWT token
        const token = (0, jwt_1.signToken)({
            userId: newUser.id,
            email: newUser.email,
            roles: newUser.roles
        });
        return (0, response_1.sendSuccess)(res, {
            message: 'User registered successfully',
            token,
            user: { id: newUser.id, email: newUser.email, name: newUser.name, roles: newUser.roles }
        }, 201);
    }
    catch (error) {
        console.error('Registration error:', error);
        return (0, response_1.sendError)(res, 'Internal server error during registration', 500);
    }
}
/**
 * Controller: Log in an existing user
 * Route: POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, 'Email and password are required', 400);
        }
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Verify hashed password
        const isPasswordValid = await (0, passwordHash_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Generate asymmetric JWT token
        const token = (0, jwt_1.signToken)({
            userId: user.id,
            email: user.email,
            roles: user.roles
        });
        return (0, response_1.sendSuccess)(res, {
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name, roles: user.roles }
        }, 200);
    }
    catch (error) {
        console.error('Login error:', error);
        return (0, response_1.sendError)(res, 'Internal server error during login', 500);
    }
}
//# sourceMappingURL=authController.js.map