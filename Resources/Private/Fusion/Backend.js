import initMap from "./Presentation/Map.js";

const EVENT_TYPE = "Jonnitto.Map:Presentation.Map";

const DOCUMENT = document;

const switchCallback = (element, map) => {
    DOCUMENT.addEventListener("carbonCBD", (event) => {
        const detail = event.detail;
        if (
            detail.type !== EVENT_TYPE ||
            detail.mode === "live" ||
            detail.element.querySelector(".map--live") !== element
        ) {
            return;
        }
        map.remove();
    });
};

[...DOCUMENT.querySelectorAll(".map--live")].forEach((element) => initMap(element, true, switchCallback));

DOCUMENT.addEventListener("carbonCBD", (event) => {
    const detail = event.detail;

    if (!detail.type === EVENT_TYPE || detail.mode === "live") {
        return;
    }

    [...detail.element.querySelectorAll(".map--edit")].forEach((element) => initMap(element, false));
});

[...DOCUMENT.querySelectorAll(".carbon-cbd__edit")].forEach((targetNode) => {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            const element = mutation.addedNodes[0];
            if (element && element.classList.contains("map--edit")) {
                initMap(element, false);
                break;
            }
        }
    });
    observer.observe(targetNode, { childList: true });
});
