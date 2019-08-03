import * as actions from './editor.actions';

const getPattern = ({ altKey, shiftKey, ctrlKey, key }) =>
	`${altKey ? 'alt|' : ''}${shiftKey ? 'shift|' : ''}${ctrlKey ? 'ctrl|' : ''}${key ? key : ''}`;

const SHORT_CUTS = new Map();

/* */
const unmappedPattern = (pattern) => () => {
	console.debug(`unmapped pattern: ${pattern}`);
};

export default {
	get: (model = {}) => {
		const pattern = getPattern(model);

		return {
			execute: SHORT_CUTS.has(pattern) ? SHORT_CUTS.get(pattern) : unmappedPattern(pattern)
		};
	}
};

/* */
const cut = () => {
	console.log('cut');
	return false;
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
	return false;
};

/* copy to clipboard */
const copy = (dispatch, state) => {
	if (state.selection) {
		const content = getSelection(state);
		if (navigator && navigator.clipboard) navigator.clipboard.writeText(content);
	}
	return false;
};

const getSelection = ({ lines, selection: { anchorRow, anchorOffset, extentRow, extentOffset } }) =>
	lines
		.map(
			({ value }, row) =>
				row === anchorRow
					? `${value.substr(anchorOffset, row === extentRow ? extentOffset : value.length)}`
					: row === extentRow
						? value.substr(0, extentOffset)
						: row >= anchorRow && row <= extentRow ? value : null
		)
		.reduce((a, line) => (line ? `${a}${line}\n` : a), '');

/* MAPPING */
SHORT_CUTS.set('ctrl|x', cut);
SHORT_CUTS.set('ctrl|c', copy);
SHORT_CUTS.set('ctrl|v', paste);
