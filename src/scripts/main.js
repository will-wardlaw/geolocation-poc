const loadingDiv = document.querySelector('#loading');
const locationDiv = document.querySelector('#geolocation-info');
const unsupportedDiv = document.querySelector('#geolocation-unsupported');

const orientationDiv = document.querySelector('#orientation-info');

const geoError = (reason) => {
    const reasonSpan = document.querySelector('#unsupported-reason');
    loadingDiv.setAttribute('class', 'hidden');
    locationDiv.setAttribute('class', 'hidden');
    unsupportedDiv.setAttribute('class', 'visible');
    reasonSpan.textContent = reason;
};

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
}

if('geolocation' in navigator) {
    const displayDiv = document.querySelector('#coords-display');
    const mapLink = document.querySelector('#map-link');

    const watch = navigator.geolocation.watchPosition( (position) => {
        loadingDiv.setAttribute('class', 'hidden');
        locationDiv.setAttribute('class', 'visible');
        unsupportedDiv.setAttribute('class', 'hidden');

        const coords = position.coords;
        displayObj(coords, displayDiv);

        const latitude = coords.latitude;
        const longitude = coords.longitude;
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    }, (watchError) => {
        console.log(watchError);
        geoError('Geolocation problem.');
    });
}
else {
    geoError('Location data unsupported.');
}

window.addEventListener("deviceorientationabsolute", (event) => {
    console.log(event);

    const orientationData = document.querySelector('#orientation-display');
    const orientationInfo = (({ alpha, beta, gamma, absolute }) => ({ alpha, beta, gamma, absolute }))(event);

    displayObj(orientationInfo, orientationData);
});

