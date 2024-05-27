// List NFT
async function listNFT(req, res) {
    try {
        const nft = req.body;
        await marketplaceService.listNFT(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}
// Unlist NFT
async function unlistNFT(req, res) {
    try {
        const nft = req.body;
        await marketplaceService.unlistNFT(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

// Update price of NFT
async function updatePrice(req, res) {
    try {
        const nft = req.body;
        await marketplaceService.updatePrice(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

// Buy NFT
async function buyNFT(req, res) {
    try {
        const nft = req.body;
        await marketplaceService.buyNFT(nft);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}