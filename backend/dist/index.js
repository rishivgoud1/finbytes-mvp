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
var import_express7 = __toESM(require("express"));
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
    const isEditor2 = req.roles.includes("CONTRIBUTOR_EDITOR") || req.roles.includes("ADMIN");
    const isViewer = req.roles.includes("VIEWER");
    if (isViewer && article.status !== import_client3.ArticleStatus.PUBLISHED) {
      return sendError(res, "Forbidden: only published articles are visible", 403);
    }
    if (!isAuthor && !isEditor2 && article.status !== import_client3.ArticleStatus.PUBLISHED) {
      return sendError(res, "Forbidden: you cannot access this draft", 403);
    }
    return sendSuccess(res, article);
  } catch (error) {
    console.error("Article fetch error:", error);
    return sendError(res, "Internal server error", 500);
  }
});
var articles_default = router2;

// src/routes/manuscripts.ts
var import_express3 = require("express");
var import_client4 = require("@prisma/client");
var router3 = (0, import_express3.Router)();
var AUTHOR_ROLES = ["CONTRIBUTOR_RESEARCHER", "CONTRIBUTOR_EDITOR", "ADMIN"];
var VALID_CATEGORIES = [
  "Finbytes of the Day",
  "Decode",
  "Strategy Room",
  "Power Desk",
  "Editorial"
];
function isEditor(roles = []) {
  return roles.includes("CONTRIBUTOR_EDITOR") || roles.includes("ADMIN");
}
function requireAuthor(req, res) {
  if (!req.userId || !req.roles) {
    sendError(res, "Not authenticated", 401);
    return false;
  }
  if (!req.roles.some((r) => AUTHOR_ROLES.includes(r))) {
    sendError(
      res,
      "Access Denied: contributor role required to use the authoring suite",
      403
    );
    return false;
  }
  return true;
}
router3.get("/", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  try {
    const where = isEditor(req.roles) ? {} : { authorId: req.userId };
    const manuscripts = await prisma2.manuscript.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        assets: true,
        author: { select: { id: true, email: true, displayName: true } }
      }
    });
    return sendSuccess(res, manuscripts);
  } catch (err) {
    console.error("list manuscripts error:", err);
    return sendError(res, "Failed to load manuscripts", 500);
  }
});
router3.get("/:id", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  try {
    const manuscript = await prisma2.manuscript.findUnique({
      where: { id: req.params.id },
      include: {
        assets: { orderBy: { createdAt: "desc" } },
        author: { select: { id: true, email: true, displayName: true } }
      }
    });
    if (!manuscript) return sendError(res, "Manuscript not found", 404);
    if (manuscript.authorId !== req.userId && !isEditor(req.roles)) {
      return sendError(res, "Access Denied: not your manuscript", 403);
    }
    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error("get manuscript error:", err);
    return sendError(res, "Failed to load manuscript", 500);
  }
});
router3.post("/", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  const { title, subtitle, excerpt, category, coverImage, readTime, bodyMarkdown } = req.body ?? {};
  if (!title || typeof title !== "string" || !title.trim()) {
    return sendError(res, "title is required", 400);
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return sendError(
      res,
      `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      400
    );
  }
  try {
    const manuscript = await prisma2.manuscript.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ?? null,
        excerpt: excerpt ?? null,
        category,
        coverImage: coverImage ?? null,
        readTime: readTime ?? null,
        bodyMarkdown: bodyMarkdown ?? "",
        authorId: req.userId,
        status: import_client4.ManuscriptStatus.DRAFT
      }
    });
    return sendSuccess(res, manuscript, 201);
  } catch (err) {
    console.error("create manuscript error:", err);
    return sendError(res, "Failed to create manuscript", 500);
  }
});
router3.put("/:id", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  const { title, subtitle, excerpt, category, coverImage, readTime, bodyMarkdown } = req.body ?? {};
  if (category && !VALID_CATEGORIES.includes(category)) {
    return sendError(
      res,
      `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      400
    );
  }
  try {
    const existing = await prisma2.manuscript.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) return sendError(res, "Manuscript not found", 404);
    if (existing.authorId !== req.userId && !isEditor(req.roles)) {
      return sendError(res, "Access Denied: not your manuscript", 403);
    }
    const editableStates = [
      import_client4.ManuscriptStatus.DRAFT,
      import_client4.ManuscriptStatus.REJECTED
    ];
    if (!editableStates.includes(existing.status) && !isEditor(req.roles)) {
      return sendError(
        res,
        `Cannot edit a manuscript in ${existing.status} state`,
        409
      );
    }
    const manuscript = await prisma2.manuscript.update({
      where: { id: req.params.id },
      data: {
        ...title !== void 0 ? { title: String(title).trim() } : {},
        ...subtitle !== void 0 ? { subtitle } : {},
        ...excerpt !== void 0 ? { excerpt } : {},
        ...category !== void 0 ? { category } : {},
        ...coverImage !== void 0 ? { coverImage } : {},
        ...readTime !== void 0 ? { readTime } : {},
        ...bodyMarkdown !== void 0 ? { bodyMarkdown } : {}
      }
    });
    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error("update manuscript error:", err);
    return sendError(res, "Failed to update manuscript", 500);
  }
});
router3.post("/:id/submit", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  try {
    const existing = await prisma2.manuscript.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) return sendError(res, "Manuscript not found", 404);
    if (existing.authorId !== req.userId) {
      return sendError(res, "Access Denied: not your manuscript", 403);
    }
    const submittable = [
      import_client4.ManuscriptStatus.DRAFT,
      import_client4.ManuscriptStatus.REJECTED
    ];
    if (!submittable.includes(existing.status)) {
      return sendError(
        res,
        `Only DRAFT or REJECTED manuscripts can be submitted (current: ${existing.status})`,
        409
      );
    }
    if (!existing.title.trim() || !existing.bodyMarkdown.trim()) {
      return sendError(
        res,
        "A title and body are required before submitting for review",
        400
      );
    }
    const manuscript = await prisma2.manuscript.update({
      where: { id: req.params.id },
      data: { status: import_client4.ManuscriptStatus.AWAITING_REVIEW }
    });
    return sendSuccess(res, manuscript);
  } catch (err) {
    console.error("submit manuscript error:", err);
    return sendError(res, "Failed to submit manuscript", 500);
  }
});
router3.delete("/:id", authMiddleware, async (req, res) => {
  if (!requireAuthor(req, res)) return;
  try {
    const existing = await prisma2.manuscript.findUnique({
      where: { id: req.params.id }
    });
    if (!existing) return sendError(res, "Manuscript not found", 404);
    const admin = req.roles?.includes("ADMIN");
    if (existing.authorId !== req.userId && !admin) {
      return sendError(res, "Access Denied: not your manuscript", 403);
    }
    if (existing.status !== import_client4.ManuscriptStatus.DRAFT && !admin) {
      return sendError(res, "Only DRAFT manuscripts can be deleted", 409);
    }
    await prisma2.manuscript.delete({ where: { id: req.params.id } });
    return sendSuccess(res, { id: req.params.id });
  } catch (err) {
    console.error("delete manuscript error:", err);
    return sendError(res, "Failed to delete manuscript", 500);
  }
});
var manuscripts_default = router3;

