/*	
	Initialize web3 provider 
*/
const Web3Provider = require('../blockchain/Web3Provider.js')

/*
	Initialize provider
*/
provider = new Web3Provider("ropsten-infura", "keystore-0" )

/*
	Interact with contract
*/
const contractInteraction = async ( ) => {

	var nodeA = "0x0000000000000000000000000000000000000000"
	var nodeB = "0x0000000000000000000000000000000000000001"

	/*
		Get contract at address
	*/
	OracleContract = await provider.getContract("0x0e74e7Cc13d2ea7B3795f759EF0b517013a7A754")

	/*
		Set fulfillment permission for "oracle" (burn address). Infura makes life hard now 
		so we must sign our transactions manually.
	*/
	const tx = {
		from: provider.getAddress(),
		to	: OracleContract._address, 
		data: OracleContract.methods.setFulfillmentPermission(nodeA, "true").encodeABI(),
		gas : 200000
	};

	/*
		Sign the transaction 
	*/
	const signedTx = await provider.web3.eth.accounts.signTransaction( tx, provider.account.privateKey );

	/*
		Send the transaction 
	*/
	const sentTx = await provider.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

	console.log(sentTx)

	/*
		check that we have set permission for this "oracle"
	*/
	var result = await OracleContract.methods.getAuthorizationStatus(nodeA).call()

	console.log(`authorization status(${nodeA}) = ${result}`)

	/*
		check that we have NOT set permission for another "oracle"
	*/
	var result = await OracleContract.methods.getAuthorizationStatus(nodeB).call()

	console.log(`authorization status(${nodeB}) = ${result}`)

}
contractInteraction()
