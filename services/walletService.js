// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { db } = require('../firebaseAdmin'); 
// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);

// Call blockchain functions here // 
async function createEtherWallet() {
    try {
        const wallet = ethers.Wallet.createRandom();
        return wallet;
    } catch (error) {
        console.error('Lỗi khi tạo ví:', error);
        throw error;
    }
}

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
async function getWallet(address) {
    try {
        const walletRef = db.collection('wallets').doc(address);
        const walletDoc = await walletRef.get();
        if (!walletDoc.exists) {
            console.log('Không tìm thấy ví');
            return null;
        }
        return walletDoc.data();
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
    createEtherWallet,
    getBalance,
    getWallet,
    createOrUpdateWallet,
}