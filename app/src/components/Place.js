import { useRef, useState, useEffect } from 'react';
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';

const DIMENSION = 100; // pixels
const PIXELSIZE = 1;

function drawPixel(ctx, x, y, color, alpha) {
	const { r, g, b } = color;
	ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
	ctx.fillRect(x, y, PIXELSIZE, PIXELSIZE);
	console.log('drawing');
}

function clearCanvas(ctx, w, h) {
	ctx.clearRect(0, 0, w, h);
}

function drawPixelMatrix(ctx, matrix) {
	// not the right matrix
	if (matrix.length != DIMENSION || matrix[0].length != DIMENSION) return;

	for (let row = 0; row < DIMENSION; row++) {
		for (let col = 0; col < DIMENSION; col++) {
			const { alpha } = matrix[row][col];
			drawPixel(ctx, col, row,  matrix[row][col], alpha);
		}
	}
}

// Place 
export default function Place() {
	const canvasRef = useRef(null);
	const [context, setContext] = useState(null);
	const [scrollZoom, setScrollZoom] = useState(1);
	const [loading, setLoading] = useState(true);
	const [pixelMatrix, setPixelMatrix] = useState([]);

	const zoom = (event) => {
		const zoomGrain = 0.002;
		setScrollZoom(prevScrollZoom => prevScrollZoom + (-event.deltaY) * zoomGrain);
	}

	const track = (event) => {
		const x = event.nativeEvent.offsetX;
		const y = event.nativeEvent.offsetY;
		clearCanvas(context, DIMENSION, DIMENSION);
		drawPixelMatrix(context, pixelMatrix);
		drawPixel(context, x, y, {r: 255, g: 255, b: 255}, 1);
	};

	useEffect(() => {
		// on mount
		
		// retrieve colors from blockchain
		const tmpMatrix = [];
		for (let row = 0; row < DIMENSION; row++) {
			let tmpRow = [];
			for (let col = 0; col < DIMENSION; col++) {
				tmpRow.push({r: 0, g: 0, b: 0, alpha: 1});
			}
			tmpMatrix.push(tmpRow);
		}
		setPixelMatrix(tmpMatrix);

		if (canvasRef.current) {
			setContext(canvasRef.current.getContext("2d"));
			setLoading(false);
		}

		return () => {
			// on dismount
		};
	}, []);

	useEffect(() => {
		if (context) {
			drawPixel(context, 500, 500, {r: 0, g: 0, b: 0}, 1);
		}
	}, [context]);

	return (
		<main onWheel={zoom}>
			<canvas onMouseMove={e => track(e)} ref={canvasRef} width={DIMENSION} height={DIMENSION}></canvas>

			<style jsx>{`
				main {
					padding: 100px;
					background-color: ${WHITE.hex};
					transform: scale(${scrollZoom});
				}

				canvas {
					image-rendering: pixelated;
					border: 1px solid black;
				}
			`}</style>
		</main>
	);
}
