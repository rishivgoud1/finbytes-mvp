"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const articles_1 = __importDefault(require("./routes/articles"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ─── Middleware ───────────────────────────────────────────
// Security headers
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// JSON parsing
app.use(express_1.default.json());
// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// ─── API Routes ───────────────────────────────────────────
app.use('/auth', auth_1.default);
app.use('/articles', articles_1.default);
// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 404
    });
});
// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 500
    });
});
// ─── Server Start ─────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Finbytes API listening on http://localhost:${PORT}`);
    console.log(`   GET  /health          — health check`);
    console.log(`   POST /auth/register   — user registration`);
    console.log(`   POST /auth/login      — user authentication`);
    console.log(`   GET  /auth/profile    — fetch user profile (auth required)`);
    console.log(`   GET  /articles        — article feed (auth required)`);
    console.log(`   GET  /articles/:id    — article detail (auth required)`);
});
//# sourceMappingURL=index.js.map