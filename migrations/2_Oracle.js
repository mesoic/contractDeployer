const fs  = require('fs');

/*
	Contract name
*/
contractName = "Oracle"

/*
	Deployment template
*/
let Contract = artifacts.require(contractName)

module.exports = async function (deployer) {

    try {

    	/*
			Deployer. Constructor arguments passed as extra arguments to "deploy"
    	*/	
		await deployer.deploy(Contract, "0x20fe562d797a42dcb3399062ae9546cd06f63280")

		contractData = {
			contractName : Contract._json.contractName,
			address 	 : Contract.address, 
			abi 		 : Contract._json.abi
		}

		/*	
			Write out deployment data
		*/
		fs.writeFileSync( "./blockchain/contracts/" + Contract.address + ".json", JSON.stringify(contractData) );


    } catch (e) {
        console.log(`Error in migration: ${e.message}`)
    }
}
