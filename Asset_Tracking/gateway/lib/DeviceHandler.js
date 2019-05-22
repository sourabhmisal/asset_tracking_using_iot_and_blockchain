"use strict";

const Thing = require('./Thing.js');

var config;
var things = [];

module.exports = {
  configure: (c) => {
    config = c;

    config.devices.forEach((device, idx) => {
      var thing = new Thing({
        "name":device.name,
        "privateKey": "./security/" + device.privateKey,
        "certificate": "./security/" + device.certificate
      });

      things.push(thing);
    });
  },
  getThings: () => {
    return things;
  }
};
