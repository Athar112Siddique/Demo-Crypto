import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

import switroRoutes from "./routes/switro.js";
import settingsRoutes from "./routes/settings.js";
import authRoutes from "./routes/auth.js";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  secret: process.env.SESSION_SECRET || "devsecret",
  maxAge: 7 * 24 * 60 * 60 * 1000
}));

app.use("/public", express.static(path.join(__dirname, "public")));

// Attach routes
app.use("/api/switro", switroRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/auth", authRoutes);
app.use("/webhooks", webhookRoutes);

// Simple home
app.get("/", (_req, res) => {
  res.send("<h2>Crypto Payments by Switro - V4</h2><p>Use /auth?shop=your-shop.myshopify.com to simulate install and /ui/settings?shop=...</p>");
});

app.get("/ui/settings", (req, res) => {
  // serve the settings page (embedded in Shopify admin)
  res.sendFile(path.join(__dirname, "public", "settings.html"));
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
