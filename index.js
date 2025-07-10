const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ⏺ Replace these with your real FBR credentials when you have them
const CLIENT_ID = 'YOUR_FBR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_FBR_CLIENT_SECRET';
const TOKEN_URL = 'https://gw.fbr.gov.pk/auth/realms/fbr/protocol/openid-connect/token';
const INVOICE_URL = 'https://gw.fbr.gov.pk/imsp/v1/api/Invoice';

// This is the Zapier Webhook endpoint
app.post('/webhook', async (req, res) => {
    const invoiceData = req.body;

    try {
        // 1️⃣ Get the OAuth Token
        const tokenResponse = await axios.post(TOKEN_URL, new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2️⃣ Send Invoice to FBR
        const fbrResponse = await axios.post(INVOICE_URL, invoiceData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-fbr-client-id': CLIENT_ID,
                'Content-Type': 'application/json'
            }
        });

        res.json({ status: 'Success', fbrResponse: fbrResponse.data });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'FBR API call failed', details: error.response?.data });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Middleware running on port ${PORT}`));
