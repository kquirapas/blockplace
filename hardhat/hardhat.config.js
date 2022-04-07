require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env.local" });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const	DEV_URL = process.env.DEV_ALCHEMY_URL_APIKEY;
const	DEV_PRIVATEKEY = process.env.DEV_PRIVATEKEY;


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
	defaultNetwork: "hardhat",
	networks: {
		mumbai: {
			url: DEV_URL,
			accounts: [
				`0x${DEV_PRIVATEKEY}`
			]
		},
	},
	etherscan: {
		apiKey: process.env.POLYGONSCAN_APIKEY
	},
	paths: {
		artifacts: '../app/src/artifacts',
		// sources: './src/contracts',
		// cache: './src/cache',
		// tests: './src/tests'
	}
};
;
