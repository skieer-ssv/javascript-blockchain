const TransactionPool = require("./transaction-pool");
const Transaction = require("./transaction");
const Wallet = require("./index");
const { validTransaction } = require("./transaction");
const Blockchain = require("../blockchain");
describe("TransactionPool", () => {
  let transactionPool, transaction, senderWallet;
  beforeEach(() => {
    senderWallet = new Wallet();
    transactionPool = new TransactionPool();
    transaction = new Transaction({
      senderWallet,
      recipient: "pool-recipient",
      amount: 60,
    });
  });

  describe("setTransaction()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
  describe("existingTransaction()", () => {
    it("returns an existing transaction given an input address", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });

  describe("validTransaction()", () => {
    let validTransactions, errorMock;
    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;
      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: "any-recipient",
          amount: 30,
        });
        if (i % 3 === 0) {
          transaction.input.amount = 9999999;
        } else if (i % 3 === 1) {
          //todo check without new keyword
          transaction.input.signature = new Wallet().sign("foo");
        } else {
          validTransactions.push(transaction);
        }
        transactionPool.setTransaction(transaction);
      }
    });

    it("returns valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
    it("logs errors for invalid transactions", () => {
      transactionPool.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    });
  });
  describe("clearTransactions()", () => {
    beforeEach(() => {
      transactionPool.setTransaction(transaction);
      transactionPool.clearTransactions();
    });
    it("clears the transactionPool", () => {
      expect(transactionPool.transactionMap).toEqual({});
    });
  });
  describe("clearBlockchainTransactions()", () => {
    const blockchain = new Blockchain();
    let expectedTransactionMap;
    beforeEach(()=>{   
      expectedTransactionMap = {};
      for (let i = 0; i < 10; i++) {
      transaction = new Wallet().createTransaction({
       recipient: "foo",
       amount: 20,
     });
     transactionPool.setTransaction(transaction);
     if (i % 2 === 0) blockchain.addBlock({ data: [transaction] });
     else expectedTransactionMap[transaction.id] = transaction;
   }})
 

    

    it("clears the pool of any transactions existing in blockchains", () => {
    

        transactionPool.clearBlockchainTransactions({chain:blockchain.chain});
        
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
