// Check if the browser supports DeviceMotionEvent
if (window.DeviceMotionEvent) {
    window.addEventListener("devicemotion", function(event) {
        let accelX = event.accelerationIncludingGravity.x;
        document.getElementById("accel-x").textContent = "X: " + accelX.toFixed(2);
    });
} else {
    document.getElementById("accel-x").textContent = "Accelerometer not supported";
}