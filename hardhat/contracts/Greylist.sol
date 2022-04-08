//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Greylist {
	// address of minter -> timestamp of greylist end
	mapping(address => uint256) public greylistedAddresses;

	function addToGreylist() public {
		// greylist address for 2 seconds
		greylistedAddresses[msg.sender] = block.timestamp + 20 seconds;
	}

	function isGreylisted() public view returns (bool) {
		if (greylistedAddresses[msg.sender] > block.timestamp) {
			return true;
		}
		return false;
	}

	function getGreylistDuration() public view returns (uint256) {
		if (greylistedAddresses[msg.sender] < block.timestamp) {
			return 0;
		}

		return greylistedAddresses[msg.sender] - block.timestamp;
	}
}
