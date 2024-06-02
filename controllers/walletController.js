const helper = require('./helper');
const walletService = require('../services/WalletService');

// Create Ether wallet
async function createEtherWallet(req, res) {
    try {
        const wallet = await walletService.createEtherWallet();
        return res.status(200).json(helper.APIReturn(0, {
            "wallet": wallet
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }

}

// Get wallet balance from Blockchain
async function getBalance(req, res) {
    try {
        const walletId = req.params.wallet_address;
        const balance = await walletService.getBalance(walletId);
        return res.status(200).json(helper.APIReturn(0, {
            "balance": balance
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

// Get wallet information from Firebase
async function getWallet(req, res) {
    try {
        const walletId = req.params.wallet_address;
        const wallet = await walletService.getWallet(walletId);
        return res.status(200).json(helper.APIReturn(0, {
            "wallet": wallet
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

// Create or Update wallet in Firebase
async function createOrUpdateWallet(req, res) {
    try {
        const walletId = req.params.wallet_address;
        const wallet = req.body;
        await walletService.createOrUpdateWallet(walletId, wallet);
        return res.status(200).json(helper.APIReturn(0, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = { 
    createEtherWallet,
    getBalance,
    getWallet,
    createOrUpdateWallet,
};