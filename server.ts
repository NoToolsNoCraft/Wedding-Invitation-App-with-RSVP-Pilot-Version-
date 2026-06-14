import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("everlasting.db");
const JWT_SECRET = process.env.JWT_SECRET || "everlasting-fallback-secret";

// ─── Database Init ────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    is_published INTEGER DEFAULT 1,
    bride_name TEXT,
    groom_name TEXT,
    date TEXT,
    time TEXT,
    venue_name TEXT,
    venue_address TEXT,
    venue_maps_url TEXT,
    tagline TEXT,
    love_story TEXT,
    theme TEXT DEFAULT 'pastel',
    font_style TEXT DEFAULT 'serif',
    music_id TEXT,
    show_countdown INTEGER DEFAULT 1,
    rsvp_deadline TEXT,
    hero_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wedding_id INTEGER,
    name TEXT,
    status TEXT,
    guests INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(wedding_id) REFERENCES weddings(id)
  );
`);

// Migrate existing weddings table to add new columns if they don't exist
try {
  db.exec(`ALTER TABLE weddings ADD COLUMN user_id INTEGER REFERENCES users(id);`);
} catch (_) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE weddings ADD COLUMN is_published INTEGER DEFAULT 1;`);
} catch (_) { /* column already exists */ }

// ─── Auth Middleware ───────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  userId?: number;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Auth Routes ──────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const password_hash = await bcrypt.hash(password, 12);
      const result = db.prepare(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)"
      ).run(email, password_hash);

      const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ success: true, token, user: { id: result.lastInsertRowid, email } });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // ── Wedding Routes ────────────────────────────────────────────────────────────

  app.post("/api/weddings", authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const {
        brideName, groomName, date, time, venueName, venueAddress,
        venueMapsUrl, tagline, loveStory, theme, fontStyle,
        musicId, showCountdown, rsvpDeadline, heroImage, customSlug
      } = req.body;

      // Determine the slug
      let slug: string;
      if (customSlug && customSlug.trim()) {
        slug = customSlug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (!slug) return res.status(400).json({ error: "Invalid custom slug" });
        // Check uniqueness
        const existing = db.prepare("SELECT id FROM weddings WHERE slug = ?").get(slug);
        if (existing) {
          return res.status(409).json({ error: "This URL slug is already taken. Please choose another." });
        }
      } else {
        slug = `${brideName.toLowerCase()}-and-${groomName.toLowerCase()}-${nanoid(6)}`.replace(/\s+/g, "-");
      }

      const stmt = db.prepare(`
        INSERT INTO weddings (
          slug, user_id, is_published,
          bride_name, groom_name, date, time, venue_name, venue_address,
          venue_maps_url, tagline, love_story, theme, font_style,
          music_id, show_countdown, rsvp_deadline, hero_image
        ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        slug, req.userId,
        brideName, groomName, date, time, venueName, venueAddress,
        venueMapsUrl, tagline, loveStory, theme, fontStyle,
        musicId, showCountdown ? 1 : 0, rsvpDeadline, heroImage
      );

      res.json({ success: true, slug, id: result.lastInsertRowid });
    } catch (error) {
      console.error("Create wedding error:", error);
      res.status(500).json({ error: "Failed to create wedding" });
    }
  });

  app.get("/api/weddings/:slug", (req: Request, res: Response) => {
    try {
      const wedding = db.prepare("SELECT * FROM weddings WHERE slug = ?").get(req.params.slug) as any;
      if (!wedding) return res.status(404).json({ error: "Wedding page not found" });
      // Respect the published flag
      if (wedding.is_published === 0) {
        return res.status(404).json({ error: "This wedding page is currently offline" });
      }
      res.json(wedding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wedding" });
    }
  });

  app.get("/api/user/weddings", authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const weddings = db.prepare(
        "SELECT id, slug, bride_name, groom_name, date, is_published, created_at FROM weddings WHERE user_id = ? ORDER BY created_at DESC"
      ).all(req.userId);
      res.json(weddings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your weddings" });
    }
  });

  app.patch("/api/weddings/:id/publish", authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const wedding = db.prepare("SELECT * FROM weddings WHERE id = ?").get(req.params.id) as any;
      if (!wedding) return res.status(404).json({ error: "Wedding not found" });
      if (wedding.user_id !== req.userId) return res.status(403).json({ error: "Forbidden" });

      const newStatus = wedding.is_published === 1 ? 0 : 1;
      db.prepare("UPDATE weddings SET is_published = ? WHERE id = ?").run(newStatus, req.params.id);
      res.json({ success: true, is_published: newStatus });
    } catch (error) {
      res.status(500).json({ error: "Failed to update publish status" });
    }
  });

  // ── RSVP Routes ───────────────────────────────────────────────────────────────

  app.post("/api/rsvps", (req: Request, res: Response) => {
    try {
      const { weddingId, name, status, guests, message } = req.body;
      const stmt = db.prepare(`
        INSERT INTO rsvps (wedding_id, name, status, guests, message)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(weddingId, name, status, guests, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });

  // ── Vite / Static ─────────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
