import { SelectorState, SelectorType, defaultAttribute, defaultClassName } from "./types.js";
import TriStateWrapper, { createTriState } from "./tri-state.js";

export function getQuerySelector(selectType: SelectorType, selectState: SelectorState | undefined = undefined): string {
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

    const states = [] as string[];
    if (selectState & SelectorState.Checked) { states.push(`[${defaultAttribute}="${'checked'}"]`); }
    if (selectState & SelectorState.Unchecked) { states.push(`[${defaultAttribute}="${'unchecked'}"]`); }
    if (selectState & SelectorState.Unset) { states.push(`[${defaultAttribute}="${'unset'}"]`); }

    return states.map(state => baseString + state).join(', ');
}

declare global {
    interface Window {
        // Creates a tri-state checkbox for the given element
        createTriState: typeof createTriState;
        // Creates a tri-state checkbox for all inputs with the tri-state attribute
        createTriStateForAll: () => void;
        // Constructor for the TriStateWrapper class
        TriStateWrapper: typeof TriStateWrapper;
    }
}

window.createTriState = createTriState;
window.createTriStateForAll = () => {
    var query = getQuerySelector(SelectorType.Attribute, SelectorState.Any);
    var elements = document.querySelectorAll(query) as NodeListOf<HTMLInputElement>;
    Array.from(elements).forEach(element => { createTriState(element) });
};

window.dispatchEvent(new Event('tri-state-loaded'));