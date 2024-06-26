// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { getContractABI } = require('./utils/getContractABI');
// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractABI = getContractABI('ContractToken');
const contractAddress = process.env.CONTRACT_TTT_ADDRESS; 
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Call blockchain functions here // 

//// ================================ ////

// Listener on blockchain events to update the database // 
contract.on("Transfer", async (from, to, amount) => { 
    try {
        console.log(`Transferred ${amount} tokens from ${from} to ${to}`);
    } catch (error) {
        console.error('Lỗi khi lấy số dư:', error);
        throw error;
    }
});


