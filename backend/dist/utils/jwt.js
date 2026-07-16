"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Load RSA keys from your secure keys directory
const privateKeyPath = path_1.default.join(__dirname, '../../.keys/private.pem');
const publicKeyPath = path_1.default.join(__dirname, '../../.keys/public.pem');
const PRIVATE_KEY = fs_1.default.readFileSync(privateKeyPath, 'utf8');
const PUBLIC_KEY = fs_1.default.readFileSync(publicKeyPath, 'utf8');
/**
 * Sign a JWT token with RS256 (RSA signature).
 * Token expires in 1 hour by default.
 */
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: '1h'
    });
}
/**
 * Verify and decode a JWT token using the public key.
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256']
        });
        return decoded;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
/**
 * Extract JWT from Bearer authorization header.
 */
function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
//# sourceMappingURL=jwt.js.map