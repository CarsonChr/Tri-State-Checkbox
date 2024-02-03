import createTriState, { SelectorState, SelectorType, getQuerySelector } from "./tri-state.js";
var query = getQuerySelector(SelectorType.Attribute, SelectorState.Any);
var elements = document.querySelectorAll(query);
Array.from(elements).forEach(element => { createTriState(element); });
window.createTriState = createTriState;
if (window.onTriStateModuleLoaded) {
    try {
        window.onTriStateModuleLoaded();
    }
    catch (_a) { }
}
