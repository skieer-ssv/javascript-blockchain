//......................REQUIREMENTS...............................................
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub-redis"); //This uses redis database for pubsub
// const PubSub = require("./app/pubsub-nub"); //This uses PubNub service for pubsub
const request = require("request");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet/index");
const TransactionMiner = require('./app/transaction-miner');
const { splitBsProps } = require("react-bootstrap/lib/utils/bootstrapUtils");

//Check whether we are in development env
const isDevelopment = process.env.ENV ==='development';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = isDevelopment? `http://localhost:${DEFAULT_PORT}`:'https://'; //add original assigned url here
const REDIS_URL = isDevelopment? 'redis://127.0.0.1:6379':'redis://'; //add redis-url here

//.....................CLASS OBJECTS CREATION...................................................
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain,transactionPool,redisUrl: REDIS_URL}); //Passing blockchain and transactions to be subscribed and published
const transactionMiner = new TransactionMiner({blockchain,transactionPool,wallet,pubsub});


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'client/dist')));
//.....................API ENDPOINT CALLS.................................................
app.get("/api/blocks", (req, res) => {
  //request for local blockchain instance
  res.json(blockchain.chain);
});
app.get('/api/blocks/length',(req,res)=>{
  res.json(blockchain.chain.length);
});

app.get('/api/blocks/:id',(req,res)=>{
  const {id} = req.params;
  const {length} = blockchain.chain;

  const blocksReversed= blockchain.chain.slice().reverse();
  let startIndex = (id-1) * 5;
  let endIndex= id*5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
})

app.post("/api/mine", (req, res) => {
  //add new block to the local blockchain and broadcast it
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  // add a new transaction to the local pool
  const { recipient, amount } = req.body;
  if( recipient ===''){
    res.status(458).json({error:"Invalid receiver's Address"});
  }
  else if(amount<0 || amount ===0 ){
    res.status(458).json({error:"Invalid Amount"});
  }

  else{
  let transaction = transactionPool.existingTransaction({inputAddress:wallet.publicKey});
console.log(recipient,amount);
  try {
    if (transaction){
transaction.update({senderWallet:wallet ,recipient,amount});
    }
    else{
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain:blockchain.chain
      });
    }
    
  } catch (error) {
    return res.status(400).json({type:'error',message:error.message});
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({type:'success', transaction });}
});
app.get("/api/transaction-pool-map",(req,res)=>{
  //request for local transaction pool map
  res.json(transactionPool.transactionMap);
});
app.get('/api/mine-transactions',(req,res)=>{
  //Mine the local transaction pool, add it to the blockchain and broadcast it
  if(! transactionMiner.mineTransaction()){
    
res.status(457).json({error:"requires atleast 1 Transactions for Mining a block"});
  }
  else{
    res.redirect('/api/blocks');
  }
  

})

app.get('/api/wallet-info',(req,res)=>{
  const address = wallet.publicKey;
  res.json({address,balance:Wallet.calculateBalance({chain:blockchain.chain,address})});
})

app.get('/api/known-addresses',(req,res)=>{
const addressMap ={};
for(let block of blockchain.chain){
  for(let transaction of block.data){
    const recipient = Object.keys(transaction.outputMap);
    recipient.forEach(recipient => addressMap[recipient]= recipient);
  }
}
res.json(Object.keys(addressMap));
})



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

//......................DUMMY TEST DATA ......................................
if(isDevelopment){
const walletFoo= new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction=({wallet,recipient,amount})=>{
const transaction = wallet.createTransaction({recipient,amount,chain:blockchain.chain});
transactionPool.setTransaction(transaction);
};

const walletAction = ()=>generateWalletTransaction({wallet,recipient:walletFoo.publicKey,amount:10});
const walletFooAction = ()=>generateWalletTransaction({wallet: walletFoo,recipient:walletBar.publicKey,amount:10});
const walletBarAction = ()=>generateWalletTransaction({wallet: walletBar,recipient:wallet.publicKey,amount:10});

for(let i=0;i<20;++i){
  if (i%3===0){
    walletAction();
    walletFooAction();
  }
  else if (i%3===1){
    walletAction();
    walletBarAction();
  }
  else{
    
      walletBarAction();
      walletFooAction();
    
  }
  transactionMiner.mineTransaction();
}}
//......................FUNCTIONS.......................................................
const syncWithRootNode = () => {
  // get same copy of blockchain and transaction pool as node
  request(
    {
      url: `${ROOT_NODE_ADDRESS}/api/blocks`,
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("replace chain on a sync with ", rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );
  request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error,response,body)=>{
    if(!error && response.statusCode ===200){
      const rootTransactionPoolMap = JSON.parse(body);
      console.log("replace chain on sync with ", rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000); //This will allocate random port numbers to the peer nodes
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootNode();
  }
});
