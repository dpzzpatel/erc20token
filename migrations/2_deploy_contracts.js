var DappToken = artifacts.require("./DappToken.sol"); 
var DappTokenSale = artifacts.require("./DappTokenSale.sol"); 

module.exports = function (deployer) {
  deployer.deploy(DappToken,1000000).then(()=>{
    var tokenPrice = "1000000000000000000";
    return deployer.deploy(DappTokenSale,DappToken.address,tokenPrice);
  });   //subsequent arugments to first variable are passed to the constructor
};





// 1 reading smart contract in solidity language from contracts directory
// 2 assigning to a variable 
// 3 deploying the value via deploy function


// artifacts allows us to create a contract abstraction for truffle to use it in JS runtime environment.
