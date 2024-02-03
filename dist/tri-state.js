export const defaultClassName = 'tri-state';
export const defaultAttribute = 'tri-state';
export var TriState;
(function (TriState) {
    TriState["Checked"] = "checked";
    TriState["Unchecked"] = "unchecked";
    TriState["Unset"] = "unset";
})(TriState || (TriState = {}));
export var SelectorState;
(function (SelectorState) {
    SelectorState[SelectorState["Checked"] = 16] = "Checked";
    SelectorState[SelectorState["Unchecked"] = 32] = "Unchecked";
    SelectorState[SelectorState["Unset"] = 64] = "Unset";
    SelectorState[SelectorState["Any"] = 112] = "Any";
})(SelectorState || (SelectorState = {}));
export var SelectorType;
(function (SelectorType) {
    SelectorType[SelectorType["ClassName"] = 1] = "ClassName";
    SelectorType[SelectorType["Attribute"] = 2] = "Attribute";
    SelectorType[SelectorType["Both"] = 4] = "Both";
    SelectorType[SelectorType["Either"] = 8] = "Either";
})(SelectorType || (SelectorType = {}));
const defaultStates = createTriStateStates([
    TriState.Unchecked,
    TriState.Checked,
    TriState.Unset
]);
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
        states.push(`[${defaultAttribute}="${TriState.Checked}"]`);
    }
    if (selectState & SelectorState.Unchecked) {
        states.push(`[${defaultAttribute}="${TriState.Unchecked}"]`);
    }
    if (selectState & SelectorState.Unset) {
        states.push(`[${defaultAttribute}="${TriState.Unset}"]`);
    }
    return states.map(state => baseString + state).join(', ');
}
function createTriStateStates(states = undefined) {
    if (!states || states.length === 0) {
        return defaultStates;
    }
    return states.map((state, index) => {
        return {
            state,
            index: index,
        };
    });
}
function createTriStateClosure() {
    let className = defaultClassName;
    let attribute = defaultAttribute;
    let states = [];
    let element = null;
    let lastState = TriState.Unset;
    let frozen = false;
    function setup(options) {
        className = options.className || className;
        attribute = options.attribute || attribute;
        states = createTriStateStates(options.states);
        element = options.element;
        element.classList.add(className);
        let startingState = options.startingState || getBasicStateFromAttribute() || getPhysicalState();
        var state = states.find(s => s.state === startingState) || states[0];
        setState(state);
    }
    function changeHandler(_) {
        if (frozen) {
            setPhysicalState(lastState);
            return;
        }
        advanceState();
    }
    function contextMenuHandler(event) {
        event.preventDefault();
        devanceState();
    }
    //#region State Setting
    function setStateAttribute(state) {
        var text = `${state.state}-${state.index}`;
        element.setAttribute(attribute, text);
    }
    function setPhysicalState(state) {
        element.indeterminate = state === TriState.Unset;
        element.checked = (state === TriState.Checked);
        lastState = state;
    }
    function setState(newState) {
        setStateAttribute(newState);
        setPhysicalState(newState.state);
    }
    function advanceState(count = 1) {
        var state = getNextState(getState(true), Math.abs(count));
        setState(state);
    }
    function devanceState(count = 1) {
        var state = getNextState(getState(true), -1 * Math.abs(count));
        setState(state);
    }
    //#endregion
    //#region State Retrieval
    function getBasicStateFromAttribute() {
        var attributeValue = element.getAttribute(attribute);
        if (!attributeValue) {
            return null;
        }
        if (attributeValue.startsWith(TriState.Checked)) {
            return TriState.Checked;
        }
        if (attributeValue.startsWith(TriState.Unchecked)) {
            return TriState.Unchecked;
        }
        if (attributeValue.startsWith(TriState.Unset)) {
            return TriState.Unset;
        }
        return null;
    }
    function extractStateFromAttribute(attributeValue) {
        var index = Number.NaN;
        if (attributeValue == null) {
            return null;
        }
        if (attributeValue.includes("-")) {
            var parts = attributeValue.split("-");
            if (parts.length <= 0) {
                return null;
            }
            if (parts.length >= 2) {
                index = parseInt(parts[1] || "");
                if (Number.isNaN(index)) {
                    return null;
                }
            }
            attributeValue = parts[0] || null;
        }
        if (attributeValue == null) {
            return null;
        }
        var state = null;
        switch (attributeValue) {
            case TriState.Checked:
                state = TriState.Checked;
                break;
            case TriState.Unchecked:
                state = TriState.Unchecked;
                break;
            case TriState.Unset:
                state = TriState.Unset;
                break;
        }
        if (state == null) {
            return null;
        }
        if (Number.isNaN(index) || index < 0 || index >= states.length) {
            index = states.findIndex(s => s.state === state);
        }
        return states[index] || null;
    }
    function getState(shouldCheckElementStateIfNoAttr = false) {
        const stateAttr = element.getAttribute(attribute);
        if (!stateAttr) {
            if (!shouldCheckElementStateIfNoAttr) {
                return null;
            }
            let triState = getPhysicalState();
            return states.find(s => s.state === triState) || null;
        }
        return extractStateFromAttribute(stateAttr);
    }
    function getNextState(curentState, change = 1) {
        let index = -1;
        if (typeof curentState === "string") {
            let firstMatch = states.find(s => s.state === curentState);
            if (!firstMatch) {
                return states[0];
            }
            index = firstMatch.index;
        }
        else {
            index = curentState.index;
        }
        index += change;
        if (index >= states.length) {
            index = 0;
        }
        if (index < 0) {
            index = states.length - 1;
        }
        return states[index];
    }
    function getPhysicalState() {
        if (element.indeterminate) {
            return TriState.Unset;
        }
        if (element.checked) {
            return TriState.Checked;
        }
        return TriState.Unchecked;
    }
    //#endregion
    function outsideSetState(state) {
        let triState = states.find(s => s.state === state) || states[0];
        setState(triState);
    }
    function createOptionsFromParams(options) {
        if (typeof options === "string") {
            var element = document.querySelector(options);
            if (!element) {
                element = document.getElementById(options);
            }
            if (!element) {
                throw new Error(`Could not find element with selector or id: ${options}`);
            }
            return { element: element };
        }
        if (options instanceof HTMLInputElement) {
            return { element: options, };
        }
        return options;
    }
    function createTriStateCheckbox(options) {
        options = createOptionsFromParams(options);
        setup(options);
        var elements = [element];
        if (element.id) {
            document.querySelectorAll(`[for="${element.id}"]`).forEach(label => {
                if (label instanceof HTMLElement && !elements.includes(label)) {
                    label.draggable = false;
                    elements.push(label);
                    label.style.userSelect = 'none';
                }
            });
        }
        elements.forEach(el => {
            if (el instanceof HTMLInputElement || el instanceof HTMLLabelElement) {
                el.addEventListener('change', changeHandler);
            }
            else {
                el.addEventListener('click', changeHandler);
            }
            el.addEventListener('contextmenu', contextMenuHandler);
        });
        Object.defineProperty(element, 'setState', { value: outsideSetState });
        Object.defineProperty(element, 'getState', { value: () => lastState });
        Object.defineProperty(element, 'advanceState', { value: advanceState });
        Object.defineProperty(element, 'devanceState', { value: devanceState });
        Object.defineProperty(element, 'freeze', { value: (state) => {
                frozen = true;
                if (state) {
                    outsideSetState(state);
                }
            } });
        Object.defineProperty(element, 'unfreeze', { value: (state) => {
                frozen = false;
                if (state) {
                    outsideSetState(state);
                }
            } });
        return element;
    }
    return createTriStateCheckbox;
}
;
function createTriState(options) {
    return createTriStateClosure()(options);
}
export default createTriState;
