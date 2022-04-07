const { expect } = require("chai");
const { ethers } = require("hardhat");

const delay = ms => new Promise(res => setTimeout(res, ms))

describe('Greylist Contract', () => {
	let greylist;
	let owner, acc1, acc2;


	beforeEach(async () => {
		// getSigners() get the signer from hardhat's local node
		[owner, acc1, acc2] = await ethers.getSigners();
		const GreylistContract = await ethers.getContractFactory('Greylist', owner);
		greylist = await GreylistContract.deploy();

		// wait deployment to be mined
		await greylist.deployed();
	});

	it('should not be greylisted at start', async ()  => {
		expect(await greylist.isGreylisted()).to.equal(false);
	})

	it('should be greylisted after adding to greylist', async ()  => {
		await greylist.addToGreylist();
		expect(await greylist.isGreylisted()).to.equal(true);
	})

	it('should get duration in seconds', async () => {
		const tx = await greylist.addToGreylist();
		await tx.wait();
		await delay(1000);
		expect(parseInt((await greylist.getGreylistDuration()).toString())).to.equal(1);
	});
});
