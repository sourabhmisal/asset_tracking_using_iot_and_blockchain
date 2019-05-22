"use strict";

/**
* This class represents an aws thing and its shadow
*
* author Oscar I Hernandez [ o at dh7labs dot mx ]
*/

const aws = require('aws-iot-device-sdk');

class Thing {
  constructor(metadata) {
    this.deviceMetadata = metadata;

    this.device = aws.device({
      keyPath: this.deviceMetadata.privateKey,
      certPath: this.deviceMetadata.certificate,
      caPath: "./security/ca.pem",
      clientId: this.deviceMetadata.name,
      host: "a31gypxcizxwx4.iot.us-east-1.amazonaws.com"
    });

    this.device.on('connect', function() {
      console.log('Device connected to AWS');
    });

    this.device.on('error', function(error) {
      console.log("Error ", error);
    });

    this.device.subscribe("dh7/deviceMessage");

  }

  publishMessage (topic, message) {
    this.device.publish(topic, JSON.stringify(message));
  }

  getName() {
    return this.deviceMetadata.name;
  }
}

module.exports = Thing;
