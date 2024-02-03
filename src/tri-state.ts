export const defaultClassName = 'tri-state';
export const defaultAttribute = 'tri-state';

export enum TriState {
    Checked = 'checked',
    Unchecked = 'unchecked',
    Unset = 'unset',
}

export enum SelectorState {
    Checked = 16,
    Unchecked = 32,
    Unset = 64,
    Any = 64 + 32 + 16,
}

export enum SelectorType {
    ClassName = 1,
    Attribute = 2,
    Both = 4,
    Either = 8,
}

interface TriStateState {
    state: TriState;
    index: number;
} 

type TriStateStates = readonly TriStateState[];

const defaultStates: TriStateStates = createTriStateStates(
    [
        TriState.Unchecked, 
        TriState.Checked, 
        TriState.Unset
    ]
);

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
    if (selectState & SelectorState.Checked) { states.push(`[${defaultAttribute}="${TriState.Checked}"]`); }
    if (selectState & SelectorState.Unchecked) { states.push(`[${defaultAttribute}="${TriState.Unchecked}"]`); }
    if (selectState & SelectorState.Unset) { states.push(`[${defaultAttribute}="${TriState.Unset}"]`); }

    return states.map(state => baseString + state).join(', ');
}


function createTriStateStates(states: TriState[] | undefined = undefined): TriStateStates {
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

export type TriStateSetupOptions =
{
    className?: string;
    attribute?: string;
    states?: TriState[];
    startingState?: TriState;
    element: HTMLInputElement;
}

export interface TriStateCheckbox extends HTMLInputElement {
    setState: (state: TriState) => void;
    getState: () => TriState;
    advanceState: () => void;
    devanceState: () => void;
    freeze: (state: TriState | undefined) => void;
    unfreeze: () => void;
}

function createTriStateClosure() {
    let className = defaultClassName;
    let attribute = defaultAttribute;
    let states: TriStateStates = [] as TriStateStates;
    let element = null as unknown as HTMLInputElement;
    let lastState = TriState.Unset;
    let frozen = false;

    function setup(options: TriStateSetupOptions) {
        className = options.className || className;
        attribute = options.attribute || attribute;
        states = createTriStateStates(options.states);
        element = options.element;

        element.classList.add(className);
        let startingState = options.startingState || getBasicStateFromAttribute() || getPhysicalState();
        var state = states.find(s => s.state === startingState) || states[0] as TriStateState;
        setState(state);
    }

    function changeHandler(_: Event) {
        if (frozen) { setPhysicalState(lastState); return; }
        advanceState();
    }

    function contextMenuHandler(event: MouseEvent) { 
        event.preventDefault();
        devanceState();
    }

    //#region State Setting
    function setStateAttribute(state: TriStateState) {
        var text = `${state.state}-${state.index}`;
        element.setAttribute(attribute, text);
    }

    function setPhysicalState(state: TriState) {
        element.indeterminate = state === TriState.Unset;
        element.checked = (state === TriState.Checked);
        lastState = state;
    }

    function setState(newState: TriStateState) {
        setStateAttribute(newState);
        setPhysicalState(newState.state);
    }
    
    function advanceState(count: number = 1) {
        var state = getNextState(getState(true) as TriStateState, Math.abs(count));
        setState(state);
    }

    function devanceState(count: number = 1) {
        var state = getNextState(getState(true) as TriStateState, -1 * Math.abs(count));
        setState(state);
    }
    //#endregion

    //#region State Retrieval
    function getBasicStateFromAttribute(): TriState | null {
        var attributeValue = element.getAttribute(attribute);
        if (!attributeValue) { return null; }
        if (attributeValue.startsWith(TriState.Checked)) { return TriState.Checked; }
        if (attributeValue.startsWith(TriState.Unchecked)) { return TriState.Unchecked; }
        if (attributeValue.startsWith(TriState.Unset)) { return TriState.Unset; }
        return null;
    }

    function extractStateFromAttribute(attributeValue: string | null): TriStateState | null {
        var index = Number.NaN;
        if (attributeValue == null) { return null; }
        if (attributeValue.includes("-")) {
            var parts = attributeValue.split("-");
            if (parts.length <= 0) { return null; }
            if (parts.length >= 2) {
                index = parseInt(parts[1] || "");
                if (Number.isNaN(index)) { return null; }
            }
            attributeValue = parts[0] || null;
        }
        if (attributeValue == null) { return null; }
        var state = null as TriState | null;
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
        if (state == null) { return null; }
        if (Number.isNaN(index) || index < 0 || index >= states.length) {
            index = states.findIndex(s => s.state === state);
        }
        return states[index] || null;
    }
    
    function getState(shouldCheckElementStateIfNoAttr: boolean = false): TriStateState | null {
        const stateAttr = element.getAttribute(attribute);
        if (!stateAttr) {
            if (!shouldCheckElementStateIfNoAttr) { return null; }
            let triState = getPhysicalState();
            return states.find(s => s.state === triState) || null;
        }
        return extractStateFromAttribute(stateAttr);
    }

    function getNextState(curentState: TriState | TriStateState, change: number = 1): TriStateState {
        let index = -1;
        if (typeof curentState === "string") {
            let firstMatch = states.find(s => s.state === curentState);
            if (!firstMatch) { return states[0] as TriStateState; }
            index = firstMatch.index;
        }
        else {
            index = curentState.index;
        }
        index += change;
        if (index >= states.length) { index = 0; }
        if (index < 0) { index = states.length - 1; }
        return states[index] as TriStateState;
    }
    
    function getPhysicalState(): TriState {
        if (element.indeterminate) { return TriState.Unset; }
        if (element.checked) { return TriState.Checked; }
        return TriState.Unchecked;
    }
    //#endregion

    function outsideSetState(state: TriState) {
        let triState = states.find(s => s.state === state) || states[0] as TriStateState;
        setState(triState);
    }

    function createOptionsFromParams(options: TriStateSetupOptions | HTMLInputElement | string): TriStateSetupOptions {
        if (typeof options === "string") {
            var element = document.querySelector(options);
            if (!element) { element = document.getElementById(options); }
            if (!element) { throw new Error(`Could not find element with selector or id: ${options}`); }
            return { element: element as HTMLInputElement };
        }
        if (options instanceof HTMLInputElement) {
            return { element: options, };
        }
        return options;
    }

    function createTriStateCheckbox(selectorOrId: string): TriStateCheckbox;
    function createTriStateCheckbox(element: HTMLInputElement): TriStateCheckbox;
    function createTriStateCheckbox(options: TriStateSetupOptions): TriStateCheckbox;
    function createTriStateCheckbox(options: TriStateSetupOptions | HTMLInputElement | string): TriStateCheckbox;
    function createTriStateCheckbox(options: TriStateSetupOptions | HTMLInputElement | string): TriStateCheckbox {
        options = createOptionsFromParams(options);
        setup(options);
        var elements = [element] as HTMLElement[];

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
            } else {
                el.addEventListener('click', changeHandler);
            }
            el.addEventListener('contextmenu', contextMenuHandler);
        });

        Object.defineProperty(element, 'setState', { value: outsideSetState });
        Object.defineProperty(element, 'getState', { value: () => lastState });
        Object.defineProperty(element, 'advanceState', { value: advanceState });
        Object.defineProperty(element, 'devanceState', { value: devanceState });
        Object.defineProperty(element, 'freeze', { value: (state: TriState | undefined) => {
            frozen = true;
            if (state) { outsideSetState(state); }
        }});
        Object.defineProperty(element, 'unfreeze', { value: (state: TriState | undefined) => {
            frozen = false;
            if (state) { outsideSetState(state); }
        }});
        return element as TriStateCheckbox;
    }
    return createTriStateCheckbox;
};

function createTriState(selectorOrId: string): TriStateCheckbox;
function createTriState(element: HTMLInputElement): TriStateCheckbox;
function createTriState(options: TriStateSetupOptions): TriStateCheckbox;
function createTriState(options: TriStateSetupOptions | HTMLInputElement | string): TriStateCheckbox {
    return createTriStateClosure()(options);
}

export default createTriState;