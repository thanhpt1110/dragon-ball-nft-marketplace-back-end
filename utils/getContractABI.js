const contractTokenABI = require('../contracts/TokenABI.json');
const contractNftABI = require('../contracts/NftABI.json');
const contractMarketplaceABI = require('../contracts/MarketplaceABI.json');
const contractAuctionABI = require('../contracts/AuctionABI.json');

const getContractABI = (contractName) => {
    switch (contractName) {
        case 'ContractToken':
            return contractTokenABI;
        case 'ContractNFT':
            return contractNftABI;
        case 'ContractMarketplace':
            return contractMarketplaceABI;
        case 'ContractAuction':
            return contractAuctionABI;
        default:
            throw new Error('Unknown contract name');
    }
};

module.exports = {  
    getContractABI,
};
