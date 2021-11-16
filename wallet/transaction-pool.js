const Transaction = require("./transaction");

class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }
  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }
  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(
      (transaction) => transaction.input.address === inputAddress
    );
  }
  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }
  validTransactions() {
    return Object.values(this.transactionMap).filter(
        (transaction) =>
      Transaction.validTransaction(transaction)
    );
  }
  clearTransactions(){
      this.transactionMap={};
  }
  clearBlockchainTransactions({chain}){
    for(let i=1;i<chain.length;i++){
      const block = chain[i]; //pick a block from list of blocks in chain
      
      for(let transaction of block.data){ // picking a transaction from multiple transactions in the data of block
        
        if(this.transactionMap[transaction.id]){ // check if a transaction stored in blockchain is also present in the local transaction pool and delete it
          
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}

module.exports = TransactionPool;