// src/routes/uploads.ts
var import_express4 = require("express");
var import_crypto = require("crypto");
var import_client_s3 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
var router4 = (0, import_express4.Router)();
var AUTHOR_ROLES2 = ["CONTRIBUTOR_RESEARCHER", "CONTRIBUTOR_EDITOR", "ADMIN"];
var ALLOWED_MIME = {
  "application/pdf": "pdf",
  "image/webp": "webp",
  "text/csv": "csv"
};
var MAX_BYTES = 20 * 1024 * 1024;
var URL_TTL_SECONDS = 300;
var s3Client = null;
function getS3() {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    return null;
  }
  if (!s3Client) {
    s3Client = new import_client_s3.S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      // Cloudflare R2 endpoint; undefined for AWS S3
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
}
function requireAuthor2(req, res) {
  if (!req.userId || !req.roles) {
    sendError(res, "Not authenticated", 401);
    return false;
  }
  if (!req.roles.some((r) => AUTHOR_ROLES2.includes(r))) {
    sendError(res, "Access Denied: contributor role required to upload", 403);
    return false;
  }
  return true;
}
router4.post("/sign", authMiddleware, async (req, res) => {
  if (!requireAuthor2(req, res)) return;
  const s3 = getS3();
  if (!s3) {
    return sendError(res, "File storage is not configured on this server", 503);
  }
  const { filename, mimeType, sizeBytes, manuscriptId } = req.body ?? {};
  if (!filename || typeof filename !== "string") {
    return sendError(res, "filename is required", 400);
  }
  const extension = ALLOWED_MIME[mimeType];
  if (!extension) {
    return sendError(
      res,
      "Unsupported file type. Allowed: PDF, WebP, CSV",
      415
    );
  }
  const size = Number(sizeBytes);
  if (!size || Number.isNaN(size) || size <= 0) {
    return sendError(res, "sizeBytes is required", 400);
  }
  if (size > MAX_BYTES) {
    return sendError(res, "File too large (maximum 20 MB)", 413);
  }
  try {
    if (manuscriptId) {
      const manuscript = await prisma2.manuscript.findUnique({
        where: { id: manuscriptId }
      });
      if (!manuscript) return sendError(res, "Manuscript not found", 404);
      if (manuscript.authorId !== req.userId && !req.roles.includes("ADMIN")) {
        return sendError(res, "Access Denied: not your manuscript", 403);
      }
    }
    const key = `uploads/${req.userId}/${(0, import_crypto.randomUUID)()}.${extension}`;
    const publicBase = (process.env.S3_PUBLIC_BASE || "").replace(/\/$/, "");
    const publicUrl = publicBase ? `${publicBase}/${key}` : null;
    const uploadUrl = await (0, import_s3_request_presigner.getSignedUrl)(
      s3,
      new import_client_s3.PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: mimeType,
        ContentLength: size
      }),
      { expiresIn: URL_TTL_SECONDS }
    );
    const asset = await prisma2.asset.create({
      data: {
        key,
        filename: String(filename).slice(0, 255),
        mimeType,
        sizeBytes: size,
        publicUrl,
        ownerId: req.userId,
        manuscriptId: manuscriptId ?? null
      }
    });
    return sendSuccess(res, {
      assetId: asset.id,
      key,
      uploadUrl,
      publicUrl,
      expiresIn: URL_TTL_SECONDS
    });
  } catch (err) {
    console.error("sign upload error:", err);
    return sendError(res, "Failed to prepare upload", 500);
  }
});
router4.get("/manuscript/:id", authMiddleware, async (req, res) => {
  if (!requireAuthor2(req, res)) return;
  try {
    const manuscript = await prisma2.manuscript.findUnique({
      where: { id: req.params.id }
    });
    if (!manuscript) return sendError(res, "Manuscript not found", 404);
    const editor = req.roles.includes("CONTRIBUTOR_EDITOR") || req.roles.includes("ADMIN");
    if (manuscript.authorId !== req.userId && !editor) {
      return sendError(res, "Access Denied: not your manuscript", 403);
    }
    const assets = await prisma2.asset.findMany({
      where: { manuscriptId: req.params.id },
      orderBy: { createdAt: "desc" }
    });
    return sendSuccess(res, assets);
  } catch (err) {
    console.error("list assets error:", err);
    return sendError(res, "Failed to load assets", 500);
  }
});
router4.delete("/:assetId", authMiddleware, async (req, res) => {
  if (!requireAuthor2(req, res)) return;
  try {
    const asset = await prisma2.asset.findUnique({
      where: { id: req.params.assetId }
    });
    if (!asset) return sendError(res, "Asset not found", 404);
    if (asset.ownerId !== req.userId && !req.roles.includes("ADMIN")) {
      return sendError(res, "Access Denied: not your asset", 403);
    }
    const s3 = getS3();
    if (s3) {
      try {
        await s3.send(
          new import_client_s3.DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: asset.key
          })
        );
      } catch (storageErr) {
        console.error("storage delete failed:", storageErr);
      }
    }
    await prisma2.asset.delete({ where: { id: req.params.assetId } });
    return sendSuccess(res, { id: req.params.assetId });
  } catch (err) {
    console.error("delete asset error:", err);
    return sendError(res, "Failed to delete asset", 500);
  }
});
var uploads_default = router4;

