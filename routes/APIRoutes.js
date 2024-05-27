'use strict';
module.exports = function(app) {
    var testController = require('../controllers/TestApiController');
    var walletController = require('../controllers/WalletController');
    var dragonBallController = require('../controllers/NftController');
    var dragonBallMarketplace = require('../controllers/MarketplaceController');

    // Test API
    app.post('/api/test', testController.test);

    // Wallet API
    app.get('/api/balance/:wallet_address', walletController.getBalance);
    app.get('/api/wallet/:wallet_address', walletController.getWallet);
    app.post('/api/wallet/:wallet_address', walletController.createOrUpdateWallet);

    // NFT API

    // Marketplace API  
};