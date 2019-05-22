const webserver = require('./lib/webserver.js');
const deviceHandler = require('./lib/DeviceHandler.js');
const blockchainHandler = require('./lib/BlockchainHandler.js');

const config = {
  "port":4500,
  "devices":[
    {
      "name":"MyVehicle",
      "certificate":"d91e5af26b-certificate.pem.crt",
      "privateKey":"d91e5af26b-private.pem.key",
      "publicKey":"d91e5af26b-public.pem.crt"
    }
  ],
  "multichain": {
    "host":"at.dh7labs.mx",
    "port":9564,
    "user":"multichainrpc",
    "password":"5Sc4g2k5nmjnUiSfqq1CWqfjPK8V14ed1UvDrtvFY6Ri",
    "mainAddress":"1nRUaeQHddj6VU6urHsGEK5qaqwp3uj6Z7Vq6"
  }
};

deviceHandler.configure(config);
blockchainHandler.configure(config);

webserver.configure(config, deviceHandler, blockchainHandler);

webserver.start();
