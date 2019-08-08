const SELECTION_TOOLS = {};

/* ({lines, selection}) =>  string  */
export const getSelection = ({ lines, selection: { stop, start } }) =>
  lines
    .map(({ value }, row) =>
      row === start.row
        ? `${value.substr(
            start.index,
            row === stop.row ? stop.index : value.length
          )}`
        : row === stop.row
        ? value.substr(0, stop.index)
        : row >= start.row && row <= stop.row
        ? value
        : null
    )
    .reduce((a, line) => (line ? `${a}${line}\n` : a), "");

/* */
SELECTION_TOOLS.getSelection = getSelection;

export default SELECTION_TOOLS;
