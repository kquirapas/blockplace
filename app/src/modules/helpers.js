
export function randInt(max) {
	return Math.floor(Math.random() * max);
}

export function createRandomPixel2DArray(w, h) {
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

export function createImageData(pixel2DArray,  w, h) {
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');

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
