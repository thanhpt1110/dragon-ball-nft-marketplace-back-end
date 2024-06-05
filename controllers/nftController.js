const helper = require('./helper');
const nftService = require('../services/NftService');

async function getTopPriceNft(req, res) {
    try {
        const nft = await nftService.getTopPriceNft();
        if (nft === null) {
            return res.status(404).json(helper.APIReturn(101, "No NFTs found!"));
        }
        return res.status(200).json(helper.APIReturn(0, {
            "nft": nft,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function getAllNftsOnMarketplace(req, res) {
    try {
        // await nftService.approveNftForMarketplace();
        const nfts = await nftService.getAllNftsOnMarketplace();
        return res.status(200).json(helper.APIReturn(0, {
            "nfts": nfts,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function getAllNftsOnAuction(req, res) {
    try {
        const nfts = await nftService.getAllNftsOnAuction();
        return res.status(200).json(helper.APIReturn(0, {
            "nfts": nfts,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function getOwnedNftsByAddress(req, res) {
    try {
        const walletAddress = req.params.wallet_address;
        const nfts = await nftService.getOwnedNftsByAddress(walletAddress);
        return res.status(200).json(helper.APIReturn(0, {
            "nfts": nfts,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function getOwnedNftsSellingByAddress(req, res) {
    try {
        const walletAddress = req.params.wallet_address;
        const nfts = await nftService.getOwnedNftsSellingByAddress(walletAddress);
        return res.status(200).json(helper.APIReturn(0, {
            "nfts": nfts,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

async function getOwnedNftsAuctionByAddress(req, res) {
    try {
        const walletAddress = req.params.wallet_address;
        const nfts = await nftService.getOwnedNftsAuctionByAddress(walletAddress);
        return res.status(200).json(helper.APIReturn(0, {
            "nfts": nfts,
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

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

async function approveNftForMarketplace(req, res) {
    try {
        await nftService.approveNftForMarketplace();
        return res.status(200).json(helper.APIReturn(0, null, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = {
    getTopPriceNft,
    getNftMetadata,
    approveNftForMarketplace,
    getAllNftsOnMarketplace,
    getAllNftsOnAuction,
    getOwnedNftsByAddress,
    getOwnedNftsSellingByAddress,
    getOwnedNftsAuctionByAddress,
};