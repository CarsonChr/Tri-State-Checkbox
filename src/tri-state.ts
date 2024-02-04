import { defaultAttribute, defaultStates } from "./types.js";
import type { TriState, TriStateCycle, TriStateCycleIndex, TriStateOptions, TriStateCheckbox } from "./types";

// This will make the provided element a tri-state checkbox.
export function createTriState(selectorOrId: string): TriStateCheckbox;
export function createTriState(element: HTMLInputElement): TriStateCheckbox;
export function createTriState(options: TriStateOptions): TriStateCheckbox;
export function createTriState(options: TriStateOptions | HTMLInputElement | string): TriStateCheckbox
export function createTriState(options: TriStateOptions | HTMLInputElement | string): TriStateCheckbox {
    let optionObj = {} as TriStateOptions;
    if (typeof options === "string") {
        let element = document.querySelector(options) || document.getElementById(options);
        if (!element) { throw new Error(`Could not find element with selector or id: ${options}`); }
        optionObj.element = element as HTMLInputElement;
    } else if (options instanceof HTMLInputElement) {
        optionObj.element = options;
    } else if (typeof options === "object") {
        optionObj = options;
        if (!optionObj.element) { throw new Error('No element provided in options parameter'); }
    } else { throw new Error('Invalid options parameter'); }
    Object.defineProperty(optionObj.element, '_triStateWrapper', { value: new TriStateWrapper(optionObj), writable: false, enumerable: false, configurable: true });
    return optionObj.element as TriStateCheckbox;
}

export default class TriStateWrapper {
    // This will be the input element that the tri-state checkbox is wrapping.
    public readonly element: HTMLInputElement;
    // This will be the array of states that the tri-state checkbox will cycle through.
    public readonly States: TriStateCycle;
    // This will be the attribute that the tri-state checkbox uses to store its state.
    public readonly attribute;

    protected readonly _updateLabels: boolean;
    protected _frozen: boolean = false;
    protected _index: TriStateCycleIndex = 0;
    protected _disposed: boolean = false;

    constructor(options: TriStateOptions) {
        this.attribute = options.attribute || defaultAttribute;
        this.element = options.element;
        this.States = options.states || defaultStates;
        // set starting state: check for a provided starting state else, the attribute else, check the physical state.
        this.setStateFromIndex(this.States.indexOf(options.startingState || this.getAttributeState() || this.getPhysicalState()) as TriStateCycleIndex);
        this._updateLabels = options.setupLabels === undefined ? true : options.setupLabels;

        this.updateElementProperties();
        this.updateLabels(true);
        this.setEventHandlers(this.element, true);
    }

    private changeHandler(_: Event) {
        if (this._frozen) { this.setStateFromIndex(this._index); return; } // if frozen, do nothing.
        this.cycleState(1); // go to next state.
        this.dispatchEvent(); // dispatch the changed state event.
    }

    private contextMenuHandler(event: MouseEvent) { 
        event.preventDefault(); // prevent the context menu from showing.
        event.stopPropagation(); // prevent parent elements from handling the event.
        if (this._frozen) { this.setStateFromIndex(this._index); return; } // if frozen, do nothing.
        this.cycleState(-1); // go to previous state.
        this.dispatchEvent(); // dispatch the changed state event.
    }

    private setEventHandlers(element: HTMLElement, add: boolean) {
        // Choose the correct method to add or remove the event listener.
        // Without binding, the method will have window as the 'this' value.
        let method = (add ? element.addEventListener : element.removeEventListener).bind(element);
        // Add a click or change event listener to the element (unless it's a label).
        // Labels do not ned to be listened to for change events because they automatically fire the event for the input.
        if (!(element instanceof HTMLLabelElement)) {
            // If the element is an input, listen for the change event, else listen for the click event.
            method((element instanceof HTMLInputElement) ? 'change' : 'click', this.changeHandler.bind(this));
        }
        // Add a contextmenu event listener to the element.
        // This allows the user to right-click the element to cycle the state backwards.
        method('contextmenu', this.contextMenuHandler.bind(this));
    }

    // This method will update any elements with a for attribute that matches the id of the tri-state element.
    // These elements will have setEventHandlers called on them to add or remove the contextmenu event listener.
    // User-Select will be set to none on these elements to prevent text selection when right-clicking the tri-state element.
    private updateLabels(add: boolean) {
        if (!this._updateLabels || !this.element.id) { return; }
        ;(Array.from(document.querySelectorAll(`[for="${this.element.id}"]`)) as HTMLElement[]).forEach(label => {
            if (label === this.element) { return; }
            label.style.userSelect = add ? 'none' : '';
            this.setEventHandlers(label, add)
        });
    }

