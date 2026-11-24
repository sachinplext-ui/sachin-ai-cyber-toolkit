import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.error("Set JWT_SECRET to a random value at least 32 characters long.");
  process.exit(1);
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.DATABASE_FILE || "./data/app.db";
const dbPath = path.resolve(dbFile);
const fs = await import("node:fs");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const cleanEmail = (v) => String(v || "").trim().toLowerCase();
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "")
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please sign in again." });
  }
}


const aiLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });
const JARVIS_INSTRUCTIONS = `You are Jarvis, the helpful assistant inside SACHIN AI CYBER TOOLKIT.
Be clear, friendly, concise, and age-appropriate. Help with ordinary learning, productivity, and defensive cybersecurity.
For cybersecurity, only explain safe, authorized, defensive tasks for systems the user owns or has permission to assess.
Do not provide instructions for breaking into accounts/devices, stealing credentials, malware, evasion, or harming people.
Never claim you have scanned, controlled, or changed a device unless a connected feature actually did so.
The app currently has only passive educational checks; explain limitations honestly.`;

app.post("/api/ai-chat", aiLimiter, async (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).json({ error: "Write a message first." });
  if (message.length > 2000) return res.status(400).json({ error: "Message is too long (maximum 2000 characters)." });
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
  const safeHistory = history
    .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .map(item => ({ role: item.role, content: item.content.slice(0, 2000) }));

  if (!process.env.OPENAI_API_KEY) {
    return res.json({
      mode: "demo",
      reply: "Jarvis Demo Mode: I received your message. To enable real AI replies, the app owner must add an API key to the server's private environment settings. Do not paste API keys into the app or chat."
    });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        instructions: JARVIS_INSTRUCTIONS,
        input: [...safeHistory, { role: "user", content: message }],
        max_output_tokens: 500,
        store: false
      }),
      signal: AbortSignal.timeout(30000)
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider request failed:", upstream.status);
      return res.status(502).json({ error: "AI service is temporarily unavailable. Check the server AI configuration." });
    }
    const reply = (payload.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text || "")
      .join("\n").trim();
    if (!reply) return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    res.json({ mode: "ai", reply });
  } catch (err) {
    console.error("AI request error:", err.name || "Error");
    res.status(504).json({ error: "AI request timed out or could not connect. Please try again." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "SACHIN AI CYBER TOOLKIT API", version: "2.0.0" }));

app.post("/api/register", authLimiter, async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || "");
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  return res.status(400).json({ error: "Enter a valid email." });
  if (password.length < 10) return res.status(400).json({ error: "Password must be at least 10 characters." });
  if (password.length > 72) return res.status(400).json({ error: "Password is too long." });
  try {
    const hash = await bcrypt.hash(password, 12);
    const info = db.prepare("INSERT INTO users(email,password_hash) VALUES(?,?)").run(email, hash);
    const token = jwt.sign({ id: info.lastInsertRowid, email }, SECRET, { expiresIn: "2h" });
    res.status(201).json({ token, user: { id: info.lastInsertRowid, email } });
  } catch (e) {
    if (String(e).includes("UNIQUE")) return res.status(409).json({ error: "This email is already registered." });
    res.status(500).json({ error: "Could not create account." });
  }
});

app.post("/api/login", authLimiter, async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT id,email,password_hash FROM users WHERE email=?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Email or password is incorrect." });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.get("/api/me", auth, (req, res) => res.json({ user: { id: req.user.id, email: req.user.email } }));

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`SACHIN AI CYBER TOOLKIT running on http://localhost:${PORT}`));
