var video = document.createElement('video');
video.style.width= document.width + 'px';
video.style.height = document.height + 'px';
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.setAttribute('playsinline', '');

var color = [];

var facingMode = "user";

var constraints = {
    audio: false,
    video: {
        facingMode: facingMode
    }
}

navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    video.srcObject = stream;

    // iOS doesnt like not having this here
    document.body.appendChild(video);
});

async function test() {
    color = [];
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

    requestAnimationFrame(test);
}

test();

video.addEventListener('click', function() {
    if(facingMode == "user") {
        facingMode = "environment";
    } else {
        facingMode = "user";
    }

    constraints = {
        audio: false,
        video: {
            facingMode: facingMode
        }
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
        video.srcObject = stream;
    });
});