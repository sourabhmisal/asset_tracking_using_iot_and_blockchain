"use strict";

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bunyan = require('bunyan');
const exphbs  = require('express-handlebars');
const expressWs = require('express-ws')(app);
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const dynamoDS = require('./dynamoDatasource.js');

var config;
var log;
var deviceHandler;
var blockchainHandler;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var modules = module.exports = {
  configure: (_config_, devHandler, _blockchainHandler) => {
    config = _config_;
    deviceHandler = devHandler;
    blockchainHandler = _blockchainHandler;

    log = modules.createLogger("webserver");

    app.engine('handlebars', exphbs({
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, 'views/layouts')
    }));

    app.set('view engine', 'handlebars');
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', path.join(__dirname, 'views'));
    app.use('/dh7', express.static(__dirname + '/public'));

  },
  start:() => {
    app.listen(config.port, function () {
      log.info('Listening on port ' , config.port);
    });
  },
  createLogger: (module) => {
    return bunyan.createLogger({
      name: module,
      src: false,
      streams: [
        {
          level:'debug',
          stream: process.stdout
        }
      ]
    });
  }
};


app.get('/dh7/index', (req, res) => {

});

app.post('/dh7/assetTracker/event', (req, res) => {
  const body = req.body;
  const payload = JSON.parse(body.payload);
  const base64 = new Buffer(payload.data, 'base64').toString();;
  const json = JSON.parse(new Buffer(base64, 'base64').toString());

  log.debug("Parsing event request ", json);

  deviceHandler.getThings().forEach((thing, idx) => {
     if(thing.getName() == json.deviceId) {
       thing.publishMessage("dh7/deviceMessage", json);
     }
  });

  res.status(200).json({"message":"Event processed"});
});

app.post('/dh7/assetTracker/rule', (req, res) => {
  const json = req.body;

  log.debug("Processing event from AWS rule ", json);

  res.status(200).json({"message":"Event processed"});
});

app.post('/dh7/assetTracker/alert', (req, res) => {
  const json = req.body;

  log.debug("Processing event from AWS alert ", json);

  res.status(200).json({"message":"Event processed"});
});
