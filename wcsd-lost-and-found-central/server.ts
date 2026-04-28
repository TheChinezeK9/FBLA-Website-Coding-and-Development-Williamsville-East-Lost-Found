import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const db = new Database("database.db");

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    grade TEXT,
    studentId TEXT,
    joinedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    addedAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS claimed_logs (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

const pruneExpiredNotifications = () => {
  const cutoffIso = new Date(Date.now() - ONE_WEEK_MS).toISOString();
  db.prepare("DELETE FROM notifications WHERE date < ?").run(cutoffIso);
};

const mapNotifications = (userId: string) => {
  pruneExpiredNotifications();
  const rows = db.prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC").all(userId) as any[];
  return rows.map((n) => ({ id: n.id, userId: n.userId, text: n.text, date: n.date, read: !!n.read }));
};

const mapWishlist = (userId: string) => {
  return db.prepare("SELECT * FROM wishlists WHERE userId = ? ORDER BY addedAt DESC").all(userId) as any[];
};

const mapItems = () => {
  const rows = db.prepare("SELECT payload FROM items ORDER BY updatedAt DESC").all() as any[];
  return rows.map((row) => {
    try {
      return JSON.parse(row.payload);
    } catch {
      return null;
    }
  }).filter(Boolean);
};

const pruneExpiredClaimLogs = () => {
  db.prepare("DELETE FROM claimed_logs WHERE expiresAt <= ?").run(new Date().toISOString());
};

const mapClaimLogs = () => {
  pruneExpiredClaimLogs();
  const rows = db.prepare("SELECT payload FROM claimed_logs ORDER BY updatedAt DESC").all() as any[];
  return rows.map((row) => {
    try {
      return JSON.parse(row.payload);
    } catch {
      return null;
    }
  }).filter(Boolean);
};

const getUserById = (id: string) => {
  const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  if (!userRow) return null;
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    grade: userRow.grade,
    studentId: userRow.studentId,
    joinedAt: userRow.joinedAt,
    notifications: mapNotifications(userRow.id)
  };
};

const findUserIdByEmail = (email?: string) => {
  if (!email) return null;
  const normalized = String(email).trim().toLowerCase();
  if (!normalized) return null;
  const userRow = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(normalized) as any;
  return userRow?.id || null;
};

