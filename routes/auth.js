import express from "express";
const router = express.Router();

// Minimal placeholder for OAuth install simulation.
// In production, implement real Shopify OAuth (install & access token exchange).
router.get("/", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing shop param");
  // set session shop for demo convenience
  req.session.shop = shop;
  res.send(`Simulated install for ${shop}. Now open /ui/settings?shop=${encodeURIComponent(shop)}`);
});

export default router;
