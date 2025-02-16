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

// Scale ball to screen
let radius = Math.min(canvas.width, canvas.height) * 0.133;

// Store n previous circles
const circles = [];

// Default color
let curColor = "rgb(23, 138, 12)";

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw previous circles with fading effect
  for (let i = 0; i < circles.length; i++) {
    ctx.beginPath();
    ctx.arc(circles[i].x, circles[i].y, radius, 0, Math.PI * 2);
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
  circles.push({ x: x, y: y, alpha: 1, color: colorObj });

  // Add the velocities
  x += dx;
  y += dy;

  // Bounce if on horizontal bound
  if (x > canvas.width - radius || x < radius) {
    dx *= -1;
  }

  // Bounce if on vertical bound
  if (y > canvas.height - radius || y < radius) {
    dy *= -1;
  }

  // Call the next frame
  requestAnimationFrame(draw);
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

// Start the animation
draw();

// Listen for window resize events to update canvas size
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  radius = Math.min(canvas.width, canvas.height) * 0.133;

  x = canvas.width / 2;
  y = canvas.height / 2;
});
