"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const contentController_1 = require("../controllers/contentController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// --- AUTHENTICATION ENDPOINTS ---
router.post('/auth/register', authController_1.register);
router.post('/auth/login', authController_1.login);
// --- PROTECTED CONTENT ENDPOINTS ---
router.get('/content/news', auth_1.authenticate, contentController_1.getNewsFeed);
router.get('/content/research', auth_1.authenticate, rbac_1.requireContributor, contentController_1.getResearchInsights);
router.get('/content/admin-logs', auth_1.authenticate, rbac_1.requireAdmin, contentController_1.getAdminLogs);
exports.default = router;
//# sourceMappingURL=api.js.map