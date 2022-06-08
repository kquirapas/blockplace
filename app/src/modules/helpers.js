
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

export function createFilledImageData(color, w, h) {
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');

	const data = ctx.createImageData(w, h);
	for (let i = 0; i < data.data.length; i += 4) {
		data.data[i] = color.r;
		data.data[i+1] = color.g;
		data.data[i+2] = color.b;
		data.data[i+3] = color.a;
	}

	return data;
} 

export function createDotOnImageData(imgData, color, x, y, w, h) {
	if (x < 0 || x >= w || y < 0 || y >= h) {
		throw new Error('Coordinate out of bounds');
	}

	const data = new ImageData(imgData.data, w, h);

	// copy matrix
	// const data = [];
	// for (let i = 0; i < height; i++) {
	// 	data[i] = imgData[i].slice();
	// }
  //
	const i = (y * w + x) * 4;
	data.data[i] = color.r;
	data.data[i + 1] = color.g;
	data.data[i + 2] = color.b;
	data.data[i + 3] = color.a;

	return imgData;
} 
