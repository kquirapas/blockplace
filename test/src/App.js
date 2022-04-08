import { useEffect, useRef } from 'react';

import './App.css';

const DIMENSION = 1000;

function randInt(max) {
	return Math.floor(Math.random() * max);
}

const pixelData = [];
for (let row = 0; row < DIMENSION; row++) {
	for (let col = 0; col < DIMENSION; col++) {
		pixelData[row * DIMENSION + col] = {};
		pixelData[row * DIMENSION + col].r = randInt(255);
		pixelData[row * DIMENSION + col].g = randInt(255);
		pixelData[row * DIMENSION + col].b = randInt(255);
	}
}

console.log(pixelData);

function App() {
	const dataUrl = useRef(null);
	const sC = document.createElement('canvas');
	sC.width = DIMENSION;
	sC.height = DIMENSION;
	const sourceCtx = useRef(sC.getContext('2d'));
	const canvasRef = useRef(null);
	const mainCtx = useRef(null);

	useEffect(() => {
		document.body.style.backgroundColor = "grey";

		canvasRef.current.width = DIMENSION;
		canvasRef.current.height = DIMENSION;
		mainCtx.current = canvasRef.current.getContext('2d');

		console.log(sourceCtx, mainCtx)

		const imgData = sourceCtx.current.createImageData(DIMENSION, DIMENSION);
		for (let i = 0; i < imgData.data.length; i += 4) {
			let x = (i / 4) % DIMENSION;
			let y = Math.floor(i / (4 * DIMENSION));
			imgData.data[i] = pixelData[y * DIMENSION + x].r;
			imgData.data[i+1] = pixelData[y * DIMENSION + x].g;
			imgData.data[i+2] = pixelData[y * DIMENSION + x].b;
			imgData.data[i+3] = 255;
		}
		console.log('imgData', imgData);

		mainCtx.current.imageSmoothingEnabled = false;
		mainCtx.current.putImageData(imgData, 0, 0);
	}, []);

  return (
		<canvas ref={canvasRef}></canvas>
  );
}

export default App;
