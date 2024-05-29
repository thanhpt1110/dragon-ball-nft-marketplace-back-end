const helper = require('./helper');
const marketplaceService = require('../services/MarketplaceService');

async function listNft(req, res) {
    try {
        const { address, tokenId, price } = req.body;
        await marketplaceService.listNft(address, tokenId, price);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function unListNft(req, res) {
    try {
        const { address, tokenId } = req.body;
        await marketplaceService.unListNft(address, tokenId);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function updateListingNftPrice(req, res) {
    try {
        const nft = req.body;
        // await marketplaceService.updateListingNftPrice(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function buyNft(req, res) {
    try {
        const nft = req.body;
        // await marketplaceService.buyNft(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = {
    listNft,
    unListNft,
    updateListingNftPrice,
    buyNft
}