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
async function getAllNftOnMarketplace() {
    try {
        const nfts = await getAllNftFromFirestore();
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
        console.log('Approving token for marketplace...');
    }
    catch (error) {
        console.error(`Error approving token: ${error}`);
        throw error;
    }
}

// async function mintNft(tokenId) {
//     try {
//         const tx = await contractWithSigner.mint(ownerAddress);
//         const receipt = await tx.wait();
//         await createOrUpdateNftMetadata(tokenId);
//     } catch (error) {
//         console.error(`Error minting token: ${error}`);
//         throw error;
//     }
// }


//// ================================ ////


// Firebase Database functions //
async function getAllNftFromFirestore() {
    try {
        const nftRef = db.collection('nfts');
        const nftDocs = await nftRef.get();
        if (nftDocs.empty) {
            return [];
        }
        const nfts = [];
        nftDocs.forEach(doc => {
            nfts.push(doc.data());
        });
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
    getNftMetadata,
    approveNftForMarketplace,
    getAllNftOnMarketplace,
};