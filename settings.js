'use strict'

var WIDTH, HEIGHT;
var SCALE = 1;
var HUE, SATURATION, BRIGHTNESS, CONTRAST;
var HUE_CYCLE = true;
var FULLSCREEN = false;
var FILLING = true;
var RANDOMIZE = true;

const body = document.querySelector("body");

const CHANGE_SOURCE_CAM_button = document.getElementById("changeSourceToCam");
const CHANGE_SOURCE_SCREEN_button = document.getElementById("changeSourceToScreen");
const CHANGE_SOURCE_VIDEO_button = document.getElementById("changeSourceToVideo");
const CHANGE_SOURCE_IMAGE_button = document.getElementById("changeSourceToImage");
const CHANGE_SOURCE_buttons = {
	"CAM": CHANGE_SOURCE_CAM_button,
	"SCREEN": CHANGE_SOURCE_SCREEN_button,
	"VIDEO": CHANGE_SOURCE_VIDEO_button,
	"IMAGE": CHANGE_SOURCE_IMAGE_button
};

const WIDTH_slider = document.querySelector("input[name=width]");
const HEIGHT_slider = document.querySelector("input[name=height]");
const RESIZE_button = document.getElementById("resize");

const FPS_slider = document.querySelector("input[name=fps]");
const SCALE_slider = document.querySelector("input[name=scale]");
const HUE_slider = document.querySelector("input[name=hue]");
const SATURATION_slider = document.querySelector("input[name=saturation]");
const BRIGHTNESS_slider = document.querySelector("input[name=brightness]");
const CONTRAST_slider = document.querySelector("input[name=contrast]");

const HUE_CYCLE_button = document.querySelector("button[name=hueCycle]");
const FULLSCREEN_button = document.querySelector("button[name=fullscreen]");
const FILLING_button = document.querySelector("button[name=filling]");
const RANDOMIZE_button = document.querySelector("button[name=randomize]");

const SAVEFRAME_button = document.getElementById("saveFrame");
const RECORDFRAMES_button = document.getElementById("recordFrames");

const COLORS_list = document.querySelector(".colors .list");
const ADDCOLOR_button = document.getElementById("addColor");

var VIDEO_picker_button;
var IMAGE_picker_button;

var FILE;


