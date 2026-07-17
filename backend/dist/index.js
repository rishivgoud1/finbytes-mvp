"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_express3 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));

// src/routes/auth.ts
var import_express = require("express");
var import_client = require("@prisma/client");
var import_pg = require("pg");
var import_adapter_pg = require("@prisma/adapter-pg");

// src/utils/passwordHash.ts
var import_argon2 = require("argon2");
async function hashPassword(password) {
  return (0, import_argon2.hash)(password, {
    type: 2,
    // Argon2id
    memoryCost: 65536,
    // 64 MB
    timeCost: 3,
    parallelism: 4
  });
}
async function verifyPassword(password, hash2) {
  try {
    return await (0, import_argon2.verify)(hash2, password);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function findKeysDir() {
  const candidates = [
    import_path.default.join(process.cwd(), ".keys"),
    import_path.default.join(__dirname, "../.keys"),
    import_path.default.join(__dirname, "../../.keys")
  ];
  for (const dir of candidates) {
    if (import_fs.default.existsSync(import_path.default.join(dir, "private.pem"))) return dir;
  }
  throw new Error(
    `.keys directory with private.pem not found. Searched: ${candidates.join(", ")}`
  );
}
var keysDir = findKeysDir();
var PRIVATE_KEY = import_fs.default.readFileSync(import_path.default.join(keysDir, "private.pem"), "utf8");
var PUBLIC_KEY = import_fs.default.readFileSync(import_path.default.join(keysDir, "public.pem"), "utf8");
function signToken(payload) {
  return import_jsonwebtoken.default.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "1h"
  });
}
function verifyToken(token) {
  try {
    const decoded = import_jsonwebtoken.default.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"]
    });
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// src/utils/response.ts
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    code: statusCode
  });
}
function sendError(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
    code: statusCode
  });
}

// src/middleware/auth.ts
function authMiddleware(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return void res.status(401).json({
      success: false,
      error: "Missing or malformed Authorization header",
      code: 401
    });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return void res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      code: 401
    });
  }
  req.userId = payload.userId;
  req.email = payload.email;
  req.roles = payload.roles;
  next();
}

// src/routes/auth.ts
var connectionString = process.env.DATABASE_URL;
var pool = new import_pg.Pool({ connectionString });
var adapter = new import_adapter_pg.PrismaPg(pool);
var prisma = new import_client.PrismaClient({ adapter });
var router = (0, import_express.Router)();
router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return sendError(res, "Email and password are required", 400);
  }
  if (password.length < 8) {
    return sendError(res, "Password must be at least 8 characters", 400);
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, "User with this email already exists", 409);
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || email.split("@")[0]
      }
    });
    const viewerRole = await prisma.role.findUnique({
      where: { name: import_client.RoleName.VIEWER }
    });
    if (viewerRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: viewerRole.id
        }
      });
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      roles: [import_client.RoleName.VIEWER]
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
    console.error("Registration error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, "Email and password are required", 400);
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });
    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return sendError(res, "Invalid email or password", 401);
    }
    const roles = user.userRoles.map((ur) => ur.role.name);
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
    console.error("Login error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
router.get("/profile", authMiddleware, async (req, res) => {
  if (!req.userId) {
    return sendError(res, "Not authenticated", 401);
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
      return sendError(res, "User not found", 404);
    }
    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.userRoles.map((ur) => ur.role.name),
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
var auth_default = router;

// src/routes/articles.ts
var import_express2 = require("express");
var import_client3 = require("@prisma/client");

// src/lib/prisma.ts
var import_client2 = require("@prisma/client");
var import_pg2 = require("pg");
var import_adapter_pg2 = require("@prisma/adapter-pg");
var connectionString2 = process.env.DATABASE_URL;
var pool2 = new import_pg2.Pool({ connectionString: connectionString2 });
var adapter2 = new import_adapter_pg2.PrismaPg(pool2);
var prisma2 = new import_client2.PrismaClient({ adapter: adapter2 });

// src/routes/articles.ts
var router2 = (0, import_express2.Router)();
router2.get("/", authMiddleware, async (req, res) => {
  if (!req.userId || !req.roles) {
    return sendError(res, "Not authenticated", 401);
  }
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  try {
    let whereClause = {};
    if (req.roles.includes("VIEWER")) {
      whereClause.status = import_client3.ArticleStatus.PUBLISHED;
    } else if (req.roles.includes("CONTRIBUTOR_EDITOR") || req.roles.includes("ADMIN")) {
    } else if (req.roles.includes("CONTRIBUTOR_RESEARCHER")) {
      whereClause.OR = [
        { status: import_client3.ArticleStatus.PUBLISHED },
        { authorId: req.userId }
      ];
    }
    const articles = await prisma2.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, email: true, displayName: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
    const total = await prisma2.article.count({ where: whereClause });
    return sendSuccess(res, {
      articles,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error("Article fetch error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
router2.get("/:id", authMiddleware, async (req, res) => {
  if (!req.userId || !req.roles) {
    return sendError(res, "Not authenticated", 401);
  }
  const { id } = req.params;
  try {
    const article = await prisma2.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, displayName: true }
        }
      }
    });
    if (!article) {
      return sendError(res, "Article not found", 404);
    }
    const isAuthor = article.authorId === req.userId;
    const isEditor = req.roles.includes("CONTRIBUTOR_EDITOR") || req.roles.includes("ADMIN");
    const isViewer = req.roles.includes("VIEWER");
    if (isViewer && article.status !== import_client3.ArticleStatus.PUBLISHED) {
      return sendError(res, "Forbidden: only published articles are visible", 403);
    }
    if (!isAuthor && !isEditor && article.status !== import_client3.ArticleStatus.PUBLISHED) {
      return sendError(res, "Forbidden: you cannot access this draft", 403);
    }
    return sendSuccess(res, article);
  } catch (error) {
    console.error("Article fetch error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
var articles_default = router2;

// src/index.ts
var app = (0, import_express3.default)();
var PORT = process.env.PORT || 3e3;
app.use((0, import_helmet.default)());
app.use((0, import_cors.default)({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(import_express3.default.json());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/auth", auth_default);
app.use("/articles", articles_default);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    code: 404
  });
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    code: 500
  });
});
app.listen(PORT, () => {
  console.log(`\u{1F680} Finbytes API listening on http://localhost:${PORT}`);
  console.log(`   GET  /health          \u2014 health check`);
  console.log(`   POST /auth/register   \u2014 user registration`);
  console.log(`   POST /auth/login      \u2014 user authentication`);
  console.log(`   GET  /auth/profile    \u2014 fetch user profile (auth required)`);
  console.log(`   GET  /articles        \u2014 article feed (auth required)`);
  console.log(`   GET  /articles/:id    \u2014 article detail (auth required)`);
});
