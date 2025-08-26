import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/switro/checkout
 * body: { shop, order }
 * Requires per-shop Switro API key saved in ShopSetting.
 * If not present (and no fallback in env), returns an error (does NOT proceed).
 */
router.post("/checkout", async (req, res) => {
  try {
    const { shop, order } = req.body || {};
    if (!shop || !order) return res.status(400).json({ error: "Missing shop or order" });

    const setting = await prisma.shopSetting.findUnique({ where: { shop } });
    const key = setting?.apiKey || process.env.SWITRO_API_KEY || null;

    if (!setting && !process.env.SWITRO_API_KEY) {
      // Merchant has not set a key and no fallback exists => block checkout
      return res.status(400).json({
        error: "No Switro API key configured for this shop. Please ask the merchant to add their Switro API key in the app settings."
      });
    }

    // If a fallback exists in env but you want to enforce merchant key only,
    // replace above logic to require setting.apiKey exclusively.

    // Build payload as per Switro spec
    const payload = {
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      amount_total: order.amount_total,
      amount_shipping: order.amount_shipping,
      amount_tax: order.amount_tax,
      amount_currency: order.amount_currency,
      cancel_url: order.cancel_url,
      success_url: order.success_url,
      items: order.items || []
    };

    const resp = await axios.post("https://www.switro.com/api/v1/checkout", payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "X-Network": process.env.SWITRO_NETWORK || "devnet"
      },
      timeout: 15000
    });

    const data = resp.data || {};
    const redirect = data.checkout_url || data.url || data.redirect_url;

    return res.json({ ok: true, redirect_url: redirect, switro: data });
  } catch (e) {
    console.error("Switro checkout error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "Failed to create Switro checkout", details: e?.response?.data || e.message });
  }
});

export default router;
