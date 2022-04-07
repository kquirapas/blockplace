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
			<NavBar />
			<style jsx global>{`
				body {
					width: 100vw;
					background-color: ${BLACK.hex};
				}

				#placeholder {
					display: flex;
					justify-content: center;
				}
			`}</style>
		</div>
  )
}
