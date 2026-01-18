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

const rodriguesRotation = (v, kVector, theta) => {
    const k = makeUnit(kVector);

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const v1 = scaleVector(cosTheta, v);
    const v2 = scaleVector(sinTheta, crossProduct(k, v));
    const v3 = scaleVector(dotProduct(k, v) * (1 - cosTheta), k);

    return sumVector(sumVector(v1, v2), v3); 
}

const sumVector = (v1, v2) => {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

const scaleVector = (s, v) => {
    return { x: s * v.x, y: s * v.y, z: s * v.z };
}

const crossProduct = (v1, v2) => {
    const x = v1.y * v2.z - v1.z * v2.y;
    const y = v1.z * v2.x - v1.x * v2.z;
    const z = v1.x * v2.y - v1.y * v2.x;

    return { x, y, z };
}

const dotProduct = (v1, v2) => {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

const makeUnit = (v) => {
    const t = v.x * v.x + v.y * v.y + v.z * v.z;
    const d = Math.sqrt(t);

    return { x: v.x / d, y: v.y / d, z: v.z / d };
}

const toRadians = (degrees) => {
    return (degrees / 180) * Math.PI;
}

const toDegrees = (radians) => {
    return (radians / Math.PI) * 180;
}

attachCameraToVideoElement(constraints, videoElement);

window.addEventListener("deviceorientationabsolute", (event) => {
    renderOrientation(event);
});

function calculateCameraHeading(camX, camY, camZ) {
    const cameraCompassRawRad = Math.atan2(camY, camX);
    const camRad = cameraCompassRawRad >= 0 ? cameraCompassRawRad : cameraCompassRawRad + 2 * Math.PI;
    const rawCamera = toDegrees(camRad);

    const cameraHeading = 360 - (rawCamera - 90);
    return cameraHeading >= 360 ? cameraHeading - 360 : cameraHeading;
}

function calculateCameraElevation(camX, camY, camZ) {
    const cameraXYMagnitude = Math.sqrt(camX * camX + camY * camY);
    const camElevationRad = Math.atan2(camZ, cameraXYMagnitude);
    return toDegrees(camElevationRad);
}

function calculateCameraVectors(obj) {
    const phoneVectors = calculatePhoneVectorsRelativeToEarth(obj);

    const { x, y, z } = phoneVectors;

    const zX = z.x;
    const zY = z.y;
    const zZ = z.z;

    // We're assuming our camera is the negative of the z vector.
    // This isn't always a correct assumption.
    const camX = -zX;
    const camY = -zY;
    const camZ = -zZ;
    return { camX, camY, camZ };
}

function calculatePhoneVectorsRelativeToEarth(obj) {
    const { alpha, beta, gamma, absolute } = obj;

    const alphaRad = toRadians(alpha);
    const betaRad = toRadians(beta);
    const gammaRad = toRadians(gamma);

    // Earth coordinate frame
    // See https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained
    const east = { x: 1, y: 0, z: 0 };
    const north = { x: 0, y: 1, z: 0 };
    const vertical = { x: 0, y: 0, z: 1 };

    // These are the vectors after rotating the phone along the alpha value
    const xAlpha = rodriguesRotation(east, vertical, alphaRad);
    const yAlpha = rodriguesRotation(north, vertical, alphaRad);
    const zAlpha = vertical;

    // These are the vectors after rotating the phone along the beta value
    const xBeta = xAlpha;
    const yBeta = rodriguesRotation(yAlpha, xAlpha, betaRad);
    const zBeta = rodriguesRotation(zAlpha, xAlpha, betaRad);

    // These are the vectors after rotating the phone along the gamma value
    // This should represent the phone coordinate frame in the earth coordinate frame.
    const xGamma = rodriguesRotation(xBeta, yBeta, gammaRad);
    const yGamma = yBeta;
    const zGamma = rodriguesRotation(zBeta, yBeta, gammaRad);
    return { x: xGamma, y: yGamma, z: zGamma };
}

function renderOrientation(event) {
    console.log(event);

    noDirectionIndicator.setAttribute('class', 'hidden');
    directionInfo.setAttribute('class', 'visible');

    const orientationInfo = (({ alpha, beta, gamma, absolute }) => ({ alpha, beta, gamma, absolute }))(event);

    const cameraVectors = calculateCameraVectors(orientationInfo);
    const { camX, camY, camZ } = cameraVectors;
    const cameraHeading = calculateCameraHeading(camX, camY, camZ);
    const cameraElevation = calculateCameraElevation(camX, camY, camZ);
    orientationInfo.cameraHeading = cameraHeading;
    orientationInfo.cameraElevation = cameraElevation;

    displayObj(orientationInfo, directionInfo);
}

renderOrientation( { alpha: 90, beta: 0, gamma: -90, absolute: true });
