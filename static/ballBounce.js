// Fields
const allowButton = document.getElementById('allow-sensors'); // Changed to modal button
const gyroXDiv = document.getElementById('gyro-x');
const gyroYDiv = document.getElementById('gyro-y');
const gyroZDiv = document.getElementById('gyro-z');
const alphaDiv = document.getElementById('alpha');
const betaDiv = document.getElementById('beta');
const gammaDiv = document.getElementById('gamma');
const audioDiv = document.getElementById('audio');

// Ball rendering canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Sliiders
var noiseSlider = document.getElementById("noiseScaleSlider");
var speedSlider = document.getElementById("speedSlider");
var accelSlider = document.getElementById("accelSlider");
var sizeSlider = document.getElementById("sizeSlider");
var fadeSlider = document.getElementById("fadeSlider");

// Video
var video = document.createElement('video');
video.style.width= document.width + 'px';
video.style.height = document.height + 'px';
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

var color = [];

var facingMode = "user";

var constraints = {
    audio: true,
    video: {
        facingMode: facingMode
    }
}

// Update window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get starting pos
let x = canvas.width / 2;
let y = canvas.height / 2;

// Will be updated according to gyro and accel info
let dx = 2;
let dy = -2;

let beta = 0;
let gamma = 0;

let MAX_SPEED = 5;

// Scale ball to screen
let base_radius = Math.min(canvas.width, canvas.height) * 0.04;

// Store n previous circles
const circles = [];

// Default color
let curColor = "rgb(23, 138, 12)";

let audioLevel = 0;

let gyroX = 0;
let gyroY = 0;
let gyroZ = 0;

//var hitSound = new Audio("../sounds/hitSound.wav");

// Listen for permission button click inside modal
allowButton.addEventListener('click', () => {
	if (typeof DeviceOrientationEvent.requestPermission === 'function') {
		DeviceOrientationEvent.requestPermission().then(permissionState => {
			if (permissionState === 'granted') {
				startSensors();
			} else {
				alert('Permission denied');
			}
		}).catch(error => {
			alert('Error requesting permission: ' + error);
		});
	} else {
		// For non-iOS devices that don't require explicit permission
		startSensors();
	}

	$('#sensorModal').modal('hide'); // Close the modal
});
  
function startSensors() {
	// Listen for device orientation data
	window.addEventListener('deviceorientation', (event) => {
		if (event.alpha !== null) {
			beta = event.beta.toFixed(2);
			gamma = event.gamma.toFixed(2);
		}
	});

	// Listen for gyroscope data
	window.addEventListener('devicemotion', (event) => {
		if (event.rotationRate.alpha !== null) {
			//gyroXDiv.textContent = "GyroX: " + event.rotationRate.alpha.toFixed(2);
			gyroX = event.rotationRate.alpha.toFixed(2);
			//gyroY.textContent = 'Gyroscope Y: ' + event.rotationRate.beta.toFixed(2);
			//gyroZ.textContent = 'Gyroscope Z: ' + event.rotationRate.gamma.toFixed(2);
		}
	});

	console.log('Sensor tracking started.');

	// Call audio function
	getLocalStream();
}
  
// Get audio input from user
function getLocalStream() {
	navigator.mediaDevices
	.getUserMedia(constraints)
	.then((stream) => {
		// Get audio context
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();

		// Create MediaStreamAudioSourceNode
		const audioNode = audioContext.createMediaStreamSource(stream);

		// Create analyser node
		const analyserNode = audioContext.createAnalyser();
		const bufferLen = analyserNode.frequencyBinCount;
		analyserNode.fftSize = 256;
		const buffer = new Uint8Array(bufferLen);

		// Connect audio node to analyser
		audioNode.connect(analyserNode);

		// Set up video
		video.srcObject = stream;
		document.body.appendChild(video);

		// Get relative volume
		setInterval( function() {
			analyserNode.getByteFrequencyData(buffer);

			// Calculate volume
			let sum = 0;

			for (let i = 0; i < bufferLen; i++) {
				sum += buffer[i];
			}
			audioLevel = sum / bufferLen;
			//audioDiv.textContent = 'Audio level: ' + audioLevel.toFixed(2);

			GetColorFromCamera();
		}, 10 );

		// Check for video tracks
	})  
	.catch((err) => {
		console.error(`you got an error: ${err}`);
	}); 
}  

