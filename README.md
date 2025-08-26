Crypto Payments by Switro - V4 (routes structure)

This package provides a ready-to-run testing app with:
- routes/ directory (switro, settings, auth, webhook)
- public/settings.html -> merchant UI to save per-shop Switro API key
- Prisma + SQLite schema for ShopSetting
- Checkout requires per-shop key; if missing, the route responds with error (so checkout will not proceed).

Quick start (local):
1. Copy `.env.example` to `.env` and fill SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL.
2. Optionally set SWITRO_API_KEY fallback (leave blank to force merchants to add their own keys).
3. npm install
4. npx prisma generate
5. npx prisma migrate dev --name init
6. npm run dev
7. Open: http://localhost:3000/ui/settings?shop=your-shop.myshopify.com and save key for that shop

Notes:
- This project includes a minimal placeholder for Shopify OAuth (routes/auth.js). For production, implement full OAuth and store Shopify access tokens to update orders after webhook.
- Webhook handler is a stub: implement signature verification (if Switro provides) and Shopify order updates as needed.
