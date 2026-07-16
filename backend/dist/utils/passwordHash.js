"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const argon2_1 = require("argon2");
/**
 * Hash a plaintext password using Argon2id.
 */
async function hashPassword(password) {
    return (0, argon2_1.hash)(password, {
        type: 2, // Argon2id
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
    });
}
/**
 * Verify a plaintext password against a stored Argon2id hash.
 */
async function verifyPassword(password, hash) {
    try {
        return await (0, argon2_1.verify)(hash, password);
    }
    catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}
//# sourceMappingURL=passwordHash.js.map