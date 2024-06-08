// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { getContractABI } = require('../utils/getContractABI');
const { db } = require('../firebaseAdmin'); 
const axios = require('axios');
const ownerAddress = '0xcbB1be345A9a86Ce092F99c6fb2D874939Ee4c4b'

// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractAddress = process.env.CONTRACT_DRAGON_BALL_ADDRESS;
const contractABI = getContractABI('ContractNFT');

// Set up the signer (Wallet)
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Contract to read data from the blockchain
const contractProvider = new ethers.Contract(contractAddress, contractABI, provider);
// Contract to write data to the blockchain
const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);


// Call blockchain functions here // 
async function setApprovalForAll(operator, approved, wallet) {
    try {
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);
        const tx = await contractWithSigner.setApprovalForAll(operator, approved);
        await tx.wait();
        console.log(`Approval for all set successfully: ${operator} ${approved}`)
    } catch (error) {
        console.error(`Error setting approval for all: ${error}`);
        throw error;
    }
}

async function getOwnedNftsByAddress(ownerAddress) {
    try {
        const nfts = await getOwnedNftsFromFirestore(ownerAddress);
        const promises = nfts.map(async nft => {
            const tokenURL = await contractProvider.tokenURI(nft.tokenId);
            const metadata = await axios.get(tokenURL);
            return {
                ...nft,
                ...metadata.data,
            };
        });
        const updatedNfts = await Promise.all(promises);
        return updatedNfts;
    } catch (error) {
        console.error(`Error getting owned NFTs: ${error}`);
        throw error;
    }
}

async function getOwnedNftsSellingByAddress(ownerAddress) {
    try {
        const nfts = await getOwnedSellingNftsFromFirestore(ownerAddress);
        const promises = nfts.map(async nft => {
            const tokenURL = await contractProvider.tokenURI(nft.tokenId);
            const metadata = await axios.get(tokenURL);
            return {
                ...nft,
                ...metadata.data,
            };
        });
        const updatedNfts = await Promise.all(promises);
        return updatedNfts;
    } catch (error) {
        console.error(`Error getting owned NFTs: ${error}`);
        throw error;
    }
}

async function getOwnedNftsAuctionByAddress(ownerAddress) {
    try {
        const nfts = await getOwnedAuctionNftsFromFirestore(ownerAddress);
        const promises = nfts.map(async nft => {
            const tokenURL = await contractProvider.tokenURI(nft.tokenId);
            const metadata = await axios.get(tokenURL);
            return {
                ...nft,
                ...metadata.data,
            };
        });
        const updatedNfts = await Promise.all(promises);
        return updatedNfts;
    } catch (error) {
        console.error(`Error getting owned NFTs: ${error}`);
        throw error;
    }
}

async function getTopPriceNft() {
    try {
        const topPriceNftSnapshot = await db.collection('nfts')
            .where('isAuction', '==', false)
            .get();
        if (topPriceNftSnapshot.empty) {
            return null;
        }
        const data = topPriceNftSnapshot.docs.map(doc => doc.data());
        const maxPriceItem = data.reduce((max, item) => item.price >= max.price ? item : max, data[0]);
        // Fetch the metadata from the token URL
        const tokenURL = await contractProvider.tokenURI(maxPriceItem.tokenId);
        const metadataResponse = await axios.get(tokenURL);

        const mergedData = {
            ...maxPriceItem,
            ...metadataResponse.data
        };
        return mergedData;
    } catch (error) {
        console.error(`Error getting all NFTs on marketplace: ${error}`);
        throw error;
    }
}

async function getAllNftsOnAuction() {
    try {
        const nfts = await getAllNftsOnAuctionFromFirestore();
        const promises = nfts.map(async nft => {
            const tokenURL = await contractProvider.tokenURI(nft.tokenId);
            const metadata = await axios.get(tokenURL);
            return {
                ...nft,
                ...metadata.data,
            };
        });
        const updatedNfts = await Promise.all(promises);
        return updatedNfts;
    }
    catch (error) {
        console.error(`Error getting all NFTs on auction: ${error}`);
        throw error;
    }

}

async function getAllNftsOnMarketplace() {
    try {
        const nfts = await getAllNftsFromFirestore();
        const promises = nfts.map(async nft => {
            const tokenURL = await contractProvider.tokenURI(nft.tokenId);
            const metadata = await axios.get(tokenURL);
            return {
                ...nft,
                ...metadata.data,
            };
        });
        const updatedNfts = await Promise.all(promises);
        return updatedNfts;
    }
    catch (error) {
        console.error(`Error getting all NFTs on marketplace: ${error}`);
        throw error;
    }
}

async function getNftMetadata(tokenId) {
    try {
        const tokenURL = await contractProvider.tokenURI(tokenId);
        const metadataResponse = await axios.get(tokenURL);
        const firestoreResponse = await getNftFromFirestore(tokenId);

        const nft = {
            ...metadataResponse.data,
            ...firestoreResponse
        };
        return nft;
    } catch (error) {
        console.error(`Error getting token URI: ${error}`);
        throw error;
    }
}

