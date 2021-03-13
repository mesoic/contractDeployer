/*
	Initialize Web3Provider
*/
const Web3Provider = require('./blockchain/Web3Provider.js')

provider = new Web3Provider("ropsten-infura", "keystore-0" )

let _networks = provider.getTruffleNetworks()

module.exports = {

	networks  : _networks,

	compilers : {
		solc: {
 			version: "0.4.24",
 		},
 	}
}