function loadSettings() {


	// STORAGE

	if (localStorage.getItem('WIDTH') !== null) WIDTH_slider.value = localStorage.getItem('WIDTH');
	if (localStorage.getItem('HEIGHT') !== null) HEIGHT_slider.value = localStorage.getItem('HEIGHT');

	if (localStorage.getItem('COLORS') !== null) colors = JSON.parse(localStorage.getItem('COLORS'));

	if (localStorage.getItem('FPS') !== null) FPS_slider.value = localStorage.getItem('FPS');
	if (localStorage.getItem('SCALE') !== null) SCALE_slider.value = localStorage.getItem('SCALE');
	if (localStorage.getItem('HUE') !== null) HUE_slider.value = localStorage.getItem('HUE');
	if (localStorage.getItem('SATURATION') !== null) SATURATION_slider.value = localStorage.getItem('SATURATION');
	if (localStorage.getItem('BRIGHTNESS') !== null) BRIGHTNESS_slider.value = localStorage.getItem('BRIGHTNESS');
	if (localStorage.getItem('CONTRAST') !== null) CONTRAST_slider.value = localStorage.getItem('CONTRAST');

	if (localStorage.getItem('HUE_CYCLE') !== null) {
		HUE_CYCLE = localStorage.getItem('HUE_CYCLE') === "true";
		HUE_CYCLE_button.setAttribute('active', HUE_CYCLE);
	}

	if (localStorage.getItem('FILLING') !== null) {
		FILLING = localStorage.getItem('FILLING') === "true";
		FILLING_button.setAttribute('active', FILLING);
		body.setAttribute('filling', FILLING);
	}

	if (localStorage.getItem('RANDOMIZE') !== null) {
		RANDOMIZE = localStorage.getItem('RANDOMIZE') === "true";
		RANDOMIZE_button.setAttribute('active', RANDOMIZE);
	}


	// LISTENERS

	CHANGE_SOURCE_CAM_button.addEventListener('click', () => {
		changeSource('CAM');
	});
	CHANGE_SOURCE_SCREEN_button.addEventListener('click', () => {
		changeSource('SCREEN');
	});
	CHANGE_SOURCE_VIDEO_button.addEventListener('click', () => {
		changeSource('VIDEO');
	});
	CHANGE_SOURCE_IMAGE_button.addEventListener('click', () => {
		changeSource('IMAGE');
	});

	ADDCOLOR_button.addEventListener('click', () => {
		colors.push( [ 200, 200, 200 ] );
		generateColors();
	});

	FPS_slider.addEventListener('input', () => {
		localStorage.setItem('FPS', FPS_slider.value);
		FPS = +FPS_slider.value;
	});
	SCALE_slider.addEventListener('input', () => {
		localStorage.setItem('SCALE', SCALE_slider.value);
		SCALE = +SCALE_slider.value;
	});
	HUE_slider.addEventListener('input', () => {
		localStorage.setItem('HUE', HUE_slider.value);
		HUE = +HUE_slider.value;
	});
	SATURATION_slider.addEventListener('input', () => {
		localStorage.setItem('SATURATION', SATURATION_slider.value);
		SATURATION = +SATURATION_slider.value;
	});
	BRIGHTNESS_slider.addEventListener('input', () => {
		localStorage.setItem('BRIGHTNESS', BRIGHTNESS_slider.value);
		BRIGHTNESS = +BRIGHTNESS_slider.value;
	});
	CONTRAST_slider.addEventListener('input', () => {
		localStorage.setItem('CONTRAST', CONTRAST_slider.value);
		CONTRAST = +CONTRAST_slider.value;
	});

	HUE_CYCLE_button.addEventListener('click', () => {
		HUE_CYCLE = !HUE_CYCLE;
		localStorage.setItem('HUE_CYCLE', HUE_CYCLE);
		HUE_CYCLE_button.setAttribute('active', HUE_CYCLE);
	});
	FULLSCREEN_button.addEventListener('click', () => {
		toggleFullscreen();
	});
	FILLING_button.addEventListener('click', () => {
		FILLING = !FILLING;
		localStorage.setItem('FILLING', FILLING);
		FILLING_button.setAttribute('active', FILLING);
		body.setAttribute('filling', FILLING);
	});
	RANDOMIZE_button.addEventListener('click', () => {
		RANDOMIZE = !RANDOMIZE;
		localStorage.setItem('RANDOMIZE', RANDOMIZE);
		RANDOMIZE_button.setAttribute('active', RANDOMIZE);
	});

	SAVEFRAME_button.addEventListener('click', () => {
		save( dateTime() + '.png');
	});


	// VALUES

	WIDTH = +WIDTH_slider.value;
	HEIGHT = +HEIGHT_slider.value;
	
	FPS = +FPS_slider.value;
	SCALE = +SCALE_slider.value;
	HUE = +HUE_slider.value;
	SATURATION = +SATURATION_slider.value;
	BRIGHTNESS = +BRIGHTNESS_slider.value;
	CONTRAST = +CONTRAST_slider.value;

	RESIZE_button.addEventListener('click', resize);

	generateColors();
	
	resize();

	VIDEO_picker_button = createFileInput(handleVideoFile);
	VIDEO_picker_button.parent('sources');
	VIDEO_picker_button.hide();

	IMAGE_picker_button = createFileInput(handleImageFile);
	IMAGE_picker_button.parent('sources');
	IMAGE_picker_button.hide();

	console.log('Settings loaded.');

}

function resize() {

	WIDTH = +WIDTH_slider.value;
	HEIGHT = +HEIGHT_slider.value;

	W = WIDTH;
	H = HEIGHT;

	localStorage.setItem('WIDTH', WIDTH_slider.value);
	localStorage.setItem('HEIGHT', HEIGHT_slider.value);

	GFX = createCanvas(W, H);
	pixelDensity(1);
	noStroke();
	noSmooth();

	CNV = createGraphics(W, H);
	CNV.background(0);
	CNV.imageMode(CENTER);
	CNV.translate(width/2, height/2);

	pixelsTemp = new Uint8Array(W * H * 4);

}