async function approveNftForMarketplace(){
    try {
        try {
            for (let i = 1; i <= 30; ++i) {
                const approveTx = await contractWithSigner.approve(process.env.CONTRACT_DRAGON_BALL_MARKETPLACE_ADDRESS, i);
                await approveTx.wait();
                console.log(`Approved token ${i}`);
            }
        }
        catch (error) {
            console.error(`Error approving token: ${error}`);
            throw error;
        }
    }
    catch (error) {
        console.error(`Error approving token: ${error}`);
        throw error;
    }
}

async function mintNft(tokenId) {
    try {
        const tx = await contractWithSigner.mint(ownerAddress);
        const receipt = await tx.wait();
        await createOrUpdateNftMetadata(tokenId);
    } catch (error) {
        console.error(`Error minting token: ${error}`);
        throw error;
    }
}

//// ================================ ////


// Firebase Database functions //
async function getOwnedNftsFromFirestore(ownerAddress) {
    try {
        const nftRef = db.collection('nfts')
            .where('author', '==', ownerAddress)
            .where('isSold', '==', false)
            .where('isAuction', '==', false);
        const nftDocs = await nftRef.get();
        if (nftDocs.empty) {
            return [];
        }
        const nfts = [];
        nftDocs.forEach(doc => {
            nfts.push(doc.data());
        });
        nfts.sort((a, b) => a.tokenId - b.tokenId);
        return nfts;
    } catch (error) {
        console.error(`Error getting owned NFTs from Firestore: ${error}`);
        throw error;
    }
}

async function getOwnedSellingNftsFromFirestore(ownerAddress) { 
    try {
        const nftRef = db.collection('nfts')
            .where('author', '==', ownerAddress)
            .where('isSold', '==', true)
            .where('isAuction', '==', false);
        const nftDocs = await nftRef.get();
        if (nftDocs.empty) {
            return [];
        }
        const nfts = [];
        nftDocs.forEach(doc => {
            nfts.push(doc.data());
        });
        nfts.sort((a, b) => a.tokenId - b.tokenId);
        return nfts;
    } catch (error) {
        console.error(`Error getting owned selling NFTs from Firestore: ${error}`);
        throw error;
    }
}

async function getOwnedAuctionNftsFromFirestore(ownerAddress) {
    try {
        const auctionRef = db.collection('auctions')
            .where('auctioneer', '==', ownerAddress)
            .where('completed', '==', false)
            .where('active', '==', true);
        const auctionDocs = await auctionRef.get();
        if (auctionDocs.empty) {
            return [];
        }
        const auctions = [];
        auctionDocs.forEach(doc => {
            auctions.push(doc.data());
        });
        auctions.sort((a, b) => a.auctionId - b.auctionId);
        return auctions;
    } catch (error) {
        console.error(`Error getting owned auction NFTs from Firestore: ${error}`);
        throw error;
    }
}

async function getAllNftsOnAuctionFromFirestore() {
    try {
        const auctionRef = db.collection('auctions')
            .where('completed', '==', false)
            .where('active', '==', true);
        const auctionDocs = await auctionRef.get();
        if (auctionDocs.empty) {
            return [];
        }
        const auctions = [];
        auctionDocs.forEach(doc => {
            auctions.push(doc.data());
        });
        auctions.sort((a, b) => a.auctionId - b.auctionId);
        return auctions;
    } catch (error) {
        console.error(`Error getting all NFTs on auction from Firestore: ${error}`);
        throw error;
    }
}

async function getAllNftsFromFirestore() {
    try {
        const nftRef = db.collection('nfts')
            .where('isAuction', '==', false);
        const nftDocs = await nftRef.get();
        if (nftDocs.empty) {
            return [];
        }
        const nfts = [];
        nftDocs.forEach(doc => {
            nfts.push(doc.data());
        });
        nfts.sort((a, b) => a.tokenId - b.tokenId); 
        return nfts;
    } catch (error) {
        console.error(`Error getting all NFTs from Firestore: ${error}`);
        throw error;
    }
}

async function getNftFromFirestore(tokenId) {
    try {
        const nftRef = db.collection('nfts').doc(tokenId.toString());
        const nftDoc = await nftRef.get();
        if (!nftDoc.exists) {
            return null;
        }
        return nftDoc.data();
    } catch (error) {
        console.error(`Error getting NFT from Firestore: ${error}`);
        throw error;
    }
}

async function createOrUpdateNftMetadata(tokenId) {
    try {   
        const nftRef = db.collection('nfts').doc(tokenId.toString());
        const nftData = {
            tokenId: tokenId,
            author: ownerAddress,
            price: 0,
            isSold: false,
            isAuction: false,
            bidChange: 'current',
        };
        await nftRef.set(nftData, { merge: true });
        return true;
    } catch (error) {
        console.error(`Error creating or updating NFT metadata: ${error}`);
        throw error;
    }
}

//// ================================ ////

// Listener on blockchain events to update the database // 

module.exports = {
    setApprovalForAll,
    getTopPriceNft,
    getNftMetadata,
    approveNftForMarketplace,
    getAllNftsOnAuction,
    getAllNftsOnMarketplace,
    getOwnedNftsByAddress,
    getOwnedNftsSellingByAddress,
    getOwnedNftsAuctionByAddress,
    getNftFromFirestore,
};