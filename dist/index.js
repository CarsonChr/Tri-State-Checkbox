import { SelectorState, SelectorType, defaultAttribute, defaultClassName } from "./types.js";
import { createTriState } from "./tri-state.js";
export function getQuerySelector(selectType, selectState = undefined) {
    const baseSelector = `input[type="checkbox"]`;
    if (selectState == undefined || selectState == SelectorState.Any) {
        switch (selectType) {
            case SelectorType.ClassName:
                return `${baseSelector}.${defaultClassName}`;
            case SelectorType.Attribute:
                return `${baseSelector}[${defaultAttribute}]`;
            case SelectorType.Both:
                return `${baseSelector}[${defaultAttribute}].${defaultClassName}`;
            case SelectorType.Either:
                return `${baseSelector}.${defaultClassName}, ${baseSelector}[${defaultAttribute}]`;
        }
    }
    var baseString = baseSelector;
    if (selectType == SelectorType.ClassName || selectType == SelectorType.Both) {
        baseString += `.${defaultClassName}`;
    }
    const states = [];
    if (selectState & SelectorState.Checked) {
        states.push(`[${defaultAttribute}="${'checked'}"]`);
    }
    if (selectState & SelectorState.Unchecked) {
        states.push(`[${defaultAttribute}="${'unchecked'}"]`);
    }
    if (selectState & SelectorState.Unset) {
        states.push(`[${defaultAttribute}="${'unset'}"]`);
    }
    return states.map(state => baseString + state).join(', ');
}
window.createTriState = createTriState;
window.createTriStateForAll = () => {
    var query = getQuerySelector(SelectorType.Attribute, SelectorState.Any);
    var elements = document.querySelectorAll(query);
    Array.from(elements).forEach(element => { createTriState(element); });
};
window.dispatchEvent(new Event('tri-state-loaded'));
