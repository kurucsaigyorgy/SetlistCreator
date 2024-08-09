const express = require('express');
//const fetch = require('node-fetch'); // Use node-fetch for server-side HTTP requests
const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
const port = 8080;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:8080';
const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';

app.use(express.static('public')); // Serve static files

app.get('/login', (req, res) => {
    const { code_challenge } = req.query;
    const code_verifier = crypto.randomBytes(32).toString('hex');
    res.cookie('code_verifier', code_verifier);

    const authUrl = new URL(authorizationEndpoint);
    authUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: 'user-read-private user-read-email',
        code_challenge_method: 'S256',
        code_challenge,
        redirect_uri: redirectUri,
    }).toString();

    res.redirect(authUrl.toString());
});

app.post('/refresh-token', async (req, res) => {
    const { refresh_token } = req.body;
    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token,
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });
    const tokenData = await response.json();
    res.json(tokenData);
});

app.get('/me', async (req, res) => {
    const { access_token } = req.headers;
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const userData = await response.json();
    res.json(userData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});