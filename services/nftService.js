// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { getContractABI } = require('../utils/getContractABI');
const axios = require('axios');
const ownerAddress = '0xcbB1be345A9a86Ce092F99c6fb2D874939Ee4c4b'
const { db } = require('../firebaseAdmin'); 

// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractAddress = process.env.CONTRACT_DRAGON_BALL_ADDRESS;
const contractABI = getContractABI('ContractNFT');

// Set up the signer (Wallet)
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Contract to read data from the blockchain
const contract = new ethers.Contract(contractAddress, contractABI, provider);
// Contract to write data to the blockchain
const contractWithSigner = new ethers.Contract(contractAddress, contractABI, wallet);


// Call blockchain functions here // 
async function getNftMetadata() {
    try {
        for (let i = 2; i <= 29; ++i) {
            await mintNft(i);
            await createOrUpdateNftMetadata(i);
        }
        return metadata.data;
    } catch (error) {
        console.error(`Error getting token URI: ${error}`);
        throw error;
    }
}

async function mintNft(tokenId) {
    try {
        // Call the mint function on the contract
        const tx = await contractWithSigner.mint(ownerAddress);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        console.log(`Transaction hash: ${receipt.transactionHash}`);

        // Call createOrUpdateNftMetadata after minting
        await createOrUpdateNftMetadata(tokenId);
    } catch (error) {
        console.error(`Error minting token: ${error}`);
        throw error;
    }
}


//// ================================ ////


// Firebase Database functions //
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
};