"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
function authMiddleware(req, res, next) {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    if (!token) {
        return void res.status(401).json({
            success: false,
            error: 'Missing or malformed Authorization header',
            code: 401
        });
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        return void res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            code: 401
        });
    }
    req.userId = payload.userId;
    req.email = payload.email;
    req.roles = payload.roles;
    next();
}
//# sourceMappingURL=auth.js.map