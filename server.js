require('dotenv').config();
const { 
    startListeningToListNFTEvent,
    startListeningToUnListNFTEvent,
    startListeningToUpdateListingNFTPriceEvent,
    startListeningToBuyNFTEvent,
} = require('./services/MarketplaceService');

const {
    startListeningToCreateAuctionEvent,
    startListeningToJoinAuctionEvent,
    startListeningToCancelAuctionEvent,
    startListeningToFinishAuctionEvent,
} = require('./services/AuctionService');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    req.setTimeout(1000*45, function(){
        res.status(200).json(helper.APIReturn(1, "Request Timeout"));
    });
    next();
});    
var routes = require('./routes/APIRoutes');
const { startBlockPolling } = require('./utils/blockPolling');
routes(app); 

// Start listening to blockchain events // 
// Marketplace // 
// startListeningToListNFTEvent(); 
// startListeningToUnListNFTEvent();
// startListeningToUpdateListingNFTPriceEvent();
// startListeningToBuyNFTEvent();

// Auction
// startListeningToCreateAuctionEvent();
// startListeningToJoinAuctionEvent();
// startListeningToCancelAuctionEvent();
// startListeningToFinishAuctionEvent();

const POLLING_INTERVAL = 10000; // 300 giây
startBlockPolling();
setInterval(async () => {
  await startBlockPolling();
}, POLLING_INTERVAL);

app.listen(port);
console.log('API server started on: ' + port);
