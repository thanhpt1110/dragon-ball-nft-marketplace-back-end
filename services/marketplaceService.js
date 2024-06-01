const { ethers } = require('ethers');
const { getContractABI } = require('../utils/getContractABI');
const { getWallet, getBalance } = require('./WalletService');
const { db } = require('../firebaseAdmin');
const { default: PQueue } = require('p-queue');

// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractABI = getContractABI('ContractMarketplace');
const contractAddress = process.env.CONTRACT_DRAGON_BALL_MARKETPLACE_ADDRESS;
const contractProvider = new ethers.Contract(contractAddress, contractABI, provider);

// Set up the queue with concurrency of 1 to process tasks sequentially
const queue = new PQueue({ concurrency: 1 });

// Set up the signer (Wallet)
// const privateKey = process.env.PRIVATE_KEY;
// const wallet = new ethers.Wallet(privateKey, provider);
// const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);

async function listNft(sender, tokenId, price) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            const ethPrice = ethers.parseEther(price.toString());
            const tx = await contractWithSigner.listNft(tokenId, ethPrice);
            await tx.wait();
            console.log('Đã list NFT:', tokenId);
        } catch (error) {
            console.error('Lỗi khi list NFT:', error);
            throw error;
        }
    });
}

async function unListNft(sender, tokenId) {
    await queue.add(async () => {
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
    });
}

async function updateListingNftPrice(sender, tokenId, price) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
            const ethPrice = ethers.parseEther(price.toString());
            const tx = await contractWithSigner.updateListingNftPrice(tokenId, ethPrice);
            await tx.wait();
            console.log('Đã cập nhật giá NFT:', tokenId);
        } catch (error) {
            console.error('Lỗi khi cập nhật giá NFT:', error);
            throw error;
        }
    });
}

const nftService  = require('./NftService'); 
async function buyNft(sender, tokenId) {
    await queue.add(async () => {
        try {
            const walletFirestore = await getWallet(sender);
            const privateKey = walletFirestore.privateKey;
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);

            const nft = await nftService.getNftFromFirestore(tokenId);
            const priceInWei = ethers.parseUnits(nft.price.toString(), 'wei');
            const options = { value: priceInWei }; 
            const tx = await contractWithSigner.buyNft(tokenId, options);
            await tx.wait();
            
            console.log('Đã mua NFT:', tokenId);
            // Update approve all NFTs for Marketplace
            await nftService.setApprovalForAll(contractAddress, true, wallet);  

        } catch (error) {
            console.error('Lỗi khi mua NFT:', error);
            throw error;
        }
    });
}

//// ================================ ////

// Listener on blockchain events to update the database
const startListeningToListNFTEvent = () => {
    if (contractProvider.listenerCount("ListNFT") > 0) {
        // There is already a listener for the "ListNFT" event
        return;
    }
    contractProvider.addListener("ListNFT", async (sender, tokenId, price) => {
        await queue.add(async () => {
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
    });
}

const startListeningToUnListNFTEvent = () => {
    if (contractProvider.listenerCount("UnListNFT") > 0) {
        // There is already a listener for the "UnListNFT" event
        return;
    }
    contractProvider.addListener("UnListNFT", async (sender, tokenId) => {
        await queue.add(async () => {
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
                console.error('Error when handling UnListNFT event', error);
                throw error;
            }
        });
    });
}

const startListeningToUpdateListingNFTPriceEvent = () => {
    if (contractProvider.listenerCount("UpdateListingNFTPrice") > 0) {
        // There is already a listener for the "UpdateListingNFTPrice" event
        return;
    }
    contractProvider.addListener("UpdateListingNFTPrice", async (sender, tokenId, price) => {
        await queue.add(async () => {
            try {
                console.log(`NFT with ID ${tokenId} updated price to ${price} by ${sender}`)

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
                console.error('Error when handling update price NFT event:', error);
                throw error;
            }
        });
    });
}

const startListeningToBuyNFTEvent = () => {
    if (contractProvider.listenerCount("BuyNFT") > 0) {
        // There is already a listener for the "UnListNFT" event
        return;
    }
    contractProvider.addListener("BuyNFT", async (sender, oldAuthor, tokenId, price) => {
        await queue.add(async () => {
            try {
                console.log(`NFT with ID ${tokenId} bought by ${sender} from ${oldAuthor} with price ${price}`)

                // Update NFT in Firestore
                const nftRef = db.collection('nfts').doc(tokenId.toString());
                const nftUpdatePromise = nftRef.set({
                    author: sender,
                    price: 0,
                    isSold: false,
                }, { merge: true });

                // Update Wallet in Firestore
                const newBuyerBalance = await getBalance(sender);
                const newOldAuthorBalance = await getBalance(oldAuthor);
                const buyerWalletRef = db.collection('wallets').doc(sender);
                const oldAuthorWalletRef = db.collection('wallets').doc(oldAuthor);
                const buyerWalletUpdatePromise = buyerWalletRef.set({
                    balance: newBuyerBalance,
                }, { merge: true });
                const oldAuthorWalletUpdatePromise = oldAuthorWalletRef.set({
                    balance: newOldAuthorBalance,
                }, { merge: true });

                // Wait for all updates to complete
                await Promise.all([nftUpdatePromise, buyerWalletUpdatePromise, oldAuthorWalletUpdatePromise]);
            } catch (error) {
                console.error('Error when handling BuyNFT event:', error);
                throw error;
            }
        });
    });
}

module.exports = {
    listNft,
    unListNft,
    updateListingNftPrice,
    buyNft,

    // Listener
    startListeningToListNFTEvent,
    startListeningToUnListNFTEvent,
    startListeningToUpdateListingNFTPriceEvent,
    startListeningToBuyNFTEvent,
}
