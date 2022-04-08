import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { providers, Contract, utils } from 'ethers';
import web3modal from 'web3modal';
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';
import { createImageData, createRandomPixel2DArray } from '../modules/helpers';
import PlaceContract from '../artifacts/contracts/Place.sol/Place.json';
import { PLACE } from '../constants';

const DIMENSION = 100;
const PIXELS = createRandomPixel2DArray(DIMENSION, DIMENSION);

// Place 
export default function Place() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [pixels, setPixels] = useState(PIXELS);

	const [loading, setLoading] = useState(true);

	const web3modalRef = useRef(null);
	const [walletConnected, setWalletConnected] = useState(false);


	const track = (event) => {
		// console.log('track', event);
		const canvasRect = canvasRef.current.getBoundingClientRect();

		const canvasWidth = canvasRect.width;
		const canvasHeight = canvasRect.height;

		const mouseX = event.nativeEvent.offsetX;
		const mouseY = event.nativeEvent.offsetY;

		const pixelSize = canvasWidth / DIMENSION;

		const x = Math.floor(mouseX / pixelSize);
		const y = Math.floor(mouseY/ pixelSize);

		console.log(x, y);
	};

	const regenerate = (event) => {
		console.log('regenerating');
		// setPixels(PIXELS);
		contextRef.current.putImageData(createImageData(pixels, DIMENSION, DIMENSION), 0, 0);
	};

	const connectWallet = async () => {
		try {
			console.log('Trying to connect');
			await getProviderOrSigner();
			setWalletConnected(true);
		} catch(err) {
			console.log(err);
		}
	};

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

	const mint = async () => {
		try {
			const signer = await getProviderOrSigner(true);
			const placeInstance = new Contract(PLACE, PlaceContract.abi, signer);

			const tx = await placeInstance.mintPixel(5, {value: utils.parseEther('0.001')});
			await tx.wait();
			alert('Successfully minted');
		} catch(err) {
			console.log(err);
		}
	};

	const retrieveAllTokens = async () => {
		const provider = await getProviderOrSigner();
		const placeInstance = new Contract(PLACE, PlaceContract.abi, provider);

		const supply = await placeInstance.totalSupply();
		console.log('supply', supply.toNumber());
		for (let i = 0; i < supply; i++) {
			console.log(await placeInstance.tokenByIndex(i));
		}
	};

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

	useEffect(() => {
		console.log('changed');
		contextRef.current.putImageData(createImageData(pixels, DIMENSION, DIMENSION), 0, 0);
	}, [pixels]);

	return (
		<>
			<button type='button' onClick={connectWallet}>Connect Wallet</button>
			<button type='button' onClick={mint}>Mint</button>
			<button type='button' onClick={retrieveAllTokens}>Get All Tokens</button>
			<canvas onMouseMove={track} width={DIMENSION} height={DIMENSION} ref={canvasRef}></canvas>
			<style jsx>{`
				canvas {
					image-rendering: pixelated;
				}
			`}</style>
		</>
	);
}
