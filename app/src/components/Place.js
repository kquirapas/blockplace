import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';

const PixiApp = dynamic(() => import('../components/PixiApp'), {ssr: false})

// Place 
export default function Place() {
	const canvasRef = useRef(null);
	const [scrollZoom, setScrollZoom] = useState(1);
	const [loading, setLoading] = useState(true);

	const zoom = (event) => {
		const zoomGrain = 0.002;
		setScrollZoom(prevScrollZoom => prevScrollZoom + (-event.deltaY) * zoomGrain);
	}

	useEffect(() => {
		// on mount
		return () => {
			// on dismount
		};
	}, []);

	return (
		<main onWheel={zoom}>
			<canvas ref={canvasRef}></canvas>
			<style jsx>{`
				main {
					padding: 100px;
					background-color: ${GREY.hex};
					transform: scale(${scrollZoom});
				}
				
			`}</style>
		</main>
	);
}
