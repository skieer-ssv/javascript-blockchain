const PubNub = require('pubnub');

const credentials = {
  publishKey: "pub-c-14544d74-310f-42c8-b748-33065fab7e2a",
  subscribeKey: "sub-c-bb14d736-11a5-11ec-83e9-0e85f81976b6",
  secretKey: "sec-c-NmQzODk1NTktZTIxMC00ZjVlLWJhYjYtYzgwNzI0OGQwOTVk",
}; 
const CHANNELS = {
  TEST: "TEST",
};

class PubSub {
  constructor() {
    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });

    this.pubnub.addListener(this.listner());
  }
  listner(){
      return{
        message: (messageObject) => {
            const {channel,message}= messageObject;
            console.log(`Message Received. Channel: ${channel}. Message: ${message}`);
        }
      }
  }

  publish({channel,message}){
      this.pubnub.publish({channel,message});
  }
}

module.exports = PubSub;