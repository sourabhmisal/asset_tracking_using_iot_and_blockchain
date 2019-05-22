var config;
var log;
var multichain;

var self = module.exports = {
  configure: (_c_) => {
    config = _c_;

    multichain = require("multichain-node")({
        port: config.multichain.port,
        host: config.multichain.host,
        user: config.multichain.user,
        pass: config.multichain.password
    });

    multichain.getInfo((err, info) => {
        if(err == undefined){

          console.log("Blockchain info ", info);

          multichain.subscribe({"stream":"TruckEventStream"}, (error, data) => {});
          multichain.subscribe({"stream":"TruckAlertStream"}, (error, data) => {});
          multichain.subscribe({"stream":"TruckAlertStream"}, (error, data) => {});
          multichain.subscribe({"asset":"Fuel"}, (error, data) => {});
        }
    });

  },
  sendTransaction: (deviceName, stream, key, payload, callback) => {
    config.devices.forEach((dev, idx) => {
      if(dev.id === deviceName) {
        multichain.publishFrom({
          "from":dev.address,
          "stream":stream,
          "key":key,
          "data": new Buffer(JSON.stringify(payload)).toString("hex")
        }, (error, tx) => {
          if(!error) {
            callback(tx);
          }
        });
      }
    });
  },
  transfer: (from, to, amount, callback) => {
    multichain.sendFromAddress({
      "from":from,
      "to":to,
      amount: amount
    }, (error, tx) => {
      if(!error) {
        callback(tx);
      }
    });
  },
  sendAsset: (from, to, comment, amount, callback) => {
    multichain.sendFromAddress({
      "from":from,
      "to":to,
      "amount":amount,
      "comment": comment,
      "comment-to": comment
    }, callback);
  }
};
