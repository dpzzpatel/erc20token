var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract("DappTokenSale",(accounts)=>{
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[5];
	var tokenInstance;
	var tokenPrice = 1000000000000000; //in wei
	var tokensAvailable = 750000;
	var numberOfTokens;

	it('initialize the contract with the correct values',()=>{
		return DappTokenSale.deployed().then((instance)=>{
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then((address)=>{
			assert.notEqual(address,0x0,'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then((address)=>{
			assert.notEqual(address,0x0,'has a token contract address');
			return tokenSaleInstance.tokenPrice();
		}).then((price)=>{
			assert.equal(price,tokenPrice,'token price is correct');
		});
	});

	it('facilitates token buying', ()=>{
		return DappToken.deployed().then((instance)=>{
			//Grab tokeInstance first
			tokenInstance = instance;
			return DappTokenSale.deployed()
		}).then((instance)=>{
			//then grab tokenSaleInstance
			tokenSaleInstance = instance;
			//Provision 75% of tokens to the token sale contract
			return tokenInstance.transfer(tokenSaleInstance.address,tokensAvailable,{from:admin});
		}).then((receipt)=>{  //receipt whenever a transaction happens
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens,{from:buyer,value:numberOfTokens * tokenPrice});
		}).then((receipt)=>{
		 	assert.equal(receipt.logs.length,1,'triggers one event');
		 	assert.equal(receipt.logs[0].event,'Sell','should be the Sell Event');
		 	assert.equal(receipt.logs[0].args._buyer,buyer,'logs the account that purchased the tokens');
		 	assert.equal(receipt.logs[0].args._amount,numberOfTokens,'logs the number of tokens purchased');
		 	return tokenSaleInstance.tokensSold();
		}).then((amount)=>{
			assert.equal(amount.toNumber(),numberOfTokens,'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then((balance)=>{
			assert.equal(balance.toNumber(),numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then((balance)=>{
			assert.equal(balance.toNumber(),tokensAvailable - numberOfTokens);
			//Try to buy tokens different from the ether value
			return tokenSaleInstance.buyTokens(numberOfTokens,{from:buyer,value:1});
		}).then(assert.fail).catch((error)=>{
			if(!error)
				assert(error.message.indexOf('revert')>=0,'msg.value must equal number of token in wei');
			var excesstokens = 800000;
			return tokenSaleInstance.buyTokens(excesstokens,{from:buyer,value:excesstokens*tokenPrice});
		}).then(assert.fail).catch((error)=>{
			if(!error)
				assert(error.message.indexOf('revert')>=0,'cannot purchase more tokens than tokensAvailable');
		});
	});

	it('ends token sale',()=>{
		return DappToken.deployed().then((instance)=>{
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then((instance)=>{
			tokenSaleInstance=instance;
			// Try to end sale from account other than the admin
			return tokenSaleInstance.endsale({from:buyer});
		}).then(assert.fail).catch((error)=>{
			if(!error)
				assert(error.message.indexOf('revert'>=0,'must be admin to end the sale'));
			//End Sale as admin
			return tokenSaleInstance.endsale({from:admin});
		}).then(()=>{
			return tokenSaleInstance.endsale({from:admin});
		}).then((receipt)=>{
			return tokenInstance.balanceOf(admin);
		}).then((balance)=>{
			assert.equal(balance.toNumber(),999990,'returns all unsold dapp tokens to admin');
			//Check that token price was reset when self destruct was called
			return web3.eth.getBalance(tokenSaleInstance.address)
		}).then((balance)=>{
      		assert.equal(balance, 0);
		});
	});
});