const startButton = document.getElementById('start-button');
const gyroX = document.getElementById('gyro-x');
const gyroY = document.getElementById('gyro-y');
const gyroZ = document.getElementById('gyro-z');
const alphaDiv = document.getElementById('alpha');
const betaDiv = document.getElementById('beta');
const gammaDiv = document.getElementById('gamma');

// Listen for permission button click
startButton.addEventListener('click', () => {
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
    // If permissions are not required (for non-iOS devices)
    startSensors();
  }
});

function startSensors() {
  // Listen for device motion to get gyro data
  window.addEventListener('deviceorientation', (event) => {
    const alpha = event.alpha; // Rotation around z-axis
    const beta = event.beta;   // Rotation around x-axis
    const gamma = event.gamma; // Rotation around y-axis

    // Update rotation data
    alphaDiv.textContent = 'Alpha: ' + alpha.toFixed(2);
    betaDiv.textContent = 'Beta: ' + beta.toFixed(2);
    gammaDiv.textContent = 'Gamma: ' + gamma.toFixed(2);
  });

  // Listen for device motion to get gyroscope data
  window.addEventListener('devicemotion', (event) => {
    const gyroXValue = event.rotationRate.alpha;  // Gyroscope rate on X-axis
    const gyroYValue = event.rotationRate.beta;   // Gyroscope rate on Y-axis
    const gyroZValue = event.rotationRate.gamma;  // Gyroscope rate on Z-axis

    // Update gyroscope data
    gyroX.textContent = 'Gyroscope X: ' + gyroXValue.toFixed(2);
    gyroY.textContent = 'Gyroscope Y: ' + gyroYValue.toFixed(2);
    gyroZ.textContent = 'Gyroscope Z: ' + gyroZValue.toFixed(2);
  });
}
