var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken',function(accounts){

	var tokenInstance;

	it('initialize the contract with the correct values',function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name,'Dapp Token','has correct name');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol,'DAPP','has correct symbol');
		});
	})
	it('allocate the total supply upon deployment',function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(),1000000,'sets the total supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(),1000000,'it allocate the initial supply to admin acocunt')
		});
	});

	it('transfers token ownership',function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1],999999999); //call only allows us to inspect and call the functio
		}).then(assert.fail).catch(function(error){
			if(!error) 
				assert(error.message.indexOf('revert') >=0,'error meesage must contain revert');
			return tokenInstance.transfer.call(accounts[1],250000,{from:accounts[0]});
		}).then(function(success){
			assert.equal(success,true,'it returns true');
			return tokenInstance.transfer(accounts[1],250000,{from:accounts[0]}); //transfer initates a transaction here
		 }).then(function(receipt){
		 	assert.equal(receipt.logs.length,1,'triggers one event');
		 	assert.equal(receipt.logs[0].event,'Transfer','should be the Transfer Event');
		 	assert.equal(receipt.logs[0].args._to,accounts[1],'logs the account the tokens are transfferd to');
		 	assert.equal(receipt.logs[0].args._value,250000,'logs the transfer amount');
		 	return tokenInstance.balanceOf(accounts[1]);
		 }).then(function(balance){
		 	assert.equal(balance.toNumber(),250000,'adds the amount to the receiving account');
		 	return tokenInstance.balanceOf(accounts[0]);
		 }).then(function(balance){
		 	assert.equal(balance.toNumber(),750000,'deducts the amount from the sending account');
		})
	});

	it('approves tokens for delegated transfer',function(){
		return DappToken.deployed().then((instance)=>{
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1],100); //call just calls the function without writing to the blockchain 
		}).then((success)=>{
			assert.equal(success,true,'it returns true');
			return tokenInstance.approve(accounts[1],100,{from:accounts[0]});
		}).then((receipt)=>{
			assert.equal(receipt.logs.length,1,'triggers one event');
		 	assert.equal(receipt.logs[0].event,'Approval','should be the Approval Event');
		 	assert.equal(receipt.logs[0].args._owner,accounts[0],'logs the account the tokens are authorized by');
		 	assert.equal(receipt.logs[0].args._spender,accounts[1],'logs the account the tokens are authorized to');
		 	assert.equal(receipt.logs[0].args._value,100,'logs the transfer amount');
		 	return tokenInstance.allowance(accounts[0],accounts[1]);
		}).then((allowance)=>{
			assert.equal(allowance,100,'stores the allowance for delegated transfer');
		});
	});

	it('handles delegated transfers	',()=>{
		return DappToken.deployed().then((instance)=>{
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendAccount = accounts[4];
			return tokenInstance.transfer(fromAccount,100,{from:accounts[0]});
		}).then((receipt)=>{
			//Approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spendAccount,10,{from:fromAccount});
		}).then((receipt)=>{
			//Try transfering something larger than the sender's balance
			return tokenInstance.transferFrom(fromAccount,toAccount,9999,{from:spendAccount});
		}).then(assert.fail).catch((error)=>{
			error.message.indexOf('revert'>=0,'cannot transfer value larger than balance');
			//Try transferring something larger than the approved amount
			return tokenInstance.transferFrom(fromAccount,toAccount,20,{from:spendAccount});
		}).then(assert.fail).catch((error)=>{
			assert(error.message.indexOf('revert')>=0,'cannot transfer value larger than approved amount');			
			return tokenInstance.transferFrom.call(fromAccount,toAccount,10,{from:spendAccount});
		}).then((success)=>{
			assert.equal(success,true);
			return tokenInstance.transferFrom(fromAccount,toAccount,10,{from:spendAccount});
		}).then((receipt)=>{
			assert.equal(receipt.logs.length,1,'triggers one event');
		 	assert.equal(receipt.logs[0].event,'Transfer','should be the Transfer Event');
		 	assert.equal(receipt.logs[0].args._from,fromAccount,'logs the account the tokens are transfferd to');
		 	assert.equal(receipt.logs[0].args._to,toAccount,'logs the account the tokens are transfferd to');
		 	assert.equal(receipt.logs[0].args._value,10,'logs the transfer amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then((balance)=>{
			assert.equal(balance.toNumber(),90,'deducts the amount from the sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then((balance)=>{
			assert.equal(balance.toNumber(),10,'adds the amount to the receiving account');
			return tokenInstance.allowance(fromAccount,spendAccount)
		}).then((allowance)=>{
			assert.equal(allowance,0,'deducts the amount from the allowance')
		})
	});
})