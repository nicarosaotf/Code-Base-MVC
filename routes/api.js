//----Modules and configuration----//
const express = require('express');
const router = express.Router();
const endpoint = require('../controllers/endpoints');

//----Endpoints----//
router.route('/accounts').post(endpoint.getAccountsUsers);

module.exports = router;