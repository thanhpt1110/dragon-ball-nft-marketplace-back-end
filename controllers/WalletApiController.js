const helper = require('./helper');
const walletService = require('../service/WalletService');
const { app } = require('../firebaseConfig');
// Viết hàm xử lý data ở đây
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

module.exports = { 
    getBalance 
};