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

/* */
const paste = () => {
	console.log('paste');
	return false;
};

/* */
const copy = () => {
	console.log('copy');
	return false;
};

/* MAPPING */
SHORT_CUTS.set('ctrl|x', cut);
SHORT_CUTS.set('ctrl|c', copy);
SHORT_CUTS.set('ctrl|v', cut);