    // This method will add or remove the properties and methods from the element.
    // The htmlInputElement will become a TriStateCheckbox if add is true, else it will be reverted to a normal checkbox.
    private updateElementProperties(add: boolean = true) {
        if (add) {
            // These will all have configurable set to true so that they can be removed later.
            Object.defineProperties(this.element, {
                'state': {
                    get: this.getState.bind(this),
                    set: this.setState.bind(this),
                    enumerable: true,
                    configurable: true,
                },
                'advanceState': { value: () => this.cycleState(1), configurable: true }, // advanceState will cycle the state forward.
                'devanceState': { value: () => this.cycleState(-1), configurable: true }, // devanceState will cycle the state backward.
                'cycleState': { value: (delta: number) => this.cycleState(delta), configurable: true }, // cycleState will cycle the state by the delta.
                'freeze': { value: (state: TriState | undefined) => this.setFrozen(true, state), configurable: true },
                'unfreeze': { value: (state: TriState | undefined) => this.setFrozen(false, state, ), configurable: true },
                'frozen': {
                    get: () => this._frozen,
                    set: (value: boolean) => this._frozen = value,
                    enumerable: true,
                    configurable: true,
                },
                'disposeTriState': { value: this.dispose.bind(this), configurable: true },
            });
        } else {
            const element = this.element as any;
            delete element.state;
            delete element.advanceState;
            delete element.devanceState;
            delete element.cycleState;
            delete element.freeze;
            delete element.unfreeze;
            delete element.frozen;
            delete element.disposeTriState;
            delete element._triStateWrapper;
        }
    }

    // This method will dispose of the tri-state checkbox.
    // It will remove the event listeners, update the labels, and remove the properties and methods from the element.
    public dispose() {
        if (this._disposed) { return; }
        this.updateElementProperties(false);
        this.updateLabels(false);
        this.setEventHandlers(this.element, false);
        this._disposed = true;
    }

    // This method will dispatch a new Event with the current state of the tri-state checkbox.
    protected dispatchEvent(state: TriState | undefined = undefined) {
        state = state || this.getState();
        this.element.dispatchEvent(new Event(state));
    }

    // This method will freeze or unfreeze the tri-state checkbox.
    // When frozen, the checkbox will not change state when clicked or right-clicked.
    // When frozen, the checkbox can still be changed by setting the state property.
    protected setFrozen(frozen: boolean, state?: TriState) {
        this._frozen = frozen;
        if (state) { this.setState(state); }
    }

    // This method will set the state of the tri-state checkbox.
    protected setState(state: TriState) {
        var index = this.States.indexOf(state);
        if (index != -1) { this.setStateFromIndex(index as TriStateCycleIndex); }
    }

    // This method will set the state of the tri-state checkbox from the index of the state in the States array.
    protected setStateFromIndex(index: TriStateCycleIndex) {
        var value = this.States[index]!;
        this.element.indeterminate = value === 'unset';
        this.element.checked = value === 'checked';
        this._index = index
        this.element.setAttribute(this.attribute, value);
    }

    // This method will cycle the state of the tri-state checkbox.
    // The delta parameter will determine the direction and number of states to cycle.
    // A positive number will cycle forward, a negative number will cycle backward.
    // The states will wrap around, so cycling forward from the last state will go to the first state.
    protected cycleState(delta: number) {
        if (this._frozen) { return; }
        this._index = this.getCycledIndex(delta);
        this.setStateFromIndex(this._index);
    }

    protected getState(): TriState { return this.States[this._index]; }

    // This method will get the state of the tri-state checkbox from the attribute.
    protected getAttributeState(): TriState | null {
        let value = this.element.getAttribute(this.attribute) || '';
        return this.States.find(x => value == x) || this.States[0]; // default to the first state if the attribute is not set/valid.
    }

    // This method will get the state of the tri-state checkbox from the checked and indeterminate properties.
    protected getPhysicalState(): TriState {
        if (this.element.indeterminate) { return 'unset'; }
        return this.element.checked ? 'checked' : 'unchecked';
    }

    // This method will calculate the new index after cycling the state by the delta.
    protected getCycledIndex(delta: number): TriStateCycleIndex { 
        var newIndex = (this._index + delta) % 3;
        if (newIndex == -1) { newIndex = 2 }
        return newIndex as TriStateCycleIndex;
    }
}