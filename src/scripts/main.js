const loadingDiv = document.querySelector('#loading');
const locationDiv = document.querySelector('#geolocation-info');
const unsupportedDiv = document.querySelector('#geolocation-unsupported');

const geoError = (reason) => {
    const reasonSpan = document.querySelector('#unsupported-reason');
    loadingDiv.setAttribute('class', 'hidden');
    locationDiv.setAttribute('class', 'hidden');
    unsupportedDiv.setAttribute('class', 'visible');
    reasonSpan.textContent = reason;
};

if('geolocation' in navigator) {
    const latSpan = document.querySelector('#lat-data');
    const longSpan = document.querySelector('#long-data');
    const elevSpan = document.querySelector('#elev-data');

    const mapLink = document.querySelector('#map-link');

    const watch = navigator.geolocation.watchPosition( (position) => {
        loadingDiv.setAttribute('class', 'hidden');
        locationDiv.setAttribute('class', 'visible');
        unsupportedDiv.setAttribute('class', 'hidden');

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const elevation = position.coords.altitude;
        const accuracy = position.coords.accuracy;

        latSpan.textContent = latitude;
        longSpan.textContent = longitude;
        elevSpan.textContent = elevation;

        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    }, (watchError) => {
        console.log(watchError);
        geoError('Geolocation problem.');
    });
}
else {
    geoError('Location data unsupported.');
}

