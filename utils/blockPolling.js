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
    startListeningToCreateAuctionEvent,
    startListeningToJoinAuctionEvent,
    startListeningToCancelAuctionEvent,
    startListeningToFinishAuctionEvent,
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
          console.log(`Unhandled marketplace event: ${event.event}`, event);
        }
      } catch (error) {
        console.error('Error processing marketplace event:', event, error);
      }
    }

    for (const event of allAuctionEvents) {
      try {
        if (event.event === 'CreateAuction') {
          console.log('Create Auction event:', event);
          // Thêm xử lý sự kiện CreateAuction ở đây
        } else if (event.event === 'JoinAuction') {
          console.log('Join Auction event:', event);
          // Thêm xử lý sự kiện JoinAuction ở đây
        } else if (event.event === 'CancelAuction') {
          console.log('Cancel Auction event:', event);
          // Thêm xử lý sự kiện CancelAuction ở đây
        } else if (event.event === 'FinishAuction') {
          console.log('Finish Auction event:', event);
          // Thêm xử lý sự kiện FinishAuction ở đây
        } else {
          console.log(`Unhandled auction event: ${event.event}`, event);
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