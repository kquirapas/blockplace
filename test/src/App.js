import { useEffect, useState, useRef } from 'react';

import './App.css';

const DIMENSION = 1000;

function randInt(max) {
	return Math.floor(Math.random() * max);
}


function createRandomPixel2DArray(w, h) {
	const pixelData = [];
	for (let row = 0; row < h; row++) {
		let currRow = [];
		for (let col = 0; col < w; col++) {
			currRow.push({});
			currRow[col].r = randInt(255);
			currRow[col].g = randInt(255);
			currRow[col].b = randInt(255);
			currRow[col].a = 255;
		}
		pixelData.push(currRow);
	}
	return pixelData;
}

function createImageData(ctx, pixel2DArray,  w, h) {

	const data = ctx.createImageData(w, h);
	for (let i = 0; i < data.data.length; i += 4) {
		let x = (i / 4) % w;
		let y = Math.floor(i / (4 * w));
		data.data[i] = pixel2DArray[y][x].r;
		data.data[i+1] = pixel2DArray[y][x].g;
		data.data[i+2] = pixel2DArray[y][x].b;
		data.data[i+3] = pixel2DArray[y][x].a;
	}

	return data;
}

const PIXELS = createRandomPixel2DArray(DIMENSION, DIMENSION);

function App() {
	const sC = document.createElement('canvas');
	sC.width = DIMENSION;
	sC.height = DIMENSION;
	const sourceCtx = useRef(sC.getContext('2d'));
	const canvasRef = useRef(null);
	const mainCtx = useRef(null);
	const [pixels, setPixels] = useState([]);

	const regenerate = () => {
		console.log('regenerating');
		setPixels(PIXELS);
	};

	useEffect(() => {
		console.log('pixels changing');
		mainCtx.current.putImageData(createImageData(sourceCtx.current, pixels, DIMENSION, DIMENSION), 0, 0);
	}, [pixels]);

	useEffect(() => {
		document.body.style.backgroundColor = "";

		canvasRef.current.width = DIMENSION;
		canvasRef.current.height = DIMENSION;
		mainCtx.current = canvasRef.current.getContext('2d');

		mainCtx.current.imageSmoothingEnabled = false;
		mainCtx.current.putImageData(createImageData(sourceCtx.current, pixels, DIMENSION, DIMENSION), 0, 0);

		// setInterval(()=>{regenerate()}, 5000);
	}, []);

  return (
		<canvas onMouseMove={regenerate} ref={canvasRef}></canvas>
  );
}

export default App;
