'use strict';
module.exports = function(app) {
    var testApi = require('../controllers/testApiController');
    var walletApi = require('../controllers/WalletApiController');

    // Test API
    app.post('/api/test', testApi.test);

    // Wallet API
    app.get('/api/balance/:wallet_address', walletApi.getBalance);
};