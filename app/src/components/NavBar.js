
import { BLACK, WHITE, RED, GREEN, ORANGE, YELLOW, BLUE, PINK, GREY } from '../modules/colors';

// Navigation
const SPLIT_THICKNESS = 1;

export default function NavBar() {
	return (
		<nav>
			<span className="nav-logo">Blockplace</span>
			<span className="nav-main-link">
				<a>Place</a>
				<a>Roadmap</a>
				<a>About</a>
			</span>

			<style jsx>{`
				nav {
					animation-name: rainbow-border-bottom;
					animation-duration: 2s;
					animation-direction: normal;
					animation-fill-mode: forwards;
					animation-iteration-count: infinite;
					padding: 1vw;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
					color: ${WHITE.hex};
					width: 100vw;
					// background-color: ${BLACK.hex};
					border-bottom: ${SPLIT_THICKNESS}px solid white;
				}

				span.nav-logo:hover {
					cursor: pointer;
					animation-name: rainbow-color;
					animation-duration: 2s;
					animation-direction: normal;
					animation-fill-mode: forwards;
					animation-iteration-count: infinite;
				}

				a {
					color: ${WHITE};
					margin: 0 2vw;
				}

				a:hover {
					cursor: pointer;
					animation-name: rainbow-color;
					animation-duration: 2s;
					animation-direction: normal;
					animation-fill-mode: forwards;
					animation-iteration-count: infinite;
				}

				@keyframes rainbow-color {
					0% {
						color: ${RED.hex};
					}
					10% {
						color: ${RED.hex};
					}
					20% {
						color: ${ORANGE.hex};
					}
					40% {
						color: ${YELLOW.hex};
					}
					60% {
						color: ${GREEN.hex};
					}
					80% {
						color: ${BLUE.hex};
					}
					100% {
						color: ${RED.hex};
					}
				}


				@keyframes rainbow-border-bottom {
					0% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${RED.hex};
					}
					20% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${ORANGE.hex};
					}
					40% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${YELLOW.hex};
					}
					60% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${GREEN.hex};
					}
					80% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${BLUE.hex};
					}
					100% {
						border-bottom: ${SPLIT_THICKNESS}px solid ${RED.hex};
					}
				}

			`}</style>
		</nav>
	);
}
