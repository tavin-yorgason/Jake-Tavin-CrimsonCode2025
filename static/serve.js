const allowButton = document.getElementById('allow-sensors'); // Changed to modal button
const gyroX = document.getElementById('gyro-x');
const gyroY = document.getElementById('gyro-y');
const gyroZ = document.getElementById('gyro-z');
const alphaDiv = document.getElementById('alpha');
const betaDiv = document.getElementById('beta');
const gammaDiv = document.getElementById('gamma');
const audioDiv = document.getElementById('audio');
const brightnessDiv = document.getElementById('brightness');

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
  alphaDiv.textContent = 'Alpha: ' + event.alpha.toFixed(2);
  betaDiv.textContent = 'Beta: ' + event.beta.toFixed(2);
  gammaDiv.textContent = 'Gamma: ' + event.gamma.toFixed(2);
}
});

// Listen for gyroscope data
window.addEventListener('devicemotion', (event) => {
if (event.rotationRate.alpha !== null) {
  gyroX.textContent = 'Gyroscope X: ' + event.rotationRate.alpha.toFixed(2);
  gyroY.textContent = 'Gyroscope Y: ' + event.rotationRate.beta.toFixed(2);
  gyroZ.textContent = 'Gyroscope Z: ' + event.rotationRate.gamma.toFixed(2);
}
});

console.log('Sensor tracking started.');

// Call audio function
getLocalStream();
}

// Get audio input from user
function getLocalStream() {
navigator.mediaDevices
.getUserMedia({ video: {facingMode: "user"}, audio: true })
.then((stream) => {
  /* ----- Audio Setup ----- */
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

/* ----- Video setup ----- */
// Get video track
const vidTracks = stream.getVideoTracks();
var videoTrack;
if( vidTracks.length === 0 )
{
  console.log("No valid video source");
}
else
{
  videoTrack = vidTracks[0];
}

  /* ----- Get audio level and video brightness ----- */
setInterval(function() {
    // Calculate volume
analyserNode.getByteFrequencyData(buffer);

    let sum = 0;
    for (let i = 0; i < bufferLen; i++) {
      sum += buffer[i];
    }
    let average = sum / bufferLen;
    audioDiv.textContent = 'Volume: ' + average.toFixed(2);
  

}, 10 );
})  
.catch((err) => {
  console.error(`you got an error: ${err}`);
}); 
}

async function GetColorFromCamera() {

}

