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

async function createAuction(sender, tokenId, price) {

}

async function joinAuction(sender, tokenId) {

}

async function cancelAuction(sender, tokenId, price) {

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
