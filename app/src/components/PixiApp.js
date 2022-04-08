import { useEffect, useCallback } from 'react';
import { settings, SCALE_MODES } from 'pixi.js';
import { Stage, Graphics } from '@inlet/react-pixi';

settings.RESOLUTION = 3;
SCALE_MODES.DEFAULT = SCALE_MODES.NEAREST;

const DIMENSION = 100; // pixels

const stageProps = {
	width: DIMENSION,
	height: DIMENSION,
	options: {
		resolution: 1
	}
};

export default function PixiApp() {
	const draw = useCallback(g => {
		g.clear();

		for (let row = 0; row < DIMENSION; row++) {
			for (let col = 0; col < DIMENSION; col++) {
				g.beginFill(0xffffff);
				g.drawRect(col, row, 1, 1);
			}
		}

		g.endFill();
	});

	return (
		<Stage {...stageProps}>
			<Graphics draw={draw}></Graphics>
		</Stage>
	);
}
