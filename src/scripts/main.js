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

    const displayDiv = document.querySelector('#coords-display');

    const mapLink = document.querySelector('#map-link');

    const watch = navigator.geolocation.watchPosition( (position) => {
        loadingDiv.setAttribute('class', 'hidden');
        locationDiv.setAttribute('class', 'visible');
        unsupportedDiv.setAttribute('class', 'hidden');

        const coords = position.coords;
        const latitude = coords.latitude;
        const longitude = coords.longitude;
        const elevation = coords.altitude;
        const accuracy = coords.accuracy;

        latSpan.textContent = latitude;
        longSpan.textContent = longitude;
        elevSpan.textContent = elevation;

        displayDiv.innerHTML = '';
        for(let coordProp in coords)
        {
            const strong = document.createElement('strong');
            strong.textContent = `${coordProp}: `;

            const span = document.createElement('span');
            span.textContent = coords[coordProp];
            
            const para = document.createElement('p');
            para.append(strong, span);
            displayDiv.append(para);
        }

        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    }, (watchError) => {
        console.log(watchError);
        geoError('Geolocation problem.');
    });
}
else {
    geoError('Location data unsupported.');
}

