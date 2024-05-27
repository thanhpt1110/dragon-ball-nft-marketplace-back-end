'use strict';
module.exports = function(app) {
    var testApi = require('../controllers/testApiController');
    var walletApi = require('../controllers/walletController');
    var nftApi = require('../controllers/NftApiController');
    var marketplaceApi = require('../controllers/marketplaceApiController');

    // Test API
    app.post('/api/test', testApi.test);

    // Wallet API
    app.get('/api/balance/:wallet_address', walletApi.getBalance);

    // NFT API

    // Marketplace API
};