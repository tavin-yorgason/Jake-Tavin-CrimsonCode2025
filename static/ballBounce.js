const allowButton = document.getElementById('allow-sensors'); // Changed to modal button
const gyroXDiv = document.getElementById('gyro-x');
const gyroYDiv = document.getElementById('gyro-y');
const gyroZDiv = document.getElementById('gyro-z');
const alphaDiv = document.getElementById('alpha');
const betaDiv = document.getElementById('beta');
const gammaDiv = document.getElementById('gamma');
const audioDiv = document.getElementById('audio');

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

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

const MAX_SPEED = 5;

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

var hitSound = new Audio("../sounds/hitSound.wav");

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
        gyroXDiv.textContent = "GyroX: " + event.rotationRate.alpha.toFixed(2);
        gyroX = event.rotationRate.alpha.toFixed(2);
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
      .getUserMedia({ video: false, audio: true })
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
      
        // Get relative volume
        setInterval( function() {
          analyserNode.getByteFrequencyData(buffer);
  
          // Calculate volume
          let sum = 0;
          for (let i = 0; i < bufferLen; i++) {
            sum += buffer[i];
          }
          audioLevel = sum / bufferLen;
          console.log(audioLevel);
          audioDiv.textContent = 'Audio level: ' + audioLevel.toFixed(2);
        }, 10 );
  
        while( true )
        {   
          getAudioData();
        }   
        
        // Check for video tracks
      })  
      .catch((err) => {
        console.error(`you got an error: ${err}`);
      }); 
  }  

function draw() {

  // Calculate new acceleration
  acc_y = Normalize(beta, -45, 45, -.5, .5);
  acc_x = Normalize(gamma, -45, 45, -.5, .5);

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
  radius = base_radius + (3 * audioLevel);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw previous circles with fading effect
  for (let i = 0; i < circles.length; i++) {
    ctx.beginPath();
    ctx.arc(circles[i].x, circles[i].y, circles[i].size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${circles[i].color.r}, ${circles[i].color.g}, ${circles[i].color.b}, ${circles[i].alpha})`;
    ctx.fill();
    ctx.closePath();

    // Fade the circle gradually
    circles[i].alpha -= 0.01;

    // Remove circle if it's fully faded out
    if (circles[i].alpha <= 0) {
      circles.splice(i, 1);
      i--;
    }
  }

  // Draw the current circle with an outline
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = curColor;
  ctx.strokeStyle = "#FFFFFF";  // Outline color
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Convert current color to RGB components and default to blue  if parsing fails
  const colorMatch = curColor.match(/\d+/g) || [0, 149, 221];
  const colorObj = {
    r: parseInt(colorMatch[0]),
    g: parseInt(colorMatch[1]),
    b: parseInt(colorMatch[2])
  };

  // Store the current circle's position with full opacity (alpha = 1)
  circles.push({ x: x, y: y, alpha: 1, color: colorObj, size: radius });

  // Add the velocities
  x += dx;
  y += dy;

  // Bounce if on horizontal bound
  if (x > canvas.width - radius || x < radius) {
    // Vibrate if device will do it (no iOS)
    if('vibrate' in navigator)
    {
        vibrate(10);
    }

    hitSound.play();

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
    // Vibrate if device will do it
    if('vibrate' in navigator)
    {
        vibrate(10);
    }

    hitSound.play();

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
}

draw();

// Listen for window resize events to update canvas size
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  radius = Math.min(canvas.width, canvas.height) * 0.133;

  x = canvas.width / 2;
  y = canvas.height / 2;
});
