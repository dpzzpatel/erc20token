// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./DappToken.sol";

contract DappTokenSale{
	address  admin;
	DappToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	event Sell(address _buyer,uint256 _amount);

	constructor(DappToken _tokenContract,uint256 _tokenPrice){
		//Assign an admin
		admin = msg.sender;
		//Token Contract
		tokenContract = _tokenContract; // access to token contract for buying 
		//Token Price
		tokenPrice = _tokenPrice;
	}

	// multiply func
	function multiply(uint x,uint y) internal pure returns(uint z){ // internal cannot be called from oustide the contract, pure doesnt not create any transaction or read or write data to blockchain,accepts and returns the same data type
		require(y==0 || (z=x*y)/y==x);
	}

	function buyTokens(uint256 _numberOfTokens) public payable{  //payble allows someone to send ether in order to buy the tokens

		//Require that value is equal to tokens
		require(msg.value == multiply(_numberOfTokens,tokenPrice));
		//require that the contract has enough tokens

		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);     //this refers to the balance of the smart contract in solidity
		//require that transfer is successful
		require(tokenContract.transfer(msg.sender,_numberOfTokens));  // actual, buy functionality

		//keep track of tokensSold
		tokensSold += _numberOfTokens;
		//Trigger sell event
		emit Sell(msg.sender,_numberOfTokens);
	}

	//Ending Toke DappTokenSale
	function endsale()public{
		//Require admin
		require(msg.sender==admin);
		//Transfer remaining dapp tokens to admin
		require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
		//Destroy contract
		selfdestruct(payable(msg.sender));
	}
}