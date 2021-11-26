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
    if (!settings.center) {
        settings.center = [0, 0];
    }
    const canvas = getMapCanvas(element);
    const markerGroup = [];
    const addresses = getAddresses(canvas);

    canvas.innerHTML = "";

    const MAP = map(canvas, settings);
    control
        .scale({
            imperial: false,
        })
        .addTo(MAP);

    tileLayer(globalSettings.tiles.url, globalSettings.tiles.options).addTo(MAP);

    addresses.forEach((address) => {
        const MARKER = marker(address.coordinate, { icon, draggable: !live }).addTo(MAP);
        markerGroup.push(MARKER);
        if (address.html) {
            const popup = MARKER.bindPopup(address.html, {
                maxWidth: 500,
            });
            if (!live) {
                popup.openPopup();
            }
        }
    });

    const markerLength = markerGroup.length;

    if (!live && markerLength === 1) {
        // Wait for the Neos UI
        setTimeout(() => {
            const EDITORS = getLatLngEditors(element);
            if (EDITORS) {
                markerGroup[0].addEventListener("move", (event) => {
                    updateLatLngEditors(EDITORS, event.latlng);
                });
            }
        }, 10);
    }

    if (markerLength) {
        MAP.fitBounds(new featureGroup(markerGroup).getBounds());
    } else {
        console.warn("No addresses found");
        MAP.setView(settings.center, 2);
    }

    document.dispatchEvent(
        new CustomEvent("initializedJonnittoOpenStreetMap", {
            detail: {
                map: MAP,
                element,
                markers: markerGroup,
            },
        })
    );

    element.style.visibility = "visible";
};

export { initFunction, initFrontend, initBackend };
