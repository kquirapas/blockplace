const { expect } = require("chai");
const { ethers } = require("hardhat");

const delay = ms => new Promise(res => setTimeout(res, ms))

describe('Place Contract', () => {
	let place;
	let owner, acc1, acc2;

	beforeEach(async () => {
		// getSigners() get the signer from hardhat's local node
		[owner, acc1, acc2] = await ethers.getSigners();
		const PlaceContract = await ethers.getContractFactory('Place', owner);
		place = await PlaceContract.deploy('test.com/api/', 1000000);

		// wait deployment to be mined
		await place.deployed();
	});


	describe('Deployment', () => {
		it('should have tokenIdsLeft of 1,000,000', async () => {
			expect((await place.tokenIdsLeft()).toString()).to.equal('1000000');
		});

		it('should have a price of 1eth', async () => {
			expect(ethers.utils.formatEther(await place.price())).to.equal('1.0');
		});
	});


	describe('Pausing', () => {
		it('should not be paused start', async ()  => {
			expect(await place.paused()).to.equal(false);
		});

		it('should be paused', async ()  => {
			expect(await place.paused()).to.equal(false);
			await place.setPaused(true);
			expect(await place.paused()).to.equal(true);
		});

		it('should not be allowed to mint when paused', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther('1')})).to.not.be.reverted;
			await place.setPaused(true);
			await expect(place.mintPixel(0)).to.be.revertedWith('Place contract currently paused');
		});
	});


	describe('Minting', () => {
		let place, place2;
		let owner, acc1, acc2;

		beforeEach(async () => {
			// getSigners() get the signer from hardhat's local node
			[owner, acc1, acc2] = await ethers.getSigners();

			const PlaceContract = await ethers.getContractFactory('Place', owner);
			place = await PlaceContract.deploy('test.com/api/', 1);
			// wait deployment to be mined
			await place.deployed();

			const PlaceContract2 = await ethers.getContractFactory('Place', owner);
			place2 = await PlaceContract2.deploy('test.com/api/', 2);
			// wait deployment to be mined
			await place2.deployed();
		});

		it('should mint and decrement tokendIdsLeft', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
			expect(await place.tokenIdsLeft()).to.equal(0);
		});

		it('should mint and store tokenId in color', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
			expect((await place.color(0))['r']).to.equal(255);
			expect((await place.color(0))['g']).to.equal(255);
			expect((await place.color(0))['r']).to.equal(255);
		});

		it('should NOT be able to mint insufficient deposit', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("0.5")})).to.be.revertedWith('Insufficient deposit');
		});


		it('should NOT be able to mint because no more tokens left', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;

			// changing the signer for same contract
			// Signer: Owner -> Acc2
			const contract = await ethers.getContractAt('Place', place.address, acc2);
			await expect(contract.mintPixel(0, {value: ethers.utils.parseEther("1")})).to.be.revertedWith('All tokens minted');
		});

		it('should NOT mint because tokenId owned', async () => {
			const tx = await expect(place2.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
			await tx.wait();

			// delay to dodge greylist
			await delay(3000);

			await expect(place2.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.be.revertedWith('Token already minted');
		});
	});


	describe('Greylisting', () => {
		it('should NOT mint because greylisted', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.be.revertedWith('Denied: You are greylisted');
		});
	
		it('should mint because greylist lifted', async () => {
			await expect(place.mintPixel(0, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
			await delay(3000);
			await expect(place.mintPixel(1, {value: ethers.utils.parseEther("1.0")})).to.not.be.reverted;
		});
	});

	describe('Changing Color', () => {
		let local_place;

		beforeEach(async () => {
			local_place = await ethers.getContractAt('Place', place.address, acc1);
			await place.mintPixel(0, {value: ethers.utils.parseEther("1.0")});
		});

		it('should NOT set because not token owner', async () => {
			await expect(local_place.setColor(0, {r: 255, g: 255, b: 255})).to.be.revertedWith('Denied: you are not the token owner');
		})

		it('should NOT set because tokenId does not exists', async () => {
			await expect(local_place.setColor(1, {r: 255, g: 255, b: 255})).to.be.reverted;
		})


		it('it should set because token owner', async () => {
			await expect(place.setColor(0, {r: 255, g: 255, b: 255})).to.not.be.reverted;
		})

		it('should NOT set because color is wrong (overflow)', async () => {
			await expect(local_place.setColor(0, {r: 265, g: 285, b: 200})).to.be.reverted;
		});

		it('should NOT set because color is wrong (negative)', async () => {
			await expect(local_place.setColor(0, {r: -100, g: 285, b: 200})).to.be.reverted;
		});

		it('should NOT set because color is wrong (not a num)', async () => {
			await expect(local_place.setColor(0, {r: '100', g: 285, b: 200})).to.be.reverted;
		});

		it('HOTDOG', async () => {
			try {
				await local_place.setColor(0, {r: '100', g: 285, b: 200});
			} catch (err) {
				console.log(err);
			}
		});

	});
});
