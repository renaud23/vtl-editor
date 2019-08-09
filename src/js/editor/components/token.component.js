import React from "react";
import classnames from "classnames";
import { tokenProps } from "../editor-prop-types";

/* */
const Token = ({ refEl, token: { className, typeName, value }, cursored }) => {
  return (
    <span ref={refEl} className={classnames("token", className, {})}>
      {value}
    </span>
  );
};

Token.propTypes = tokenProps;

export default React.forwardRef((props, ref) => (
  <Token refEl={ref} {...props} />
));
