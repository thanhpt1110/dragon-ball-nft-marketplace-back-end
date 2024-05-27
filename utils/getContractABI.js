const contractTttABI = require('../contracts/TTT.json');

const getContractABI = (contractName) => {
    switch (contractName) {
        case 'ContractTTT':
            return contractTttABI;
        case 'ContractDragonBall':
            return contractDragonBallABI;
        case 'ContractDragonBallMarketplace':
            return contractDragonBallMarketplaceABI;
        case 'ContractDragonBallAuction':
            return contractDragonBallAuctionABI;
        default:
            throw new Error('Unknown contract name');
    }
};

module.exports = {  
    getContractABI,
};
