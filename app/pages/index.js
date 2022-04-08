import Head from 'next/head'
import Image from 'next/image'

import styles from '../styles/Home.module.css'

import { useState, useEffect } from 'react';
import NavBar from '../src/components/NavBar';
import Footer from '../src/components/Footer';
import Place from '../src/components/Place';

import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../src/modules/colors';

// Home
export default function Home() {
	const [scrollAnchor, setScrollAnchor] = useState({x: 50, y: 50});
	const [scrollZoom, setScrollZoom] = useState(1);

	const zoom = (event) => {
		const zoomGrain = 0.002;
		setScrollZoom(prevScrollZoom => {
			return prevScrollZoom + (-event.deltaY) * zoomGrain;
		});
	}

	useEffect(() => {
		// on mount
		return () => {
		};
	}, []);

  return (
		<div>
			<main id="placeholder">
				<Place />
			</main>
			<style jsx global>{`
				main {
					display: flex;
					flex-direction: row;
					align-items: center;
					max-width: 100vw;
					background-color: ${GREY.hex};
					transform-origin: ${scrollAnchor.x}% ${setScrollAnchor.y}%;
					transform: scale(${scrollZoom});
				}
					
				body {
					width: 100vw;
					background-color: ${BLACK.hex};
				}

				#placeholder {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-content: center;
				}
			`}</style>
		</div>
  )
}
