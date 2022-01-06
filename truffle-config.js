const { alchemyApiKey, mnemonic } = require('./secrets.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks:{
    development:{
      host:"127.0.0.1",
      port:"7545",
      network_id:"*"
    },
    rinkeby:{
      provider: () => new HDWalletProvider(
          mnemonic, `wss://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
        ),
          network_id: 4,
          gasPrice: 10e9,
          skipDryRun: true,
      }
  },
  compilers: {
    solc: {
      version: "^0.8.10",
    }
  }
};


