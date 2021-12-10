const Transaction = require('../wallet/transaction');

class TransactionMiner{
    // This class is for anyone who wishes to mine the transactions and receive rewards
    constructor({blockchain,transactionPool,wallet, pubsub}){
        this.blockchain=blockchain;
        this.transactionPool=transactionPool;
        this.wallet = wallet;
        this.pubSub = pubsub;
        
    }
    mineTransaction(){
        const validTransactions= this.transactionPool.validTransactions();//check if transaction pool is valid
        if (validTransactions.length >0){
            validTransactions.push(Transaction.rewardTransaction({minerWallet:this.wallet})); // add the reward transaction for mining
        this.blockchain.addBlock({data:validTransactions}); // add transactions to the block and hash it
        this.pubSub.broadcastChain(); // send the updated chain to all nodes
        this.transactionPool.clearTransactions(); // clear local transaction pool
        return true;
        }
        else{
            console.error('Atleast 1 transactions needed for a block');
            return false;
        }
        
        
    }

}
module.exports = TransactionMiner;