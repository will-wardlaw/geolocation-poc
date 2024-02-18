const videoElement = document.querySelector('#camera-container');
const noDirectionIndicator = document.querySelector('#noDirection');
const directionInfo = document.querySelector('#directionInfo');

const constraints = {
    audio: false,
    video: { facingMode: "environment" }
}

const displayObj = (obj, el) => {
    el.innerHTML = '';
    
    for(let prop in obj) {
        const strong = document.createElement('strong');
        strong.textContent = `${prop}: `;

        const span = document.createElement('span');
        span.textContent = obj[prop];

        const para = document.createElement('p');
        para.append(strong, span);
        el.append(para);
    }
};


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

window.addEventListener("deviceorientationabsolute", (event) => {
    console.log(event);

    noDirectionIndicator.setAttribute('class', 'hidden');
    directionInfo.setAttribute('class', 'visible');

    const orientationInfo = (({ alpha, beta, gamma, absolute }) => ({ alpha, beta, gamma, absolute }))(event);

    displayObj(orientationInfo, directionInfo);
});