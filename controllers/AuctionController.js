const helper = require('./helper');
const marketplaceService = require('../services/MarketplaceService');

async function createAuction(req, res) {
    try {
        // const { address, tokenId, price } = req.body;
        // await marketplaceService.listNft(address, tokenId, price);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function joinAuction(req, res) {
    try {
        // const { address, tokenId } = req.body;
        // await marketplaceService.unListNft(address, tokenId);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function cancelAuction(req, res) {
    try {
        // const { address, tokenId, price } = req.body;
        // await marketplaceService.updateListingNftPrice(address, tokenId, price);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function finishAuction(req, res) {
    try {
        // const { address, tokenId } = req.body;
        // await marketplaceService.buyNft(address, tokenId);
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