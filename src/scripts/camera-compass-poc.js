const videoElement = document.querySelector('#camera-container');

const constraints = {
    audio: false,
    video: { facingMode: "environment" }
}

async function attachCameraToVideoElement(constraints, videoElement) {
    
    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
            videoElement.play();
        }
    } catch (error) {
        console.log(error);
    };

}

attachCameraToVideoElement(constraints, videoElement);
