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

const calculateCameraHeading = (obj) =>
{
    const { alpha, beta, gamma, absolute } = obj;

    const alphaRad = toRadians(alpha);
    const betaRad = toRadians(beta);
    const gammaRad = toRadians(gamma);

    // const X = [ 1, 0, 0 ];
    // const Y = [ 0, 1, 0 ];
    // const Z = [ 0, 0, 1 ];

    // const xAlpha = [ Math.cos(alphaRad), Math.sin(alphaRad), 0 ];
    // const yAlpha = [ -Math.sin(alphaRad), Math.cos(alphaRad), 0];
    // const zAlpha = Z;

    // const xBeta = xAlpha;
    // const yBeta = [ yAlpha[0] * Math.cos(betaRad), yAlpha[1] * Math.cos(betaRad), Math.sin(betaRad)];
    // //const zBeta = [ yAlpha[0] * (Math.sin(betaRad), xAlpha[])]
    // // zBeta should be the vector cross product of xBeta and yBeta
    // const zBeta = [ yBeta[1] * xBeta[2] - yBeta[2] * xBeta[1],
    //                 xBeta[0] * zBeta[2] - xBeta[2] * zBeta[0],
    //                 yBeta[0] * zBeta[1] - yBeta[1] * zBeta[0] ];
    
    

    // const xGamma = [ ]
    // const yVec = [ -Math.sin(alphaRad) * Math.cos(betaRad), Math.cos(alphaRad) * Math.cos(betaRad), Math.sin(betaRad)];
    // const xVec = [ Math.cos(alphaRad) * Math.cos(gammaRad), Math.sin(alphaRad) * ]

    const x = { x: 1, y: 0, z: 0 };
    const y = { x: 0, y: 1, z: 0 };
    const z = { x: 0, y: 0, z: 1 };

    const xAlpha = rodriguesRotation(x, z, alphaRad);
    const yAlpha = rodriguesRotation(y, z, alphaRad);
    const zAlpha = z;

    const xBeta = xAlpha;
    const yBeta = rodriguesRotation(yAlpha, xAlpha, betaRad);
    const zBeta = rodriguesRotation(zAlpha, xAlpha, betaRad);

    const xGamma = rodriguesRotation(xBeta, yBeta, gammaRad);
    const yGamma = yBeta;
    const zGamma = rodriguesRotation(zBeta, yBeta, gammaRad); 

    const zX = zGamma.x;
    const zY = zGamma.y;

    if(zX === 0) return 0;
    
    const rawRad = Math.atan(zY / zX);
    const rawCamera = toDegrees(rawRad);

    const cameraHeading = 360 - (rawCamera + 90);
    return cameraHeading;
}



const rodriguesRotation = (v, kVector, theta) => {
    const k = makeUnit(kVector);

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const v1 = scaleVector(cosTheta, v);
    const v2 = scaleVector(sinTheta, crossProduct(k, v));
    const v3 = scaleVector(dotProduct(k, v) * (1 - cosTheta), k);

    return v1 + v2 + v3; 
}

const sumVector = (v1, v2) => {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

const scaleVector = (s, v) => {
    return { x: s * v.x, y: s * v.y, z: s * v.z };
}

const crossProduct = (v1, v2) => {
    const x = v1.y * v2.z - v1.z * v2.x;
    const y = v1.z * v2.x - v1.x * v2.z;
    const z = v1.x * v2.y - v1.y * v2.y;

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
    console.log(event);

    noDirectionIndicator.setAttribute('class', 'hidden');
    directionInfo.setAttribute('class', 'visible');

    const orientationInfo = (({ alpha, beta, gamma, absolute }) => ({ alpha, beta, gamma, absolute }))(event);
    
    const cameraHeading = calculateCameraHeading(orientationInfo);
    orientationInfo.cameraHeading = cameraHeading;

    displayObj(orientationInfo, directionInfo);
});