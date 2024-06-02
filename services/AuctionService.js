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
            
            // Convert initialPrice to Wei: 1 Ether = 10^18 Wei
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
            
            const tx = await contractWithSigner.cancelAuction(auctionId);
            await tx.wait();

            console.log('Đã hủy Auction:', auctionId);
        } catch (error) {
            console.log("Lỗi khi hủy Auction: ", error);
            throw error;
        }
    });
}

async function finishAuction(sender, auctionId) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            
            const tx = await contractWithSigner.finishAuction(auctionId);
            await tx.wait();

            console.log('Đã kết thúc Auction:', auctionId);
        } catch (error) {
            console.log("Lỗi khi kết thúc Auction: ", error);
            throw error;
        }
    });
}

//// ================================ ////

// Listener on blockchain events to update the database
const startListeningToCreateAuctionEvent = () => {
    contractProvider.on('CreateAuction', async (sender, auctionId, tokenId, initialPrice, startTime, endTime) => {
        try {
            console.log('CreateAuction event:', sender, auctionId, tokenId, initialPrice, startTime, endTime);
            
            // Create a new auction in Firestore
            const auctionRef = db.collection('auctions').doc(auctionId.toString());
            const auctionPromise = auctionRef.set({
                auctioneer: sender,
                tokenId: tokenId,
                initialPrice: initialPrice,
                previousBidder: '',
                lastBid: initialPrice,
                lastBidder: '',
                startTime: startTime,
                endTime: endTime,
                completed: false,
                active: true,
                auctionId: auctionId,
            });

            // Update Wallet in Firestore
            const newSenderBalance = await getBalance(sender);
            const senderWalletRef = db.collection('wallets').doc(sender);
            const senderWalletPromise = senderWalletRef.update({ 
                balance: newSenderBalance 
            }, {merge: true});

            // Wait for all updates to complete
            await Promise.all([
                auctionPromise, 
                senderWalletPromise
            ]);
        } catch (error) {
            console.log("Lỗi khi tạo Auction: ", error);
            throw error;
        }
    });
}

const startListeningToJoinAuctionEvent = () => {
    contractProvider.on('JoinAuction', async (sender, auctionId, bidPrice, previousBidder) => {
        try {
            // Log the JoinAuction event
            console.log('JoinAuction event:', sender, auctionId, bidPrice, previousBidder);

            // Prepare promises for Firestore updates
            const auctionRef = db.collection('auctions').doc(auctionId.toString());
            const auctionPromise = auctionRef.set({
                lastBidder: sender,
                previousBidder: previousBidder,
                lastBid: bidPrice,
            }, { merge: true });

            const senderWalletRef = db.collection('wallets').doc(sender);
            const senderBalancePromise = getBalance(sender).then(newSenderBalance => 
                senderWalletRef.set({ balance: newSenderBalance }, { merge: true })
            );

            let previousBidderWalletPromise = Promise.resolve();
            if (previousBidder !== '0x0000000000000000000000000000000000000000') {
                const previousBidderWalletRef = db.collection('wallets').doc(previousBidder);
                previousBidderWalletPromise = getBalance(previousBidder).then(previousBidderBalance => 
                    previousBidderWalletRef.set({ balance: previousBidderBalance }, { merge: true })
                );
            }

            // Wait for all updates to complete
            await Promise.all([
                auctionPromise,
                senderBalancePromise,
                previousBidderWalletPromise
            ]);

            console.log('All updates completed successfully');
        } catch (error) {
            console.error('Error handling JoinAuction event:', error);
        }
    });
}


const startListeningToCancelAuctionEvent = () => {
    contractProvider.on('CancelAuction', async (sender, auctionId, tokenId, auctioneer, previousBidder) => {
        console.log('CancelAuction event:', sender, auctionId, tokenId, auctioneer, previousBidder);

        // Update the auction status to 'cancelled'
        const auctionRef = db.collection('auctions').doc(auctionId.toString());
        const auctionPromise = auctionRef.set({
            completed: true,
            active: false,
        }, { merge: true });

        // Update Wallet in Firestore
        const newSenderBalance = await getBalance(sender);
        const senderWalletRef = db.collection('wallets').doc(sender);
        const senderWalletPromise = senderWalletRef.update({ 
            balance: newSenderBalance 
        }, {merge: true});

        let previousBidderWalletPromise = Promise.resolve();
        if (previousBidder !== '0x0000000000000000000000000000000000000000'){
            const newPreviousBidderBalance = await getBalance(previousBidder);
            const previousBidderWalletRef = db.collection('wallets').doc(previousBidder);
            previousBidderWalletPromise = previousBidderWalletRef.update({ 
                balance: newPreviousBidderBalance 
            }, {merge: true});
        }

        // Wait for all updates to complete
        await Promise.all([
            auctionPromise, 
            senderWalletPromise,
            previousBidderWalletPromise,
        ]);
    });
}

const startListeningToFinishAuctionEvent = () => {
    contractProvider.on('FinishAuction', async (sender, auctionId, tokenId, bidPrice, auctioneer, lastBidder) => {
        // Sender is who called the function
        
        // Update the auction status to 'finished'
        
        // Auctioneer is the owner of the NFT
        
        // LastBidder is the winner

        // Update  Wallet in Firestore
        
    });
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
