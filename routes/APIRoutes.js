'use strict';
module.exports = function(app) {
    var testController = require('../controllers/TestApiController');
    var walletController = require('../controllers/WalletController');
    var nftController = require('../controllers/NftController');
    var marketplaceController = require('../controllers/MarketplaceController');
    var auctionController = require('../controllers/AuctionController');
    // Test API
    app.post('/api/test', testController.test);


    // Wallet API
    app.get('/api/wallet/balance/:wallet_address', walletController.getBalance);
    app.get('/api/wallet/:wallet_address', walletController.getWallet);
    app.put('/api/wallet/:wallet_address', walletController.createOrUpdateWallet);
    app.post('/api/wallet', walletController.createEtherWallet);

    // NFT API
    app.get('/api/nft', nftController.getAllNftsOnMarketplace);
    app.get('/api/nft/topPrice', nftController.getTopPriceNft);
    app.get('/api/nft/owned/selling/:wallet_address', nftController.getOwnedNftsSellingByAddress);
    app.get('/api/nft/owned/auction/:wallet_address', nftController.getOwnedNftsAuctionByAddress);
    app.get('/api/nft/owned/:wallet_address', nftController.getOwnedNftsByAddress);
    app.get('/api/nft/:nft_id', nftController.getNftMetadata);
    app.post('/api/nft/approveMarketplace', nftController.approveNftForMarketplace);
    

    // Marketplace API  
    app.post('/api/marketplace/listNft', marketplaceController.listNft);
    app.post('/api/marketplace/unListNft', marketplaceController.unListNft);
    app.post('/api/marketplace/updateListingNftPrice', marketplaceController.updateListingNftPrice);
    app.post('/api/marketplace/buyNft', marketplaceController.buyNft);


    // Auction API
    app.post('/api/auction/createAuction', auctionController.createAuction);
    app.post('/api/auction/joinAuction', auctionController.joinAuction);
    app.post('/api/auction/cancelAuction', auctionController.cancelAuction);
    app.post('/api/auction/finishAuction', auctionController.finishAuction);
};