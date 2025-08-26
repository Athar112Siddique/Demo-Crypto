import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const shop = req.body.shop;
    const order = req.body.order;

    // Fetch API key saved by merchant
    const merchant = await prisma.merchant.findUnique({ where: { shop } });
    if (!merchant || !merchant.switroApiKey) {
      return res.status(400).json({ error: 'Switro API Key not set. Please configure in dashboard.' });
    }

    const response = await axios.post(
      'https://www.switro.com/api/v1/checkout',
      {
        customer_name: order.customer.first_name + ' ' + order.customer.last_name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        customer_address: order.shipping_address?.address1 || '',
        amount_total: order.total_price,
        amount_shipping: order.total_shipping_price_set?.shop_money?.amount || 0,
        amount_tax: order.total_tax,
        amount_currency: order.currency,
        cancel_url: `${process.env.SHOPIFY_APP_URL}/checkout/cancel`,
        success_url: `${process.env.SHOPIFY_APP_URL}/checkout/success`,
        items: order.line_items.map(i => ({
          item_title: i.title,
          item_quantity: i.quantity,
          item_amount: i.price,
          item_description: i.name,
          item_image_url: i.image_url || ''
        }))
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${merchant.switroApiKey}`,
          'X-Network': process.env.SWITRO_NETWORK || 'devnet',
        }
      }
    );

    return res.json({ redirect_url: response.data.checkout_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

export default router;
