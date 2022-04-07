//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './Greylist.sol';

contract Place is ERC721Enumerable, Ownable, Greylist {
	struct Color {
		uint8 r;
		uint8 g;
		uint8 b;
	}

	string baseTokenURI;

	uint256 public price = 1 ether;
	bool public paused;

	uint256 public tokenIdsLeft;

	// keep track of minting
	// tokenId => true/false
	mapping(uint256 => bool) public minted;

	// keep track of token by associating a tokenId with a color string
	// tokenId => Color(r,g,b)
	mapping(uint256 => Color) public color;


	modifier onlyWhenNotPaused {
		require(!paused, 'Place contract currently paused');
		_;
	}

	constructor(string memory _baseTokenURI, uint256 _maxTokenIds) ERC721("Blockplace Pixel", "BP") {
		baseTokenURI = _baseTokenURI;
		tokenIdsLeft = _maxTokenIds;
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return baseTokenURI;
	}

	function mintPixel(uint256 tokenId) public payable onlyWhenNotPaused {
		// msg.sender not greylisted
		require(!isGreylisted(), 'Denied: You are greylisted');
		// have enough tokens left
		require(tokenIdsLeft > 0, 'All tokens minted');
		// token should not be owned
		require(!minted[tokenId], 'Token already minted');
		// must have enough msg.value (payment)
		require(msg.value >= price, 'Insufficient deposit');

		tokenIdsLeft -= 1;
		minted[tokenId] = true;
		color[tokenId] = Color({r: 255, g: 255, b: 255});
		addToGreylist();
		_safeMint(msg.sender, tokenId);
	}

	// set color
	function setColor(uint256 tokenId, Color memory _colorHex) public {
		// tokenId must exists (minted)
		require(minted[tokenId], 'Denied: Token not yet minted');
		// must be Owner of token
		require(ownerOf(tokenId) == msg.sender, 'Denied: you are not the token owner');
		color[tokenId] = Color({r: _colorHex.r, g: _colorHex.g, b: _colorHex.b});
	}

	function setPaused(bool _paused) public onlyOwner {
		paused = _paused;
	}

	// withdraw
	function withdraw() public onlyOwner {
		address _owner = owner();
		uint256 amount = address(this).balance;
		(bool sent, ) = _owner.call{value: amount}("");
		require(sent, 'Failed to send balance');
	}

	// needed functions
	receive() external payable {}
	fallback() external payable {}
}
