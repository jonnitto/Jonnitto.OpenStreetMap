import initMap from "./Presentation/Map.js";

[...document.querySelectorAll(".map")].forEach((element) => initMap(element, true));
