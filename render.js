var isRendering = false;

const RENDER_button = document.getElementById("recordFrames");
RENDER_button.addEventListener('click', toggleRender);

const FPS_info = document.getElementById("fps");

var fpsCount = 0;
var lastMillis = 0;

var stream;
var track;
var mediaRecorder;
var chunks;

function toggleRender() {
	if (isRendering) renderStop();
	else renderStart();
}

function autoDownload(url, filename) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function renderStart() {

	if (captureCanvas) captureCanvas.remove();
	let w = FILLING ? windowWidth/windowHeight : W/H;
	captureCanvas = createGraphics(2160 * w, 2160);
	captureCanvas.pixelDensity(1);
	captureCanvas.noSmooth();

	chunks = [];
	stream = captureCanvas.elt.captureStream(60);
	track = stream.getVideoTracks()[0];

	mediaRecorder = new MediaRecorder(stream, {
	    mimeType: 'video/webm; codecs=vp9',
    	videoBitsPerSecond : 10000000
	});

	mediaRecorder.ondataavailable = function(e) {
	    chunks.push(e.data);
	};

	mediaRecorder.onstop = function(e) {
        const blob = new Blob(chunks, { 'type' : 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        autoDownload(videoURL, dateTime() + '.webm');
    };
    
	mediaRecorder.start();
	isRendering = true;
	RENDER_button.setAttribute('active', true);
}

function renderStop() {
	if (!isRendering) return;
	mediaRecorder.stop();
	isRendering = false;
	RENDER_button.setAttribute('active', false);
}

function render() {
	updateFps();
	setTimeout(customDraw, Math.ceil(1000/FPS));
}

function updateFps() {
	if(FRAME % 5 == 0) {
		var diff = millis() - lastMillis;
		let fps = Math.round( 1000 / (diff/5) );
		if(fps<=60) FPS_info.innerHTML = fps;
		lastMillis = millis();
	}
}