async function GetColorFromCamera() {
    let frame = new VideoFrame(video);
    let height = frame.codedHeight;
    let width = frame.codedWidth;

    let buffer = new Uint8Array(frame.allocationSize({format: "RGBA"}));
    await frame.copyTo(buffer, {format: "RGBA"});

    // Middle pizel is 2 * width * heiight;
    let index = 0
    let r = buffer[index];
    let g = buffer[index + 1];
    let b = buffer[index + 2];

    color = [r, g, b];

    frame.close();
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

let noiseScaling = 3.0;
let accel = .5;
let numBalls = 1 / 1000;

function draw() {
	colorHex = rgbToHex(color[0], color[1], color[2]);

	// Calculate new acceleration
	acc_y = Normalize(beta, -45, 45, -1 * accel, accel);
	acc_x = Normalize(gamma, -45, 45, -1 * accel, accel);

	// Add accel to velocity
	dy += acc_y;
	dx += acc_x;

	// Clamp
	if(Math.abs(dy) > MAX_SPEED)
	{
		dy = Math.sign(dy) * MAX_SPEED;
	}

	if(Math.abs(dx) > MAX_SPEED)
	{
		dx = Math.sign(dx) * MAX_SPEED;
	}

	// Determine size based on sound
	radius = base_radius + (noiseScaling * audioLevel);

	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw previous circles with fading effect
	for (let i = 0; i < circles.length; i++) {
		ctx.beginPath();
		ctx.arc(circles[i].x, circles[i].y, circles[i].size, 0, Math.PI * 2);
		ctx.fillStyle = `rgba(${circles[i].color[0]}, ${circles[i].color[1]}, ${circles[i].color[2]}, ${circles[i].alpha})`;
		ctx.fill();
		ctx.closePath();

		// Fade the circle gradually
		circles[i].alpha -= numBalls;

		// Remove circle if it's fully faded out
		if (circles[i].alpha <= 0) {
			circles.splice(i, 1);
			i--;
		}
	}

	// Draw the current circle with an outline
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle = colorHex;
	ctx.strokeStyle = "#FFFFFF";  // Outline color
	ctx.lineWidth = 2;
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	newCol = Array.from(color);

	// Store the current circle's position with full opacity (alpha = 1)
	circles.push({ x: x, y: y, alpha: 1, color: newCol, size: radius });

	// Add the velocities
	x += dx;
	y += dy;

	// Bounce if on horizontal bound
	if (x > canvas.width - radius || x < radius) {
		dx *= -1;
		if(x < radius)
		{
			x = radius;
		}
		else
		{
			x = canvas.width - radius;
		}
	}

	// Bounce if on vertical bound
	if (y > canvas.height - radius || y < radius) {
		dy *= -1;
		if(y < radius)
		{
			y = radius;
		}
		else
		{
			y = canvas.height - radius;
		}
	}

	// Call the next frame
	requestAnimationFrame(draw);
}

// Normalize a value with expected range to a set of ranges
function Normalize(value, minVal, maxVal, minOut, maxOut)
{
    if(value < minVal)
    {
        return minOut;
    }

    if(value > maxVal)
    {
        return maxOut;
    }

    return ((value - minVal) * (maxOut - minOut)) / (maxVal - minVal) + minOut;
}

function resetBall()
{
    x = canvas.width / 2;
    y = canvas.height / 2;

    dx = 2;
    dy = -2;

    circles.length = 0;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset noise slider
    noiseScaling = 3.0;
    noiseSlider.value = 3.0;

    // Reset speed slider
    MAX_SPEED = 5;
    speedSlider.value = 5;

    // Reset accel slider
    accel = 0.5;
    accelSlider.value = .5;

    // Scale ball to screen
    base_radius = Math.min(canvas.width, canvas.height) * 0.04;
    sizeSlider.value = base_radius;
    sizeSlider.min = base_radius - 20;
    sizeSlider.max = base_radius + 20;

	// reset fade
	numBalls = 1 / 1000;
	fadeSlider.value = 1000;
}

noiseSlider.oninput = function() {
    noiseScaling = this.value;
}

speedSlider.oninput = function() {
    MAX_SPEED = this.value;
}

accelSlider.oninput = function() {
    accel = this.value;
}

sizeSlider.oninput = function() {
    // Just update the base radius to match the slider value
    base_radius = this.value;

    // Optional: Ensure that base_radius stays within valid bounds
    base_radius = Math.max(base_radius, Math.min(base_radius, Math.min(canvas.width, canvas.height) * 0.2));
}

fadeSlider.oninput = function() {
	numBalls = 1 / this.value;
}

resetBall();
draw();

// Listen for window resize events to update canvas size
window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	radius = Math.min(canvas.width, canvas.height) * 0.133;

	x = canvas.width / 2;
	y = canvas.height / 2;
});

// Listen for clicks, and move the ball position to the mouse position
canvas.addEventListener('click', function(event) {
	x = event.clientX;
	y = event.clientY;
});

// Get WASD controls
window.addEventListener('keydown', function(event) {
	if(event.key == "w")
	{
		beta = -45;
	}
	else if(event.key == "a")
	{
		gamma = -45;
	}
	else if(event.key == "s")
	{
		beta = 45;
	}
	else if(event.key == "d")
	{
		gamma = 45;
	}
});

