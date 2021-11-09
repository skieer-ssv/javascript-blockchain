const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub-redis"); //This uses redis database for pubsub
// const PubSub = require("./app/pubsub-nub"); //This uses PubNub service for pubsub
const request = require("request");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet/index");
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain,transactionPool}); //Passing blockchain and transactions to be subscribed and published

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { recipient, amount } = req.body;
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
      });
    }
    
  } catch (error) {
    return res.status(400).json({type:'error',message:error.message});
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({type:'success', transaction });
});
app.get("/api/transaction-pool-map",(req,res)=>{
  res.json(transactionPool.transactionMap);
});

const syncWithRootNode = () => {
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

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithRootNode();
  }
});
