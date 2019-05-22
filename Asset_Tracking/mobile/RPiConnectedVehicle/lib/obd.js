'use strict';

const SerialPort = require('serialport');
const OBDReader = require('bluetooth-obd');
const GPS = require('gps');
const shortid = require('shortid');
const bunyan = require("bunyan");
const request = require('request');

const parsers = SerialPort.parsers;
const port = '/dev/ttyS0';
const gps = new GPS;
const btOBDReader = new OBDReader();
const moduleName = "vehicle";
const waitToRestart = 1000 * 60 * 5;//Every 5 minutes reload the program if there is no OBD

var dataAvailable = false;
var correlationId ;
var log;
var hologramKey;
var deviceId;
var parser;

var currentMessage = {
  "vss":0,
  "rpm":0,
  "temp":1,
  "location":{}
};

const self = module.exports = {
  configure:() => {

    log = bunyan.createLogger({
        name: moduleName,
        src: false,
        streams: [
          {
            level:'debug',
            stream: process.stdout
          },
          {
            level: 'debug',
            path: '/tmp/' + moduleName + ".log"
          },
          {
            level: 'error',
            path: '/tmp/' + moduleName + ".err"
          }
        ]
      });

      parser = new parsers.Readline({
        delimiter: '\r\n'
      });

      const serialPort = new SerialPort(port, {
        baudRate: 9600
      });

      serialPort.pipe(parser);

      hologramKey = process.env.HOLOGRAM_KEY;
      deviceId = process.env.HOLOGRAM_DEVICE_ID;
  },
  start:() => {
    gps.on('data', function(data) {
      if(data.type === "GGA") {
        log.debug("DATA ", data);
      } else {
        log.debug("DATA INKNOW ", data);
      }
    });

    parser.on('data', function(data) {
      gps.update(data);
    });

    btOBDReader.on('dataReceived', function (json) {
      dataAvailable = true;

      if(json.mode) {
        log.debug("Data received from car ", json);
        currentMessage[json.name] = json.value;
      }
    });

    btOBDReader.on('connected', function () {
      this.addPoller("vss");
      this.addPoller("rpm");
      this.addPoller("temp");

      this.startPolling(5000);
    });

    btOBDReader.on('error', function (data) {
      dataAvailable = false;
      log.error('Restarting due error: ' , data);
/*
      setTimeout(() => {
        process.exit(1);
      }, waitToRestart);*/
    });

    btOBDReader.autoconnect('OBDII');

    const base64 = Buffer.from(JSON.stringify(currentMessage)).toString('base64');

    /*setInterval(() => {
      var me = "{\"deviceid\": " + deviceId + ", \"data\": \"" + base64 + "\"}";
      console.log(me);
      request({
        method: 'POST',
        url: 'https://dashboard.hologram.io/api/1/csr/rdm?apikey=' + hologramKey,
        headers: {
          'Content-Type': 'application/json'
        },
        body: me
      }, function (error, response, body) {
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        console.log('Response:', body);
      });
    }, 1000 * 15);*/

  }
};