const resolveUserId = (requestedId?: string, email?: string) => {
  const cleanedRequestedId = String(requestedId || "").trim();
  if (cleanedRequestedId && cleanedRequestedId !== "undefined" && cleanedRequestedId !== "null") {
    const byId = db.prepare("SELECT id FROM users WHERE id = ?").get(cleanedRequestedId) as any;
    if (byId?.id) return byId.id as string;
    const byRequestedAsEmail = findUserIdByEmail(cleanedRequestedId);
    if (byRequestedAsEmail) return byRequestedAsEmail;
  }
  return findUserIdByEmail(email || undefined);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  app.post("/api/auth/signup", (req, res) => {
    try {
      const { name, email, password, grade, studentId } = req.body;
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (!normalizedEmail) return res.status(400).json({ error: "Email is required" });
      const id = Math.random().toString(36).slice(2, 11);
      const joinedAt = new Date().toISOString();
      db.prepare("INSERT INTO users (id, name, email, password, grade, studentId, joinedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(id, name, normalizedEmail, password, grade, studentId, joinedAt);
      const user = { id, name, email: normalizedEmail, grade, studentId, joinedAt, notifications: [] };
      res.json({ user });
    } catch (error: any) {
      if (String(error?.message || "").includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: error?.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const userRow = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) AND password = ?").get(normalizedEmail, password) as any;
      if (!userRow) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const user = {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        grade: userRow.grade,
        studentId: userRow.studentId,
        joinedAt: userRow.joinedAt,
        notifications: mapNotifications(userRow.id)
      };
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Login failed" });
    }
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    try {
      const { email, studentId } = req.body;
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedStudentId = String(studentId || "").trim();
      if (!normalizedEmail || !normalizedStudentId) {
        return res.status(400).json({ error: "Email and ID are required" });
      }
      const userRow = db.prepare("SELECT password FROM users WHERE lower(email) = lower(?) AND studentId = ?").get(normalizedEmail, normalizedStudentId) as any;
      if (!userRow) {
        return res.status(404).json({ error: "No matching account found" });
      }
      res.json({ password: userRow.password });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to recover password" });
    }
  });

  app.get("/api/users/:id", (req, res) => {
    try {
      const resolvedId = resolveUserId(req.params.id, String(req.query.email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      const user = getUserById(resolvedId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user, wishlist: mapWishlist(resolvedId) });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to load user" });
    }
  });

  app.post("/api/users/:id/change-password", (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const resolvedId = resolveUserId(req.params.id, String(email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });

      const existingUser = db.prepare("SELECT password FROM users WHERE id = ?").get(resolvedId) as any;
      if (!existingUser) return res.status(404).json({ error: "User not found" });

      if (String(currentPassword || "") !== String(existingUser.password || "")) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const cleanedNewPassword = String(newPassword || "").trim();
      if (cleanedNewPassword.length < 4) {
        return res.status(400).json({ error: "New password must be at least 4 characters" });
      }

      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(cleanedNewPassword, resolvedId);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to change password" });
    }
  });

  app.post("/api/users/:id/notifications", (req, res) => {
    try {
      const { text, email } = req.body;
      if (!text || !String(text).trim()) return res.status(400).json({ error: "Notification text is required" });
      const resolvedId = resolveUserId(req.params.id, String(email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      const id = Math.random().toString(36).slice(2, 11);
      const date = new Date().toISOString();
      db.prepare("INSERT INTO notifications (id, userId, text, date, read) VALUES (?, ?, ?, ?, 0)").run(id, resolvedId, String(text).trim(), date);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to send notification" });
    }
  });

  app.post("/api/notifications", (req, res) => {
    try {
      const { userId, email, text } = req.body;
      if (!text || !String(text).trim()) return res.status(400).json({ error: "Notification text is required" });
      const targetUserId = resolveUserId(userId, email);
      if (!targetUserId) return res.status(404).json({ error: "Notification recipient not found" });
      const id = Math.random().toString(36).slice(2, 11);
      const date = new Date().toISOString();
      db.prepare("INSERT INTO notifications (id, userId, text, date, read) VALUES (?, ?, ?, ?, 0)").run(id, targetUserId, String(text).trim(), date);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to send notification" });
    }
  });

  app.delete("/api/users/:id/notifications/:notificationId", (req, res) => {
    try {
      const resolvedId = resolveUserId(req.params.id, String(req.query.email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      const result = db.prepare("DELETE FROM notifications WHERE id = ? AND userId = ?").run(req.params.notificationId, resolvedId);
      if (!result.changes) return res.status(404).json({ error: "Notification not found" });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to remove notification" });
    }
  });

  app.get("/api/users/:id/wishlist", (req, res) => {
    try {
      const resolvedId = resolveUserId(req.params.id, String(req.query.email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      res.json({ wishlist: mapWishlist(resolvedId) });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to load wishlist" });
    }
  });

  app.post("/api/users/:id/wishlist", (req, res) => {
    try {
      const { text, category, email } = req.body;
      if (!text || !String(text).trim()) return res.status(400).json({ error: "Wishlist text is required" });
      const resolvedId = resolveUserId(req.params.id, String(email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      const id = Math.random().toString(36).slice(2, 11);
      const addedAt = new Date().toISOString();
      const row = {
        id,
        userId: resolvedId,
        text: String(text).trim(),
        category: String(category || "Any").trim() || "Any",
        addedAt
      };
      db.prepare("INSERT INTO wishlists (id, userId, text, category, addedAt) VALUES (?, ?, ?, ?, ?)")
        .run(row.id, row.userId, row.text, row.category, row.addedAt);
      res.json({ item: row });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to add wishlist item" });
    }
  });

  app.delete("/api/users/:id/wishlist/:wishId", (req, res) => {
    try {
      const resolvedId = resolveUserId(req.params.id, String(req.query.email || ""));
      if (!resolvedId) return res.status(404).json({ error: "User not found" });
      const result = db.prepare("DELETE FROM wishlists WHERE id = ? AND userId = ?").run(req.params.wishId, resolvedId);
      if (!result.changes) return res.status(404).json({ error: "Wishlist item not found" });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to remove wishlist item" });
    }
  });

  app.get("/api/items", (_req, res) => {
    try {
      res.json({ items: mapItems() });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to load items" });
    }
  });

  app.put("/api/items", (req, res) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const now = new Date().toISOString();
      const del = db.prepare("DELETE FROM items");
      const ins = db.prepare("INSERT INTO items (id, payload, updatedAt) VALUES (?, ?, ?)");
      const tx = db.transaction(() => {
        del.run();
        for (const item of items) {
          if (!item?.id) continue;
          ins.run(String(item.id), JSON.stringify(item), now);
        }
      });
      tx();
      res.json({ ok: true, count: items.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to save items" });
    }
  });

  app.get("/api/claim-logs", (_req, res) => {
    try {
      res.json({ logs: mapClaimLogs() });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to load claim logs" });
    }
  });

  app.put("/api/claim-logs", (req, res) => {
    try {
      const now = new Date().toISOString();
      const rawLogs = Array.isArray(req.body?.logs) ? req.body.logs : [];
      const logs = rawLogs.filter((log: any) => {
        const expiresAt = log?.expiresAt ? new Date(log.expiresAt).getTime() : 0;
        return expiresAt > Date.now();
      });

      const del = db.prepare("DELETE FROM claimed_logs");
      const ins = db.prepare("INSERT INTO claimed_logs (id, payload, expiresAt, updatedAt) VALUES (?, ?, ?, ?)");
      const tx = db.transaction(() => {
        del.run();
        for (const log of logs) {
          const expiresAt = log?.expiresAt || new Date(Date.now() + ONE_WEEK_MS).toISOString();
          const id = log?.id || Math.random().toString(36).slice(2, 11);
          ins.run(String(id), JSON.stringify({ ...log, id, expiresAt }), expiresAt, now);
        }
      });
      tx();
      res.json({ ok: true, count: logs.length });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to save claim logs" });
    }
  });

  const staticInfoPages = [
    "/privacypolicy.html",
    "/termsofservice.html",
    "/accessibility.html"
  ] as const;

  for (const page of staticInfoPages) {
    app.get(page, (_req, res) => {
      res.sendFile(page.slice(1), { root: "." });
    });
  }

  app.post("/api/gemini", async (req, res) => {
    try {
      const { model, contents, config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents,
        config
      });
      res.json(response);
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
