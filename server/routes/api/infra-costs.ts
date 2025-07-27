import express from 'express';
import { pool } from '../../db';
import { google } from 'googleapis';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Fetch GCP Billing service account from token table
    const { rows } = await pool.query(
      "SELECT token_value FROM tokens WHERE service = 'gcp' AND token_name = 'GCP Billing Token' ORDER BY created_at DESC LIMIT 1"
    );

    if (!rows[0]) return res.status(500).json({ error: 'GCP Billing token not found in DB' });

    const credentials = JSON.parse(rows[0].token_value);

    // 2. Set up Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const billing = google.cloudbilling({ version: 'v1', auth });

    // 3. Billing Account ID (replace this with actual one from DB if dynamic)
    const billingAccountId = 'billingAccounts/013525-3AB380-08AAB6';

    // 4. Dummy data for frontend (can replace with live API in next step)
    const monthlyCosts = [
      { month: 'Jan', cost: 300 },
      { month: 'Feb', cost: 370 },
      { month: 'Mar', cost: 420 },
      { month: 'Apr', cost: 390 },
      { month: 'May', cost: 410 },
      { month: 'Jun', cost: 480 },
    ];

    const serviceCosts = [
      { service: 'Compute Engine', cost: 220 },
      { service: 'Cloud Storage', cost: 110 },
      { service: 'Cloud SQL', cost: 90 },
      { service: 'Cloud Functions', cost: 40 },
      { service: 'Cloud Run', cost: 20 },
    ];

    // 5. Send JSON response
    res.json({ monthlyCosts, serviceCosts });

  } catch (err: any) {
    console.error('💥 Infra cost fetch failed:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to fetch infrastructure costs' });
  }
});

export default router;
