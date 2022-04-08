import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { providers, Contract, utils } from 'ethers';
import web3modal from 'web3modal';
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';
import { createImageData, createDotOnImageData, createFilledImageData, createRandomPixel2DArray } from '../modules/helpers';
import PlaceContract from '../artifacts/contracts/Place.sol/Place.json';
import { PLACE } from '../constants';

const DIMENSION = 100;
const PIXELS = createRandomPixel2DArray(DIMENSION, DIMENSION);

class Color {
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

// Place 
export default function Place() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [pixels, setPixels] = useState(PIXELS);

	const [loading, setLoading] = useState(true);
	const [showInfo, setShowInfo] = useState(false);
	const [info, setInfo] = useState({});;
	const [infoLoading, setInfoLoading] = useState(true);

	const web3modalRef = useRef(null);
	const [walletConnected, setWalletConnected] = useState(false);


	// HELPER FUNCTIONS

	const locate = (event) => {
		// locate row and column of mouse position
		// console.log('track', event);
		const canvasRect = canvasRef.current.getBoundingClientRect();

		const canvasWidth = canvasRect.width;

		const mouseX = event.nativeEvent.offsetX;
		const mouseY = event.nativeEvent.offsetY;

		const pixelSize = canvasWidth / DIMENSION;

		const x = Math.floor(mouseX / pixelSize);
		const y = Math.floor(mouseY/ pixelSize);

		return {x, y};
	};

	// UI FUNCTIONS 
	
	const track = (event) => {
		const { x, y } = locate(event);
	};

	const showMint = async (event) => {
		const { x, y } = locate(event);
		console.log(x, y);
		const tokenId = x + y * DIMENSION;

		setInfoLoading(true);
		setInfo({
			col: x,
			row: y,
			tokenId,
			minted: await getMintStatus(tokenId)
		});
		setInfoLoading(false);

		setShowInfo(true);
	};

	// const regenerate = (event) => {
	// 	console.log('regenerating');
	// 	// setPixels(PIXELS);
	// 	contextRef.current.putImageData(createImageData(pixels, DIMENSION, DIMENSION), 0, 0);
	// };


	// BLOCKCHAIN FUNCTIONS
	
	const connectWallet = async () => { try {
			console.log('Trying to connect');
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch(err) {
			console.log(err);
		}
	};


	const getMintStatus = async (tokenId) => {
		const provider = await getProviderOrSigner(true);
		const placeInstance = new Contract(PLACE, PlaceContract.abi, provider);

		return await placeInstance.minted(tokenId);
	}

	const getProviderOrSigner = async (signer = false) => {
		const instance = await web3modalRef.current.connect();
		const provider = new providers.Web3Provider(instance);

		const { chainId } = await provider.getNetwork();
		if (chainId !== 80001) {
			alert("Change your network to mumbai");
			throw new Error("Change network to mumbai");
		}

		if (signer) {
			const signer = provider.getSigner();
			return signer;
		}

		return provider;
	}

	const getAllTokens = async () => {
		const provider = await getProviderOrSigner();
		const placeInstance = new Contract(PLACE, PlaceContract.abi, provider);

		const supply = await placeInstance.totalSupply();
		console.log('supply', supply.toNumber());
		for (let i = 0; i < supply; i++) {
			console.log(await placeInstance.tokenByIndex(i));
		}
	};

	const mint = async (tokenId) => {
		try {
			const signer = await getProviderOrSigner(true);
			const placeInstance = new Contract(PLACE, PlaceContract.abi, signer);

			const tx = await placeInstance.mintPixel(tokenId, {value: utils.parseEther('0.001')});
			await tx.wait();
			alert('Successfully minted');
		} catch(err) {
			console.log(err);
		}
	};

	// USE EFFECT

	useEffect(() => {
		// on mount
		
		// setup web3modal
		if (!walletConnected) {
			web3modalRef.current = new web3modal({
				network: 'localhost',
				cacheProvider: true,
				providerOptions: {}
			});
		}

		// connect wallet
		connectWallet();
		
		// get context from main canvas
		contextRef.current = canvasRef.current.getContext('2d');

		// setInterval(regenerate, 5000);

		return () => {
			// on dismount
		};
	}, []);


	// RENDER / JSX

	const returnInfoBox = (isLoading) => {
		if (isLoading) {
			return (
				<div id="info-box">
					<h1>Info</h1>
					<div>Retrieving</div>
				</div>
			)
		}

		return (
			<div id="info-box">
				<h1>Info</h1>
				<p>{`Token ID: ${info.tokenId}`}</p>
				<p>{`Row: ${info.row}`}</p>
				<p>{`Column: ${info.col}`}</p>
				<p>{`Minted?: ${info.minted ? 'Yes' : 'Not Yet'}`}</p>
				{!info.minted &&
					<button type="button" onClick={()=>{mint(info.tokenId)}}>Mint</button>
				}
			</div>
		);
	}

	useEffect(() => {
		console.log('changed');
		const data = createFilledImageData(new Color(0,0,0,255), DIMENSION, DIMENSION);
		const dottedData = createDotOnImageData(data, new Color(255, 0, 0, 255), 15, 15, DIMENSION, DIMENSION);
		contextRef.current.putImageData(dottedData, 0, 0);
	}, [pixels]);

	return (
		<>
			<button type='button' onClick={connectWallet}>Connect Wallet</button>
			<button type='button' onClick={getAllTokens}>Get All Tokens</button>
			<canvas onMouseMove={track} onClick={showMint} width={DIMENSION} height={DIMENSION} ref={canvasRef}></canvas>
			{ showInfo && returnInfoBox(infoLoading) }

			<style jsx global>{`
				canvas {
					image-rendering: pixelated;
					width: 50vw;
					height: auto;
				}

				#info-box {
					padding: 1vw;
					position: fixed;
					top: 0px;
					left: 0px;
					background-color: rgba(0,0,0,0.3);
				}
			`}</style>
		</>
	);
}
