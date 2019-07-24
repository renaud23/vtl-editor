import propTypes from "prop-types";

export const tokenProps = {
  value: propTypes.string.isRequired,
  name: propTypes.string,
  className: propTypes.string.isRequired,
  focused: propTypes.bool,
  numberToken: propTypes.number,
  numberRow: propTypes.number,
  start: propTypes.number.isRequired,
  stop: propTypes.number.isRequired
  // index: propTypes.number
};

export const lineProps = {
  length: propTypes.number.isRequired,
  tokens: propTypes.arrayOf(propTypes.shape(tokenProps)),
  number: propTypes.number.isRequired,
  index: propTypes.number,
  focused: propTypes.bool.isRequired
};

export const EditorProps = {};
EditorProps.tokenProps = tokenProps;
EditorProps.lineProps = lineProps;

export default EditorProps;