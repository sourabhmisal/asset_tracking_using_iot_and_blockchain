"use strict";


/**
* This module is the handler of the messages that should be
* persisted some where.
*
* This is the way to allow the server to process on its own time
* the message (transactions) storing.
*
* author Oscar I Hernandez [ o at dh7labs dot mx ]
*/
const utils = require('./utils.js');
const AWS = require("aws-sdk");
const argv = require('minimist')(process.argv.slice(2));

var log;
var dynamoClient;

const self = module.exports = {
  configure:() => {
    log = utils.createLogger("messaging-client");

    AWS.config.update({
      region: "us-east-1",
        "accessKeyId": argv.aws.dynamo.accessKey ,
        "secretAccessKey": argv.aws.dynamo.secretKey
      });

    dynamoClient = new AWS.DynamoDB.DocumentClient();
  },
  saveTransaction: (transaction) => {
    var params = {
        TableName:"transactions",
        Item:{
            "tx": transaction.tx,
            "info":transaction.associatedTransaction
        }
    };

      dynamoClient.put(params, function(err, data) {
        if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
        }
      });

  }
};
