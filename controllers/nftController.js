const helper = require('./helper');
const nftService = require('../services/NftService');

async function getNftMetadata(req, res) {
    try {
        const tokenId = req.params.nft_id;
        const nft = await nftService.getNftMetadata(tokenId);
        return res.status(200).json(helper.APIReturn(0, {
            "nft": nft,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = { 
    getNftMetadata, 
};