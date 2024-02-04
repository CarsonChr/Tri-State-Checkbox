export const defaultClassName = 'tri-state';
export const defaultAttribute = 'tri-state';
export const defaultStates: TriStateCycle = ['unchecked', 'checked', 'unset'];
export const moduleLoadEvent = 'tri-state-loaded';

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

export type TriState = 'checked' | 'unchecked' | 'unset';

export type TriStateCycle = 
['checked', 'unchecked', 'unset'] |
['checked', 'unset', 'unchecked'] |
['unchecked', 'checked', 'unset'] |
['unchecked', 'unset', 'checked'] |
['unset', 'checked', 'unchecked'] |
['unset', 'unchecked', 'checked'];

export type TriStateCycleIndex = 0 | 1 | 2;

export type TriStateOptions = {
    attribute?: string;
    states?: TriStateCycle;
    startingState?: TriState;
    setupLabels?: boolean;
    element: HTMLInputElement;
}

export type HoverableTriStateOptions = TriStateOptions & {
    autoDisableOnUnset?: boolean;
    disableDelay?: number;
    hoverTarget?: HTMLElement;
}

export interface TriStateCheckbox extends HTMLInputElement {
    state: TriState;

    cycleState: (count: number) => void;
    advanceState: () => void;
    devanceState: () => void;

    freeze: (state?: TriState) => void;
    unfreeze: (state?: TriState) => void;
    frozen: boolean;

    disposeTriState: () => void;
}