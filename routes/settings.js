import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings?shop=shop.myshopify.com
router.get("/", async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).json({ error: "Missing shop param" });
  const setting = await prisma.shopSetting.findUnique({ where: { shop } });
  return res.json({ apiKey: setting?.apiKey || null });
});

// POST /api/settings?shop=shop.myshopify.com  body { apiKey }
router.post("/", async (req, res) => {
  const shop = req.query.shop || req.body.shop;
  const apiKey = req.body.apiKey;
  if (!shop) return res.status(400).json({ error: "Missing shop param" });
  if (typeof apiKey !== "string") return res.status(400).json({ error: "Missing apiKey in body" });

  await prisma.shopSetting.upsert({
    where: { shop },
    update: { apiKey },
    create: { shop, apiKey }
  });

  return res.json({ ok: true });
});

export default router;
