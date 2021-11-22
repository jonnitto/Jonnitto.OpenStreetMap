import initMap from "./Presentation/Map.js";

const EVENT_TYPE = "Jonnitto.Map:Presentation.Map";

const DOCUMENT = document;

const checkNodeList = (nodeList, newElement) => {
    // No node is given, return false
    if (!nodeList.length) {
        return false;
    }
    const element = nodeList[0];

    // The element is an valid map with coordinates, so return the element
    if (element.classList.contains("map--edit")) {
        return element;
    }

    // The new element has no coordinates, return false
    if (newElement) {
        console.warn("The new address has no coordinates");
        return false;
    }

    // If the removed element was invalid, return true
    return element.classList.contains("map-coordinate--invalid");
};

const checkMutation = (mutation) =>
    checkNodeList(mutation.removedNodes, false) ? checkNodeList(mutation.addedNodes, true) : null;

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
            const element = checkMutation(mutation);
            if (element) {
                initMap(element, false);
                break;
            }
        }
    });
    observer.observe(targetNode, { childList: true });
});
