//----Modules and configuration----//
const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth-controller');
const endpoints = require('../controllers/endpoints');
const views = require('../views/display-information');
const path = require('path');

//Home
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

//Error
router.route('/error').get(views.errorPage);

//isAuthorized 
router.route('/authorized/:portalID').get(endpoints.authorizedAccount);

//Install App
router.route('/install').get(oauthController.installApp);

//OAuth Callback
router.route('/oauth-callback').get(oauthController.oauthCallback);

module.exports = router;