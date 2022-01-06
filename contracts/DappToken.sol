// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract DappToken{
	//Constructor
	//Set the total number of tokens
	// Read the total number of tokens
    string public name = 'Dapp Token';
    string public symbol = 'DAPP';
    uint256 public totalSupply;//state variable which is accesible to entire contract. This will write to blockchain updating the state of the blockchain.
	mapping(address=> uint256) public balanceOf;

	mapping(address=>mapping(address=>uint256)) public allowance;

	event Transfer(   //event in solidity in which a contract allows a consumer to subscribe to transfer event
		address indexed _from,
		address indexed _to,
		uint256 _value

	);

	event Approval(   //event in solidity in which a contract allows a consumer to subscribe to transfer event
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);
	constructor(uint256 _initalSupply){ //solidity convention to use _before a local variable
		balanceOf[msg.sender] = _initalSupply; //msg is a global variable in solidity which has sevreal values you can read from it. sender it the address which calls this function
		totalSupply = _initalSupply;  
		//allocate the initial supply
	}
	//Transfer
	function transfer(address _to,uint256 _value) public returns(bool success){
		require(balanceOf[msg.sender] >= _value);
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value; 
		emit Transfer(msg.sender,_to,_value);
		return true;
	}

	//approve event
	function approve(address _spender,uint256 _value) public returns(bool success){
		//allowance
		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender,_spender,_value);
		return true;
	}
	//Delegated Transfer

	//TransferFrom
	function transferFrom(address _from,address _to,uint256 _value)public returns(bool success){
		//Require _from  has enough tokens
		require(_value<=balanceOf[_from]);
		//Require allowance is big enough
		require(_value<=allowance[_from][msg.sender]);
		//Change the balance
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		//Update the allowance
		allowance[_from][msg.sender] -= _value;
		//Transfer Event
		emit Transfer(_from,_to,_value);
		return true;
	}
}