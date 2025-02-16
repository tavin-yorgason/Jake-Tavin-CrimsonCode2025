document.addEventListener("DOMContentLoaded", function () {
    $('#sensorModal').modal('show'); // Automatically show the modal on page load
});

document.getElementById("allow-sensors").addEventListener("click", function () {
    // Example sensor access logic
    if (window.DeviceMotionEvent) {
        console.log("Device Motion is supported!");
    } else {
        console.log("Device Motion is NOT supported!");
    }
    $('#sensorModal').modal('hide'); // Close modal
});