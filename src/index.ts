import createTriState, { SelectorState, SelectorType, getQuerySelector } from "./tri-state.js";

declare global {
    interface Window {
        createTriState: typeof createTriState;
        onTriStateModuleLoaded: (() => void) | undefined;
    }
}

var query = getQuerySelector(SelectorType.Attribute, SelectorState.Any);
    var elements = document.querySelectorAll(query) as NodeListOf<HTMLInputElement>;
    Array.from(elements).forEach(element => { createTriState(element) });

window.createTriState = createTriState;
if (window.onTriStateModuleLoaded) {
    try { window.onTriStateModuleLoaded(); }
    catch { }
}