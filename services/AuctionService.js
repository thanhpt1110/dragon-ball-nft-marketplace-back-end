const { ethers } = require('ethers');
const { getContractABI } = require('../utils/getContractABI');
const { getWallet, getBalance } = require('./WalletService');
const { db } = require('../firebaseAdmin');
const { default: PQueue } = require('p-queue');
const nftService  = require('./NftService'); 

// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractABI = getContractABI('ContractAuction');
const contractAddress = process.env.CONTRACT_DRAGON_BALL_AUCTION_ADDRESS;
const contractProvider = new ethers.Contract(contractAddress, contractABI, provider);

// Set up the queue with concurrency of 1 to process tasks sequentially
const queue = new PQueue({ concurrency: 1 });

// Set up the signer (Wallet)
// const privateKey = process.env.PRIVATE_KEY;
// const wallet = new ethers.Wallet(privateKey, provider);
// const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);

async function createAuction(sender, tokenId, initialPrice, startTime, endTime) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            
            const priceInWei = ethers.parseEther(initialPrice.toString());
            const tx = await contractWithSigner.createAuction(tokenId, priceInWei, startTime, endTime);
            await tx.wait();
            console.log('Đã tạo auction với Token:', tokenId);
        } catch (error) {
            console.log("Lỗi khi tạo Auction: ", error);
            throw error;
        }
    });
}   

async function joinAuction(sender, auctionId, bidPrice) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            
            const priceInWei = ethers.parseEther(bidPrice.toString());
            const options = { value: priceInWei };

            const tx = await contractWithSigner.joinAuction(auctionId, options);
            await tx.wait();
            console.log('Đã tham gia vào Auction:', auctionId);
        } catch (error) {
            console.log("Lỗi khi tham gia Auction: ", error);
            throw error;
        }
    });
}

async function cancelAuction(sender, auctionId) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            
            const tx = await contractWithSigner.createAuction(sender, auctionId, ethPrice);
            await tx.wait();

            console.log('Đã hủy Auction:', auctionId);
        } catch (error) {
            console.log("Lỗi khi hủy Auction: ", error);
            throw error;
        }
    });
}

async function finishAuction(sender, tokenId) {

}

//// ================================ ////

// Listener on blockchain events to update the database
const startListeningToCreateAuctionEvent = () => {

}

const startListeningToJoinAuctionEvent = () => {
    
}

const startListeningToCancelAuctionEvent = () => {
    
}

const startListeningToFinishAuctionEvent = () => {
    
}

module.exports = {
    createAuction,
    joinAuction,
    cancelAuction,
    finishAuction,

    // Listener
    startListeningToCreateAuctionEvent,
    startListeningToJoinAuctionEvent,
    startListeningToCancelAuctionEvent,
    startListeningToFinishAuctionEvent,
}
