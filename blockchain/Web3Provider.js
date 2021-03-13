/*
	Ethereum utilities
*/
const HDWalletProvider = require("@truffle/hdwallet-provider")


const Wallet = require('ethereumjs-wallet')
const EthUtil = require('ethereumjs-util');
const Web3 = require('web3');

/*
	UI utilities
*/
const prompt = require('prompt');
const fs  = require('fs');

/*
	Web3Provider ingests a private key in the form of a string or V3 keystore file, 
	configures a connection to the ethereum blockchain and returns a Web3 instance.

	This class is may be used to interface with with contracts which have been deployed 
	to the blockchain. A helper method is included so truffle-config.js can plug into 
	blockchain configration data allowing for seamless deployment and testing. 
*/
class Web3Provider {

	/**
		Initialse connection to a blockchain based on configuration data
	*/
	constructor( _network, _keystore ){

		/*
			Step 1: Read configuration file
		*/
		this.config = JSON.parse(fs.readFileSync( "./blockchain/config/blockchain.env", 'utf8') );

		/*
			Step 2: Configure web3 provider
		*/
		let provider = null;

		if ( this.config[_network].api == "" ) {

			provider = new Web3.providers.HttpProvider(this.config[_network].url);
		}
		else {	

			provider = new Web3.providers.HttpProvider(this.config[_network].url + this.config[_network].api);
		}
	
		this.web3 = new Web3(provider);
		this.web3.eth.net.isListening()
				.then(() => console.log(''))
				.catch(e => console.log('web3 connection error'));


		/*
			Step 3: Read privateKey file and initialize account on web3 instance
		*/
		this.keystore = JSON.parse(fs.readFileSync( "./blockchain/config/keystore.env" , 'utf8') );

		/*
			Case 3.1: V3 keystore file (prompt for password)
		*/
		if ( this.keystore[_keystore].type == "keystore" ) {

			let _web3WalletFromV3 = async( _passwd ) => {
				
				/* 
					Build account object and query ETH balance
				*/
				this.keyfile = JSON.parse(fs.readFileSync( this.keystore[_keystore].path , 'utf8') );

				this.account = this.web3.eth.accounts.decrypt( this.keyfile, _passwd);

				let _account_balance = await this.web3.eth.getBalance(this.account.address)

				console.log("\nUsing Account: " + this.account.address + "(" + this.web3.utils.fromWei(_account_balance, "ether") + " ETH)");

			}

			var prompt = require('prompt-sync')();

			var passwd = prompt.hide( 'ENTER keystore password: ')

			_web3WalletFromV3(passwd)
		}
	}

	/*
		Get configured address
	*/
	getAddress( ) {

		return this.account.address;
	}

	/*
		Method which returns an on-chain instance of a contract
	*/
	getContract( _address ) {

		/* 
			Return contract interface
		*/
		var _contract = JSON.parse( fs.readFileSync( "./blockchain/contracts/" + _address +".json" , 'utf8') );

		var Contract  = new this.web3.eth.Contract(  _contract.abi, _address );
		
		return Contract;
	}

	/*
		Construct an object that we can import into truffle-config.js
	*/
	getTruffleNetworks( ) {

		var truffleConfig = {}

		/*
			need to deep copy objects to eliminate "this" references in external calls
			TypeError: Cannot read property 'privateKey' of undefined
		*/
		let _config  = Object.assign({}, this.config);

		let _account = Object.assign({}, this.account);

		for (const [key, value] of Object.entries(_config)) {

			truffleConfig[key] = {

				provider 	:  function() {
      				return new HDWalletProvider( [ _account.privateKey ] , _config[key].url + _config[key].api, 0 , 1);
				},
				network_id	: _config[key].network_id,
				gas			: _config[key].gas,
				gasPrice	: _config[key].gasPrice
			}
		}

		return truffleConfig
	}
}

/**
 	Export class as module
 */
module.exports = Web3Provider
