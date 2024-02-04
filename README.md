# Tri-State Checkbox

~~Despite the name, these checkboxes have 4 states.~~
These checkboxes have 3 states:
 - [x] **Checked** 
 - [ ] **Unchecked**
 -  **Unset** (Ignore the weird bullet--there was not a markdown option for an indeterminate checkbox)

Clicking (or any other method for changing an input) on the checkbox or its label will cycle through the 3 states. The order of the states can be customized for each checkbox if desired. Right-clicking on the checkbox or its label will cycle in reverse.

The tri-state checkboxes have no special CSS, so they will use the default look for an input being `checked=true`, `checked=false`, or `indeterminate=true`:

![Picture showing an input element cycling between the 3 states](https://raw.githubusercontent.com/CarsonChr/Tri-State-Checkbox/7a689d56207dc3730c1eac42b7dd5b826a924a81/tri-state-checkbox.gif)

## Usage

#### The demo.html shows some uses cases, but it is as easy as adding the script to the html file:

    <script src="tri-state-checkbox.js"></script>

#### There are several options for creating the checkboxes.

 1. `window.createTriStateForAll()`
	 - This will convert any checkbox input with a 'tri-state' attribute.
	 - Ex: `<input type="checkbox"  id="checkbox1"  tri-state>`
2. `window.createTriState(HTMLInputElement | string)`
	- This method accepts several different arguments: 
		- checkbox element: `window.createTriState(document.getElementById('checkbox1'))`
		-  checkbox element's id: `window.createTriState('checkbox1')`
		- selector query string: `window.createTriState('#checkbox1')`

#### The `tri-state` Attribute:
Adding this attribute to a checkbox input element allows it to become a tri-state checkbox. If you want to initialize a checkbox with a specific state, you can specify it: `<input type="checkbox" tri-state="unset">`. The three states are `unset`, `checked`, and `unchecked`

#### After creating the tri-state checkboxes, those HTML input elements will have several new properties:
- `state`: `unset` | `checked` | `unchecked`
	- setting this property will update the checkbox to the new state.
- `frozen`: boolean
	- setting this will freeze/unfreeze the element. When frozen, left/right-clicking (and every other user method to change a checkbox) will not work.
	- When frozen, setting `state` or calling `cycleState`, `advanceState`, or `devanceState` will still function normally.
- `cycleState`: `(count:  number) =>  void`
	- This method will cycle the state of the tri-state checkbox. The count parameter will determine the direction and number of states to cycle. A positive number will cycle forward, a negative number will cycle backward. The states will wrap around, so cycling forward from the last state will go to the first state.

- `advanceState`: `() =>  void`
	- This is the same as calling `cycleState(1)`

- `devanceState`: `() =>  void`
	- This is the same as calling `cycleState(-1)`

- `disposeTriState`: `() =>  void`
	- Calling this method will revert the tri-state checkbox to a regular checkbox.

## Dev Environment Setup
This requires `npm`, and typescript (accessible via `tsc`)

Run `npm install` to download and set up esbuild. **Done!**

Run `npm run build` to compile the typescript and bundle the javascript. It will output a single file: 'tri-state-checkbox.js'
