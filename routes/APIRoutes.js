'use strict';
module.exports = function(app) {
    var testController = require('../controllers/TestApiController');
    var walletController = require('../controllers/WalletController');
    var nftController = require('../controllers/NftController');
    var marketplaceController = require('../controllers/MarketplaceController');

    // Test API
    app.post('/api/test', testController.test);

    // Wallet API
    app.get('/api/balance/:wallet_address', walletController.getBalance);
    app.get('/api/wallet/:wallet_address', walletController.getWallet);
    app.post('/api/wallet/:wallet_address', walletController.createOrUpdateWallet);

    // NFT API
    app.get('/api/nft/:nft_id', nftController.getNftMetadata);
    app.get('/api/nft', nftController.getAllNftOnMarketplace);
    app.post('/api/nft/approveMarketplace', nftController.approveNftForMarketplace);
    // Marketplace API  
};