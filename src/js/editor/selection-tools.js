const SELECTION_TOOLS = {};

/* ({lines, selection}) =>  string  */
export const getSelection = ({ lines, selection: { anchorRow, anchorOffset, extentRow, extentOffset } }) =>
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

/* */
export const getTokensOnLine = (line = { tokens: [] }, index) =>
	line.tokens.reduce((a, token) => (index >= token.start && index <= token.stop ? token : a), undefined);

/* */
SELECTION_TOOLS.getSelection = getSelection;

export default SELECTION_TOOLS;
