import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { providers, Contract, utils } from 'ethers';
import web3modal from 'web3modal';
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';
import { createImageData, createDotOnImageData, createFilledImageData, createRandomPixel2DArray } from '../modules/helpers';
import PlaceContract from '../artifacts/contracts/Place.sol/Place.json';
import { PLACE } from '../constants';

const DIMENSION = 1000;

// for sidebar
const SPLIT_THICKNESS = 1;

// random pixel data
// createImageData(createRandomPixel2DArray(DIMENSION, DIMENSION), DIMENSION, DIMENSION)

class Color {
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

const tokenIdToColRow = (id, width) => {
	const x = id % width;
	const y = Math.floor(id / width);
	return { x, y };
};


// Place 
export default function Place() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [pixels, setPixels] = useState(null);

	const [loading, setLoading] = useState(true);
	const [showInfo, setShowInfo] = useState(false);
	const [info, setInfo] = useState({});;
	const [infoLoading, setInfoLoading] = useState(true);

	const web3modalRef = useRef(null);
	const [walletConnected, setWalletConnected] = useState(false);

	// color input refs
	const redRef = useRef(null);
	const greenRef = useRef(null);
	const blueRef = useRef(null);


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

	// BLOCKCHAIN FUNCTIONS const connectWallet = async () => { try { console.log('Trying to connect');
	const connectWallet = async () => { try {
			console.log('Trying to connect');
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch(err) {
			console.log(err);
		}
	};


	const getMintStatus = async (tokenId) => {
		const provider = await getProviderOrSigner(false);
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
		// get all tokens and sync into board
		const provider = await getProviderOrSigner();
		const placeInstance = new Contract(PLACE, PlaceContract.abi, provider);

		const supply = await placeInstance.totalSupply();
		console.log('Supply:', supply.toNumber());
		const tokens = []
		for (let i = 0; i < supply; i++) {
			let token = await placeInstance.tokenByIndex(i)
			console.log(token);
			tokens.push(token)
		}
		return tokens
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

	const setPixelColor = async (tokenId, color) => {
		console.log('color', color);
		const signer = await getProviderOrSigner(true);
		const placeInstance = new Contract(PLACE, PlaceContract.abi, signer);

		try {
			await placeInstance.setColor(tokenId, [color.r, color.g, color.b])
			console.log(`Color change (${color.r}, ${color.g}, ${color.b}: ${tokenId}`);
		} catch (err) {
			console.error("In setPixelColor:", err);
		}
	}

	const imageDataFromTokens = async (tokens, width, height, neutralFill) => {
		const provider = await getProviderOrSigner(false);
		const placeInstance = new Contract(PLACE, PlaceContract.abi, provider);

		const tokenIds = tokens.map((t) => {
			return t.toNumber()
		});

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');
		const imgData = ctx.createImageData(width, height);
		console.log('length', imgData.data.length);
		for (let i = 0; i < imgData.data.length; i += 4) {
			// checks if curr index in tokenIds
			// to render the color of that token
			// when it is indeed in the tokenids
			if (tokenIds.includes(Math.floor(i / 4))) {
				const tokenColor = await placeInstance.color(i);
				imgData.data[i] = tokenColor.r;
				imgData.data[i+1] = tokenColor.g;
				imgData.data[i+2] = tokenColor.b;
				imgData.data[i+3] = 255; // opaque (max alpha)
			} else {
				imgData.data[i] = neutralFill.r;
				imgData.data[i+1] = neutralFill.g;
				imgData.data[i+2] = neutralFill.b;
				imgData.data[i+3] = neutralFill.a;
			}
		}

		return imgData;
	}

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

		// initial board sync with tokens
		// IIFE
		setInterval(() => {
			// syncing board
			console.log("[ SYNCING ]");
			(async () => {
				const white = new Color(255,255,255,255);
				const data = await imageDataFromTokens(await getAllTokens(), DIMENSION, DIMENSION, white);
				console.log('data', data);
				setPixels(data);

			// setPixels(createImageData(createRandomPixel2DArray(DIMENSION, DIMENSION), DIMENSION, DIMENSION));
			})();
		}, 5000) // every 1 second


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
					<button className="info-box-button" type="button" onClick={()=>{mint(info.tokenId)}}>Mint</button>
				}
				{ info.minted &&
					<div>
						<p>Red</p>
						<input className="info-box-input" ref={redRef} type="text" />
						<p>Green</p>
						<input className="info-box-input" ref={greenRef} type="text" />
						<p>Blue</p>
						<input className="info-box-input" ref={blueRef} type="text" />
						<br />
						<br />
						<button className="info-box-button" type="button" onClick={async () => {
							const r = parseInt(redRef.current.value, 10);
							const g = parseInt(greenRef.current.value, 10);
							const b = parseInt(blueRef.current.value, 10);
							console.log('refs', redRef, greenRef, blueRef);
							console.log('rgb.value', redRef.value, greenRef.value, blueRef.value);
							console.log('rgb', r, g, b);
							await setPixelColor(info.tokenId, new Color(r, g, b, 255));
						}}>Set Color</button>
					</div>
				}
			</div>
		);
	}

	useEffect(() => {
		if (pixels) {
			console.log('changed');
			console.log(pixels)
			contextRef.current.putImageData(pixels, 0, 0);
		}
	}, [pixels]);

	return (
		<>
			<button type='button' onClick={connectWallet}>Connect Wallet</button>
			<canvas onMouseMove={track} onClick={showMint} width={DIMENSION} height={DIMENSION} ref={canvasRef}></canvas>
			{ showInfo && returnInfoBox(infoLoading) }

			<style jsx global>{`
				canvas {
					image-rendering: pixelated;
					width: 50vw;
					height: auto;
				}

				#info-box {
					font-family: Press Start;
					color: ${WHITE.hex};
					padding: 10vh 2vw;
					position: fixed;
					top: 0px;
					left: 0px;
					height: 100%;

					animation-name: rainbow-border-right;
					animation-duration: 2s;
					animation-direction: normal;
					animation-fill-mode: forwards;
					animation-iteration-count: infinite;
				}

				.info-box-input, .info-box-button {
					box-sizing: border-box;
					text-align: center;
					padding: 5px;
					font-family: Press Start;
					font-size: 12px;
					color: ${WHITE.hex};
					background-color: ${BLACK.hex};
					border: 1px solid ${WHITE.hex};
				}

				.info-box-button:hover {
					border: 2px solid ${WHITE.hex};
				}

				@keyframes rainbow-border-right {
					0% {
						border-right: ${SPLIT_THICKNESS}px solid ${RED.hex};
					}
					20% {
						border-right: ${SPLIT_THICKNESS}px solid ${ORANGE.hex};
					}
					40% {
						border-right: ${SPLIT_THICKNESS}px solid ${YELLOW.hex};
					}
					60% {
						border-right: ${SPLIT_THICKNESS}px solid ${GREEN.hex};
					}
					80% {
						border-right: ${SPLIT_THICKNESS}px solid ${BLUE.hex};
					}
					100% {
						border-right: ${SPLIT_THICKNESS}px solid ${RED.hex};
					}
				}
			`}</style>
		</>
	);
}
