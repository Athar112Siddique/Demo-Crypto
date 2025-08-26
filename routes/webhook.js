import express from "express";
const router = express.Router();

// Stub webhook routes. Example: Switro -> POST /webhooks/switro
router.post("/switro", express.json({ type: '*/*' }), async (req, res) => {
  const evt = req.body;
  console.log('Received Switro webhook:', evt);
  // TODO: verify signature and update Shopify order using stored access token for the shop.
  res.status(200).send('ok');
});

export default router;
