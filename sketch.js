var W, H;
var FPS = 30;
var FRAME = 0;

var GFX;
var CNV;

var SRC_TYPE = 'CAM';
var SRC_CAM;
var SRC_SCREEN;

var HUE_CYCLE_SPEED = 3;

var captureCanvas;

function setup() {

	loadSettings();

	cameraInit();

	SRC_SCREEN = createVideo();
	SRC_SCREEN.hide();

	noLoop();

	customDraw();

}

function customDraw() {

	if (HUE_CYCLE) {
		HUE += HUE_CYCLE_SPEED;
		HUE %= 360;
		HUE_slider.value = HUE;
	}

	if (RANDOMIZE) {
		if (FRAME % 10 == 0) {
		// if ( chance(0.2) ) {
			let w = 25 + random(240);
			if (FILLING) w *= windowWidth/windowHeight;
			let h = 25 + randomn(240);
			WIDTH_slider.value = Math.floor(w);
			HEIGHT_slider.value = Math.floor(h);
			resize();

			// HUE = randomn(360);
			// HUE_slider.value = HUE;
		}
	}


	if (SRC_TYPE === 'CAM') {
		
		CNV.push();
		CNV.scale(-1, 1);
		let [w, h] = getWH(SRC_CAM);
		CNV.image(SRC_CAM, 0, 0, w * SCALE, h * SCALE);
		CNV.pop();

	} else if (SRC_TYPE === 'SCREEN') {
		
		let [w, h] = getWH(SRC_SCREEN);
		CNV.image(SRC_SCREEN, 0, 0, w * SCALE, h * SCALE);		

	} else if (SRC_TYPE === 'VIDEO' || SRC_TYPE === 'IMAGE') {
		
		let [w, h] = getWH(FILE);
		if (FILE) CNV.image(FILE, 0, 0, w * SCALE, h * SCALE);		

	}

	image(CNV, 0, 0);

	loadPixels();

	hsl(HUE, SATURATION, BRIGHTNESS);
	contrast(CONTRAST);
	dithering();

	updatePixels();

	FRAME++;

	if (isRendering) {
		captureCanvas.image(GFX, 0, 0, captureCanvas.width, captureCanvas.height);
	}

	render();

}

function getWH(src) {
	
	let w = W, h = H;

	let resultRatio = W / H;
	let sourceRatio = src.width / src.height;

	if ( FILLING ) {

		let screenRatio = windowWidth / windowHeight;
		if (screenRatio < sourceRatio) {
			w = W / screenRatio * sourceRatio;
		} else {
			h = H * screenRatio / sourceRatio;
		}

	} else {

		if ( sourceRatio > resultRatio ) {
			w = H * sourceRatio;
		} else {
			h = W / sourceRatio;
		}

	}

	return [ w, h ];

}
