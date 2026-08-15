import express from 'express';
import { createCheckoutSession, handleWebhook } from '../services/stripeService.js';

const router = express.Router();

router.post('/checkout', async (req, res) => {
  try {
    const orgId = req.body.organizationId || 'default-org';
    const userId = req.body.userId || 'dev-user';
    const result = await createCheckoutSession(orgId, userId);
    res.json(result);
  } catch (error) {
    console.error('[Stripe] Checkout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const result = await handleWebhook(req.body, sig);
      res.json(result);
    } catch (error) {
      console.error('[Stripe] Webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;