const helper = require('./helper');
const auctionService = require('../services/AuctionService');

async function createAuction(req, res) {
    try {
        const {
            address, 
            tokenId,
            initialPrice,
            startTime, 
            endTime
        } = req.body;
        await auctionService.createAuction(
            address, 
            tokenId, 
            initialPrice,
            startTime,
            endTime
        );
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function joinAuction(req, res) {
    try {
        const {
            address, 
            auctionId,
            bidPrice
        } = req.body;
        await auctionService.joinAuction(
            address, 
            auctionId,
            bidPrice
        );
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function cancelAuction(req, res) {
    try {
        const {
            address, 
            auctionId
        } = req.body;
        await auctionService.cancelAuction(address, auctionId);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function finishAuction(req, res) {
    try {
        const {
            address, 
            auctionId,
        } = req.body;
        await auctionService.finishAuction(address, auctionId);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = {
    createAuction,
    joinAuction,
    cancelAuction,
    finishAuction
}