// src/routes/editorial.ts
var import_express5 = require("express");
var import_client5 = require("@prisma/client");
var router5 = (0, import_express5.Router)();
var EDITOR_ROLES = ["CONTRIBUTOR_EDITOR", "ADMIN"];
function requireEditor(req, res) {
  if (!req.userId || !req.roles) {
    sendError(res, "Not authenticated", 401);
    return false;
  }
  if (!req.roles.some((r) => EDITOR_ROLES.includes(r))) {
    sendError(res, "Access Denied: editorial role required", 403);
    return false;
  }
  return true;
}
async function recordAudit(params) {
  await prisma2.auditLog.create({
    data: {
      manuscriptId: params.manuscriptId,
      actorId: params.actorId,
      action: params.action,
      fromStatus: params.fromStatus ?? null,
      toStatus: params.toStatus ?? null,
      note: params.note ?? null
    }
  });
}
async function generateSlug(title, manuscriptId) {
  const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "article";
  let candidate = base;
  let suffix = 1;
  while (true) {
    const clash = await prisma2.manuscript.findUnique({
      where: { slug: candidate }
    });
    if (!clash || clash.id === manuscriptId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}
router5.get("/queue", authMiddleware, async (req, res) => {
  if (!requireEditor(req, res)) return;
  const statusParam = req.query.status;
  const defaultStates = [
    import_client5.ManuscriptStatus.AWAITING_REVIEW,
    import_client5.ManuscriptStatus.EDITOR_ASSIGNED,
    import_client5.ManuscriptStatus.APPROVED
  ];
  const where = statusParam && statusParam in import_client5.ManuscriptStatus ? { status: statusParam } : { status: { in: defaultStates } };
  try {
    const items = await prisma2.manuscript.findMany({
      where,
      orderBy: { updatedAt: "asc" },
      include: {
        author: { select: { id: true, email: true, displayName: true } },
        editor: { select: { id: true, email: true, displayName: true } },
        assets: true
      }
    });
    return sendSuccess(res, items);
  } catch (err) {
    console.error("editorial queue error:", err);
    return sendError(res, "Failed to load review queue", 500);
  }
});
router5.get("/:id/audit", authMiddleware, async (req, res) => {
  if (!requireEditor(req, res)) return;
  try {
    const logs = await prisma2.auditLog.findMany({
      where: { manuscriptId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, email: true, displayName: true } }
      }
    });
    return sendSuccess(res, logs);
  } catch (err) {
    console.error("audit fetch error:", err);
    return sendError(res, "Failed to load audit trail", 500);
  }
});
async function transition(req, res, opts) {
  if (!requireEditor(req, res)) return;
  const note = (req.body?.note ?? "").toString().trim();
  if (opts.requireNote && !note) {
    return sendError(res, "A note explaining the decision is required", 400);
  }
  try {
    const manuscript = await prisma2.manuscript.findUnique({
      where: { id: req.params.id }
    });
    if (!manuscript) return sendError(res, "Manuscript not found", 404);
    if (!opts.allowedFrom.includes(manuscript.status)) {
      return sendError(
        res,
        `Cannot ${opts.action} a manuscript in ${manuscript.status} state`,
        409
      );
    }
    const extra = opts.extraData ? await opts.extraData(manuscript) : {};
    const updated = await prisma2.manuscript.update({
      where: { id: manuscript.id },
      data: {
        status: opts.toStatus,
        ...note ? { reviewNote: note } : {},
        ...extra
      }
    });
    await recordAudit({
      manuscriptId: manuscript.id,
      actorId: req.userId,
      action: opts.action,
      fromStatus: manuscript.status,
      toStatus: opts.toStatus,
      note: note || null
    });
    return sendSuccess(res, updated);
  } catch (err) {
    console.error(`${opts.action} error:`, err);
    return sendError(res, `Failed to ${opts.action} manuscript`, 500);
  }
}
router5.post(
  "/:id/assign",
  authMiddleware,
  (req, res) => transition(req, res, {
    action: "assign",
    allowedFrom: [import_client5.ManuscriptStatus.AWAITING_REVIEW],
    toStatus: import_client5.ManuscriptStatus.EDITOR_ASSIGNED,
    extraData: () => ({ editorId: req.userId })
  })
);
router5.post(
  "/:id/approve",
  authMiddleware,
  (req, res) => transition(req, res, {
    action: "approve",
    allowedFrom: [
      import_client5.ManuscriptStatus.AWAITING_REVIEW,
      import_client5.ManuscriptStatus.EDITOR_ASSIGNED
    ],
    toStatus: import_client5.ManuscriptStatus.APPROVED,
    extraData: () => ({ editorId: req.userId })
  })
);
router5.post(
  "/:id/reject",
  authMiddleware,
  (req, res) => transition(req, res, {
    action: "reject",
    allowedFrom: [
      import_client5.ManuscriptStatus.AWAITING_REVIEW,
      import_client5.ManuscriptStatus.EDITOR_ASSIGNED,
      import_client5.ManuscriptStatus.APPROVED
    ],
    toStatus: import_client5.ManuscriptStatus.REJECTED,
    requireNote: true,
    extraData: () => ({ editorId: req.userId })
  })
);
router5.post(
  "/:id/publish",
  authMiddleware,
  (req, res) => transition(req, res, {
    action: "publish",
    allowedFrom: [
      import_client5.ManuscriptStatus.APPROVED,
      import_client5.ManuscriptStatus.EDITOR_ASSIGNED
    ],
    toStatus: import_client5.ManuscriptStatus.PUBLISHED,
    extraData: async (m) => ({
      editorId: req.userId,
      publishedAt: m.publishedAt ?? /* @__PURE__ */ new Date(),
      slug: m.slug ?? await generateSlug(m.title, m.id)
    })
  })
);
router5.post(
  "/:id/unpublish",
  authMiddleware,
  (req, res) => transition(req, res, {
    action: "unpublish",
    allowedFrom: [import_client5.ManuscriptStatus.PUBLISHED],
    toStatus: import_client5.ManuscriptStatus.APPROVED
  })
);
var editorial_default = router5;