function toggleFullscreen() {
	let fs = fullscreen();
	fullscreen(!fs);
	FULLSCREEN = fs === undefined;
	FULLSCREEN_button.setAttribute('active', FULLSCREEN);
}

function randomMoment() {
	if (!FILE) return;
	if (SRC_TYPE!=='VIDEO') return;
	FILE.elt.currentTime = random(FILE.elt.duration);

}

function changeSource(type) {

	if (type==='CAM') {

		cameraInit();

	} else if (type==='SCREEN') {

		startCaptureScreen();

	} else if (type==='VIDEO') {

		VIDEO_picker_button.elt.click();

	} else if (type==='IMAGE') {

		IMAGE_picker_button.elt.click();

	}

}

function cameraInit() {
	SRC_CAM = createCapture(VIDEO, () => {
		changeSourceType('CAM');
		SRC_CAM.volume(0);
		SRC_CAM.hide();
	});
}

let captureStream = null;
async function startCaptureScreen() {
	try {
		captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
		if (SRC_SCREEN.elt.srcObject) {
			const tracks = SRC_SCREEN.elt.srcObject.getTracks();
			tracks.forEach(track => track.stop());
		}
		SRC_SCREEN.elt.srcObject = captureStream;
		SRC_SCREEN.elt.play();
		changeSourceType('SCREEN');
	} catch (err) {
			console.error("Error: " + err);
	}
}

function handleImageFile(file) {
	if (file.type === 'image') {
		removeFile();
		FILE = loadImage(file.data, () => {
			IMAGE_picker_button.elt.value = null;
			changeSourceType('IMAGE');
		});
	} else {
		FILE = undefined;
	}
}

function handleVideoFile(file) {
	if (file.type === 'video') {
		removeFile();
		FILE = createVideo(file.data, () => {
			FILE.hide();
			FILE.volume(0);
			FILE.loop();
			VIDEO_picker_button.elt.value = null;
			changeSourceType('VIDEO');
		});
	} else {
		FILE = undefined;
	}
}

function removeFile() {
		if (FILE && SRC_TYPE=='VIDEO') FILE.remove();
		FILE = undefined;
}

function changeSourceType(type) {
	if (type!=='CAM' && SRC_CAM) SRC_CAM.remove();
	if ((type==='CAM' || type==='SCREEN') && FILE) removeFile();
	// if (type!=='SCREEN' && SRC_SCREEN) SRC_SCREEN.elt.srcObject = '';

	SRC_TYPE = type;
	for(let b in CHANGE_SOURCE_buttons) {
		CHANGE_SOURCE_buttons[b].setAttribute('active', SRC_TYPE == b);
	}
	console.log('New source: ' + SRC_TYPE);
}

function generateColors() {
	COLORS_list.innerHTML = '';
	for(let c of colors) {
		let html = `<span class="color">
							<input type="color" value="${rgbToHex(c[0], c[1], c[2])}">
							<button class="remove"></button>
						</span>`;
		COLORS_list.innerHTML += html;
	}
	let htmlColors = COLORS_list.querySelectorAll('.color input');
	for(let c of htmlColors) {
		c.addEventListener('input', () => {
			let rgb = hexToRgb(c.value);
			let index = Array.from(COLORS_list.children).indexOf(c.parentNode);
			colors[index] = rgb;
			localStorage.setItem('COLORS', JSON.stringify(colors));
		});
	}
	let htmlColorRemovers = COLORS_list.querySelectorAll('.color button');
	for(let c of htmlColorRemovers) {
		c.addEventListener('click', () => {
			let index = Array.from(COLORS_list.children).indexOf(c.parentNode);
			COLORS_list.children[index].remove();
			colors.splice(index, 1);
		});
	}
}