//----Modules and configuration----//
require('dotenv').config();
const hubspot = require('../model/hubspot');

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.')
}

//Hubspot APP Configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let SCOPES = ['crm.objects.contacts.read'];
if (process.env.SCOPE) {
    SCOPES = (process.env.SCOPE.split(/ |, ?|%20/)).join(' ');
}

const REDIRECT_URI = `https://google.com`; //Here goes your redirect url

//Install app
const installApp = async (req, res) => {
    const authUrl =
        'https://app.hubspot.com/oauth/authorize' +
        `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
        `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

    try {
        //console.log('');
        //console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
        //console.log('');
        //console.log("===> Step 1: Redirecting user to your app's OAuth URL");
        res.redirect(authUrl);
        //console.log('===> Step 2: User is being prompted for consent by HubSpot');
    } catch (e) {
        e.message === 'HTTP request failed' ? console.error(JSON.stringify(e.response, null, 2)) : console.error(e);
    }
}

//OAuth Callback
const oauthCallback = async (req, res) => {
    console.log('===> Step 3: Handling the request sent by the server');

    if (req.query.code) {
        //console.log('       > Received an authorization token');
        //console.log('       > ' + req.query.code);
        const authCodeProof = {
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code: req.query.code
        };

        // Exchange the authorization code for an access token and refresh token
        //console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
        const { token, portalID } = await hubspot.exchangeForTokens(authCodeProof);
        //console.log(token);
        if (token.message) {
            return res.redirect(`/error?msg=${token.message}`);
        }

        res.redirect(`/?portal=${portalID}`);
    }
}

const isAuthorized = async (portalID) => {
    return await hubspot.isAuthorized(portalID);
}

module.exports = {
    installApp,
    oauthCallback,
    isAuthorized
}