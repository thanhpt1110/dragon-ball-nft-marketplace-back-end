// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { getContractABI } = require('../utils/getContractABI');
const { getWallet, getBalance } = require('./WalletService');
const { db } = require('../firebaseAdmin'); 
// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractABI = getContractABI('ContractMarketplace');
const contractAddress = process.env.CONTRACT_DRAGON_BALL_MARKETPLACE_ADDRESS; 
const contractProvider = new ethers.Contract(contractAddress, contractABI, provider);

// Set up the signer (Wallet)   
// const privateKey = process.env.PRIVATE_KEY;
// const wallet = new ethers.Wallet(privateKey, provider);
// const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);

// Call blockchain functions here // 
async function listNft(sender, tokenId, price) {
    try {
        const walletFirestore = await getWallet(sender);
        const privateKey = walletFirestore.privateKey;
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contractWithSigner.listNft(tokenId, price);
        await tx.wait();
        console.log('Đã list NFT:', tokenId);
    } catch (error) {
        console.error('Lỗi khi list NFT:', error);
        throw error;
    }
}

async function unListNft(sender, tokenId) {
    try {
        const walletFirestore = await getWallet(sender);
        const privateKey = walletFirestore.privateKey;
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contractWithSigner.unlistNft(tokenId);
        await tx.wait();
        console.log('Đã unList NFT:', tokenId);
    } catch (error) {
        console.error('Lỗi khi unlist NFT:', error);
        throw error;
    }
}

async function updateListingNftPrice(nftId, price) {
    try {
        const walletFirestore = await getWallet(sender);
        const privateKey = walletFirestore.privateKey;
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contractWithSigner.unlistNft(tokenId);
        await tx.wait();
        console.log('Đã cập nhật giá NFT:', nftId);
    } catch (error) {
        console.error('Lỗi khi cập nhật giá NFT:', error);
        throw error;
    }
}

async function buyNft(nftId) {
    try {
        const wallet = await getWallet(ownerAddress);
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contractWithSigner.buyNft(nftId);
        await tx.wait();
    } catch (error) {
        console.error('Lỗi khi mua NFT:', error);
        throw error;
    }
}
//// ================================ ////

// Listener on blockchain events to update the database // 
// MarketplaceService.js
const startListeningToListNFTEvent = () => {
    contractProvider.on("ListNFT", async (sender, tokenId, price) => { 
        try {
            console.log(`NFT with ID ${tokenId} listed with price ${price} by ${sender}`);
            
            // Update NFT in Firestore
            const nftRef = db.collection('nfts').doc(tokenId.toString());
            await nftRef.set({
                price: price,
                isSold: true,
            }, { merge: true });

            // Update Wallet in Firestore
            const newBalance = await getBalance(sender);
            const walletRef = db.collection('wallets').doc(sender);
            await walletRef.set({
                balance: newBalance,
            }, { merge: true });

        } catch (error) {
            console.error('Error when handling ListNFT event:', error);
            throw error;
        }
    });
}

const startListeningToUnListNFTEvent = () => {
    contractProvider.on("UnlistNFT", async (sender, tokenId) => { 
        try {
            console.log(`NFT with ID ${tokenId} unlisted by ${sender}`);

            // Update NFT in Firestore
            const nftRef = db.collection('nfts').doc(tokenId.toString());
            await nftRef.set({
                price: 0,
                isSold: false,
            }, { merge: true });

            // Update Wallet in Firestore
            const newBalance = await getBalance(sender);
            const walletRef = db.collection('wallets').doc(sender);
            await walletRef.set({
                balance: newBalance,
            }, { merge: true });

        } catch (error) {
            console.error('Error when handling ListNFT event:', error);
            throw error;
        }
    });
}

module.exports ={ 
    listNft,
    unListNft,
    updateListingNftPrice,
    buyNft,

    // Listener
    startListeningToListNFTEvent,
    startListeningToUnListNFTEvent,
}