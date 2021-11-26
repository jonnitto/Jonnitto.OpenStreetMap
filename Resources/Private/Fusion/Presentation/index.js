import {
    globalSettings,
    iconSettings,
    getMapCanvas,
    getAddresses,
    getLatLngEditors,
    updateLatLngEditors,
    initFrontend,
    initBackend,
} from "Packages/Carbon/Carbon.GeoMap/Resources/Private/Fusion/GeoMap.js";
import { map, tileLayer, marker, control, divIcon, featureGroup } from "leaflet/dist/leaflet-src.esm";

const icon = divIcon({
    className: "leaflet-data-marker",
    html: iconSettings.markup,
    iconAnchor: iconSettings.anchor,
    iconSize: iconSettings.size,
    popupAnchor: iconSettings.popupAnchor,
});

const initFunction = ({ element, live }) => {
    const settings = { ...globalSettings.mapOptions, ...JSON.parse(element.dataset?.map || null) };
    settings.center = settings.center ? [settings.center.lat, settings.center.lng] : [0, 0];

    const canvas = getMapCanvas(element);
    const markerCollection = [];
    const addresses = getAddresses(canvas);
    const numberOfAddresses = addresses.length;
    const inEditMode = !live && numberOfAddresses === 1;

    canvas.innerHTML = "";

    const MAP = map(canvas, settings);
    control
        .scale({
            imperial: false,
        })
        .addTo(MAP);

    tileLayer(globalSettings.tiles.url, globalSettings.tiles.options).addTo(MAP);

    addresses.forEach((address) => {
        const MARKER = marker([address.lat, address.lng], { icon, draggable: !live }).addTo(MAP);
        markerCollection.push(MARKER);
        if (address.html) {
            const popup = MARKER.bindPopup(address.html, {
                maxWidth: 500,
            });
            if (!live) {
                popup.openPopup();
            }
        }
        if (inEditMode) {
            setTimeout(() => {
                const EDITORS = getLatLngEditors(element);
                if (EDITORS) {
                    MARKER.addEventListener("move", (event) => {
                        updateLatLngEditors(EDITORS, event.latlng);
                    });
                }
            }, 10);
        }
    });

    if (numberOfAddresses) {
        MAP.fitBounds(new featureGroup(markerCollection).getBounds());
    } else {
        console.warn("No addresses found");
        MAP.setView(settings.center, 2);
    }

    document.dispatchEvent(
        new CustomEvent("initializedJonnittoOpenStreetMap", {
            detail: {
                map: MAP,
                element,
                markers: markerCollection,
            },
        })
    );

    setTimeout(() => {
        element.style.visibility = "visible";
    }, 50);
};

export { initFunction, initFrontend, initBackend };
