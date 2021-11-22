import { map, tileLayer, marker, control, divIcon, Util, featureGroup } from "leaflet/dist/leaflet-src.esm";

const DOCUMENT = document;
const SETTINGS = JSON.parse(DOCUMENT.currentScript.dataset?.settings || null);

const ICON = divIcon({
    className: "leaflet-data-marker",
    html: Util.template(
        '<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178"><path fill="{mapIconColor}" stroke="#FFF" stroke-width="6" stroke-miterlimit="10" d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/><circle fill="{mapIconColorInnerCircle}" cx="74" cy="75" r="61"/><circle fill="#FFF" cx="74" cy="75" r="{pinInnerCircleRadius}"/></svg>',
        {
            mapIconColor: SETTINGS.pinColor,
            mapIconColorInnerCircle: SETTINGS.pinColor,
            pinInnerCircleRadius: 30,
        }
    ),
    iconAnchor: [12, 32],
    iconSize: [25, 30],
    popupAnchor: [0, -28],
});

const initMap = (element, live, switchCallback) => {
    const settings = { ...SETTINGS.mapOptions, ...JSON.parse(element.dataset?.map || null) };

    if (!settings.center) {
        settings.center = [0, 0];
    }

    const canvas = element.querySelector(".map__canvas");
    const markerGroup = [];
    const addresses = [...canvas.querySelectorAll(".map-coordinate")]
        .map((element) => {
            const coordinate = element.dataset?.coordinate?.split(",");
            if (!coordinate) {
                return null;
            }
            return {
                html: element.outerHTML,
                coordinate: [parseFloat(coordinate[0]), parseFloat(coordinate[1])],
            };
        })
        .filter((element) => element !== null);
    canvas.innerHTML = "";

    const MAP = map(canvas, settings);
    control
        .scale({
            imperial: false,
        })
        .addTo(MAP);

    tileLayer(SETTINGS.tiles.url, SETTINGS.tiles.options).addTo(MAP);
    addresses.forEach((address) => {
        const MARKER = marker(address.coordinate, { icon: ICON, draggable: !live }).addTo(MAP);
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
            const EDITORS = ["lat", "lng"]
                .map(
                    (property) =>
                        element.querySelector(`.map-coordinate__${property} .neos-inline-editable`)?.firstElementChild
                )
                .filter((element) => element !== null);
            if (EDITORS.length === 2) {
                markerGroup[0].addEventListener("move", (event) => {
                    const latLng = event.latlng;
                    EDITORS[0].innerText = latLng.lat.toString();
                    EDITORS[1].innerText = latLng.lng.toString();
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

    if (live && switchCallback) {
        switchCallback(element, MAP);
    }

    DOCUMENT.dispatchEvent(
        new CustomEvent("initializedOpenStreetMap", {
            detail: {
                map: MAP,
                element,
                markers: markerGroup,
            },
        })
    );

    element.style.visibility = "visible";
};

export default initMap;
