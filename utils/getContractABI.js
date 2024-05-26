const contractTttABI = require('../contracts/TTT.json');

const getContractABI = (contractName) => {
    switch (contractName) {
        case 'ContractTTT':
            return contractTttABI;
        default:
            throw new Error('Unknown contract name');
    }
};

module.exports = {  
    getContractABI,
};
