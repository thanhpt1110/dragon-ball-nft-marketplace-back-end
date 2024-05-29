// Define the service to interact with the blockchain
const { ethers } = require('ethers');
// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);

// Call blockchain functions here // 
// Get balance from FTM 
async function getBalance(address) {
    try {
        const balance = await provider.getBalance(address);
        const balanceInEther = ethers.formatEther(balance);
        return balanceInEther;
    } catch (error) {
        console.error('Lỗi khi lấy số dư:', error);
        throw error;
    }
}


//// ================================ ////


// Query theo address từ Firestore
const { db } = require('../firebaseConfig');
async function getWallet(address) {
    try {
        const walletRef = db.collection('wallets').doc(address);
        const wallet = await walletRef.get();
        if (!wallet.exists) {
            console.log('Không tìm thấy ví');
            return null;
        }
        console.log('Tìm thấy ví:', wallet.data());
        return wallet.data();
    } catch (error) {
        console.error('Lỗi khi lấy ví:', error);
        throw error;
    }
}

// Create or Update wallet in Firestore
async function createOrUpdateWallet(address, wallet) {
    try {
        const walletRef = db.collection('wallets').doc(address);
        await walletRef.set(wallet, { merge: true });
        console.log('Đã cập nhật ví:', wallet);
    } catch (error) {
        console.error('Lỗi khi cập nhật ví:', error);
        throw error;
    }
}
// Encrypt private key

// Decrypt private key

module.exports = {
    getBalance,
    getWallet,
    createOrUpdateWallet,
}