"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSubscriber = exports.requireContributor = exports.requireAdmin = void 0;
exports.requireAnyRole = requireAnyRole;
const response_1 = require("../utils/response");
/**
 * Generic factory to create role-checking middlewares.
 * Checks if the authenticated user has at least one of the allowed roles.
 */
function requireAnyRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Authentication context missing', 500);
        }
        const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasPermission) {
            return (0, response_1.sendError)(res, `Access Denied: Requires one of the following roles: [${allowedRoles.join(', ')}]`, 403);
        }
        return next();
    };
}
// Named exports for explicit route mapping across endpoints
exports.requireAdmin = requireAnyRole(['ADMIN']);
exports.requireContributor = requireAnyRole(['ADMIN', 'CONTRIBUTOR']);
exports.requireSubscriber = requireAnyRole(['ADMIN', 'CONTRIBUTOR', 'SUBSCRIBER']);
//# sourceMappingURL=rbac.js.map