// Viết hàm gọi xử lý sự kiện SmartContract ở đây
const { ethers } = require('ethers');
const { getContractABI } = require('./utils/getContractABI');

// Set up Contract and Provider
const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const contractAddress = process.env.CONTRACT_TTT_ADDRESS; 
const contractABI = getContractABI('ContractTTT');
const contract = new ethers.Contract(contractAddress, contractABI, provider);

contract.on("Transfer", async (from, to, amount) => { 
    try {
        console.log(`Transferred ${amount} tokens from ${from} to ${to}`);
    } catch (error) {
        console.error('Lỗi khi lấy số dư:', error);
        throw error;
    }
});
