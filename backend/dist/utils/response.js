"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
/**
 * Send a standardized success response.
 */
function sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
        code: statusCode
    });
}
/**
 * Send a standardized error response.
 */
function sendError(res, error, statusCode = 400) {
    return res.status(statusCode).json({
        success: false,
        error,
        code: statusCode
    });
}
//# sourceMappingURL=response.js.map