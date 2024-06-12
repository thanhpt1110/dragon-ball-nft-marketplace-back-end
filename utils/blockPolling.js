const { ethers } = require("ethers")
const { db } = require("../firebaseAdmin")
const { getContractABI } = require("./getContractABI")
require('dotenv').config();
const { 
  handleListNFTEvent,
  handleUnListNFTEvent,
  handleUpdateListingNFTPriceEvent,
  handleBuyNFTEvent,
} = require('../services/MarketplaceService');

const {
    handleCreateAuctionEvent,
    handleJoinAuctionEvent,
    handleCancelAuctionEvent,
    handleFinishAuctionEvent,
} = require('../services/AuctionService');

const getLastProcessedBlock = async () => {
  const doc = await db.collection('block').doc('lastProcessedBlock').get()
  return doc.exists ? doc.data().lastProcessedBlock : null  
}

const updateLastProcessedBlock = async (blockNumber) => {
  await db.collection('block').doc('lastProcessedBlock').set({ lastProcessedBlock: blockNumber })
}

const provider = new ethers.JsonRpcProvider(process.env.FANTOM_TESTNET_RPC);
const startBlockPolling = async () => {
  const latestBlock = await provider.getBlockNumber();
  const lastProcessedBlock = await getLastProcessedBlock() || latestBlock;

  console.log('Latest block:', latestBlock)  
  for (let block = lastProcessedBlock + 1; block <= latestBlock; block++) {
    await processBlockEvents(block);
  }

  await updateLastProcessedBlock(latestBlock);
};

const contractMarketplaceABI = getContractABI('ContractMarketplace');
const marketplaceContract = new ethers.Contract(process.env.CONTRACT_DRAGON_BALL_MARKETPLACE_ADDRESS, contractMarketplaceABI, provider);

const contractAuctionABI = getContractABI('ContractAuction');
const auctionContract = new ethers.Contract(process.env.CONTRACT_DRAGON_BALL_AUCTION_ADDRESS, contractAuctionABI, provider);

const processBlockEvents = async (blockNumber) => {
  try {
    const eventNames = ['ListNFT', 'UnListNFT', 'UpdateListingNFTPrice', 'BuyNFT'];
    const marketplaceEventPromises = eventNames.map(eventName => 
      marketplaceContract.queryFilter([`${eventName}`], blockNumber, blockNumber)
    );

    const auctionEventNames = ['CreateAuction', 'JoinAuction', 'CancelAuction', 'FinishAuction'];
    const auctionEventPromises = auctionEventNames.map(eventName => 
      auctionContract.queryFilter([`${eventName}`], blockNumber, blockNumber)
    );

    const marketplaceEvents = await Promise.all(marketplaceEventPromises);
    const auctionEvents = await Promise.all(auctionEventPromises);

    // Flatten the arrays of events
    const allMarketplaceEvents = marketplaceEvents.flat();
    const allAuctionEvents = auctionEvents.flat();

    console.log(`Processing events for block: ${blockNumber}`);

    for (const event of allMarketplaceEvents) {
      try {
        if (event.fragment.name === 'ListNFT') {
          await handleListNFTEvent(event);
        } else if (event.fragment.name === 'UnListNFT') {
          console.log('UnList NFT event:', event);
          await handleUnListNFTEvent(event);
        } else if (event.fragment.name === 'UpdateListingNFTPrice') {
          console.log('Update Listing NFT Price event:', event);
          await handleUpdateListingNFTPriceEvent(event);
        } else if (event.fragment.name === 'BuyNFT') {
          console.log('Buy NFT event:', event);
          await handleBuyNFTEvent(event);
        } else {
          console.log(`Unhandled marketplace event: ${event.fragment.name}`, event);
        }
      } catch (error) {
        console.error('Error processing marketplace event:', event, error);
      }
    }

    for (const event of allAuctionEvents) {
      try {
        if (event.fragment.name === 'CreateAuction') {
          console.log('Create Auction event:', event);
          await handleCreateAuctionEvent(event);
        } else if (event.fragment.name === 'JoinAuction') {
          console.log('Join Auction event:', event);
          await handleJoinAuctionEvent(event);
        } else if (event.fragment.name === 'CancelAuction') {
          console.log('Cancel Auction event:', event);
          await handleCancelAuctionEvent(event);
        } else if (event.fragment.name === 'FinishAuction') {
          console.log('Finish Auction event:', event);
          await handleFinishAuctionEvent(event);
        } else {
          console.log(`Unhandled auction event: ${event.fragment.name}`, event);
        }
      } catch (error) {
        console.error('Error processing auction event:', event, error);
      }
    }
  } catch (error) {
    console.error('Error querying events for block:', blockNumber, error);
  }
};

module.exports = { startBlockPolling };