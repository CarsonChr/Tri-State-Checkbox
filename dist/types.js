export const defaultClassName = 'tri-state';
export const defaultAttribute = 'tri-state';
export const defaultStates = ['unchecked', 'checked', 'unset'];
export const moduleLoadEvent = 'tri-state-loaded';
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
