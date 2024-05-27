// Define the service to interact with the blockchain
const { ethers } = require('ethers');
const { getContractABI } = require('./utils/getContractABI');
// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractAddress = process.env.CONTRACT_TTT_ADDRESS; 
const contractABI = getContractABI('ContractTTT');
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Call blockchain functions here // 

//// ================================ ////

// Listener on blockchain events to update the database // 