// src/routes/publicArticles.ts
var import_express6 = require("express");
var import_client6 = require("@prisma/client");
var router6 = (0, import_express6.Router)();
var PUBLIC_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  category: true,
  coverImage: true,
  readTime: true,
  bodyMarkdown: true,
  publishedAt: true,
  author: { select: { displayName: true, email: true } },
  assets: {
    select: { id: true, filename: true, mimeType: true, publicUrl: true }
  }
};
function toArticle(m) {
  return {
    id: m.id,
    slug: m.slug,
    product: m.category,
    title: m.title,
    subtitle: m.subtitle ?? void 0,
    excerpt: m.excerpt ?? "",
    author: m.author?.displayName || m.author?.email || "Finbytes",
    authorTitle: "Contributor",
    date: m.publishedAt ? new Date(m.publishedAt).toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "",
    publishedAt: m.publishedAt,
    readTime: m.readTime ?? "5 min read",
    image: m.coverImage ?? "",
    bodyMarkdown: m.bodyMarkdown,
    assets: m.assets ?? []
  };
}
router6.get("/articles", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const category = req.query.category;
  try {
    const items = await prisma2.manuscript.findMany({
      where: {
        status: import_client6.ManuscriptStatus.PUBLISHED,
        ...category ? { category } : {}
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: PUBLIC_SELECT
    });
    return sendSuccess(res, items.map(toArticle));
  } catch (err) {
    console.error("public articles error:", err);
    return sendError(res, "Failed to load articles", 500);
  }
});
router6.get("/articles/:slug", async (req, res) => {
  try {
    const item = await prisma2.manuscript.findFirst({
      where: {
        slug: req.params.slug,
        status: import_client6.ManuscriptStatus.PUBLISHED
      },
      select: PUBLIC_SELECT
    });
    if (!item) return sendError(res, "Article not found", 404);
    return sendSuccess(res, toArticle(item));
  } catch (err) {
    console.error("public article error:", err);
    return sendError(res, "Failed to load article", 500);
  }
});
var publicArticles_default = router6;

// src/index.ts
var app = (0, import_express7.default)();
var PORT = process.env.PORT || 3e3;
app.use((0, import_helmet.default)());
app.use((0, import_cors.default)({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(import_express7.default.json());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/auth", auth_default);
app.use("/articles", articles_default);
app.use("/manuscripts", manuscripts_default);
app.use("/uploads", uploads_default);
app.use("/editorial", editorial_default);
app.use("/public", publicArticles_default);
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
