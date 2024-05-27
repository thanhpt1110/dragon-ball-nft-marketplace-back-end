const { ethers } = require('ethers');
// Get balance from FTM 
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
async function getBalance(address) {
    try {
        const balance = await provider.getBalance(address);
        const balanceInEther = ethers.formatEther(balance);
        console.log(`Số dư của địa chỉ ${address} là: ${balanceInEther} FTM`);
        return balanceInEther;
    } catch (error) {
        console.error('Lỗi khi lấy số dư:', error);
        throw error;
    }
}
module.exports = {
    getBalance
}

// Query theo address từ Firestore

// Encrypt private key

// Decrypt private key

// Get balance của wallet