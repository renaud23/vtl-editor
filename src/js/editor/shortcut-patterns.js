import * as actions from './editor.actions';
import { getSelection } from './selection-tools';

const SHORT_CUTS = new Map();

/* */
const unmappedPattern = (pattern) => () => {
	console.debug(`unmapped pattern: ${pattern}`);
	return false;
};

/* cut to clipboard */
const cut = () => {
	console.log('cut');
	return true;
};

/* paste clipboard */
const paste = (dispatch, state) => {
	if (navigator && navigator.clipboard)
		navigator.clipboard.readText().then((text) => {
			if (text && text.length > 0) {
				if (state.selection && state.selection.extentRow) dispatch(actions.deleteSelection());
				dispatch(actions.insertText(text));
			}
		});
	return true;
};

/* select all */
const selectAll = (dispatch, state) => {
	dispatch(
		actions.setSelection({
			anchorRow: 0,
			anchorOffset: 0,
			extentRow: state.lines.length - 1,
			extentOffset: state.lines[state.lines.length - 1].value.length
		})
	);
	return true;
};

/* copy to clipboard */
const copy = (dispatch, state) => {
	if (state.selection) {
		const content = getSelection(state);
		if (navigator && navigator.clipboard) navigator.clipboard.writeText(content);
	}
	return true;
};

/* MAPPING */
SHORT_CUTS.set('ctrl|x', cut);
SHORT_CUTS.set('ctrl|c', copy);
SHORT_CUTS.set('ctrl|v', paste);
SHORT_CUTS.set('ctrl|a', selectAll);

const getPattern = ({ altKey, shiftKey, ctrlKey, key }) =>
	`${altKey ? 'alt|' : ''}${shiftKey ? 'shift|' : ''}${ctrlKey ? 'ctrl|' : ''}${key ? key : ''}`;

const createShortcutsProvider = (shortcutsMap) => ({
	get: (model = {}) => {
		const pattern = getPattern(model);

		return {
			execute: shortcutsMap.has(pattern) ? shortcutsMap.get(pattern) : unmappedPattern(pattern)
		};
	}
});

/* */
export const composeShortcuts = (patterns = {}, erase = false) => {
	const newMap = Object.entries(patterns).reduce((map, [ pattern, action ]) => {
		if ((erase || !map.has(pattern)) && typeof action === 'function') {
			map.set(pattern, action);
		}

		return map;
	}, new Map(SHORT_CUTS));

	return createShortcutsProvider(newMap);
};

/* */
export default composeShortcuts(SHORT_CUTS);
