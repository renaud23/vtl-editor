import React, { useContext, useRef, useEffect } from "react";
import classnames from "classnames";
import { EditorContext } from "./editor-panel.component";
import { tokenProps } from "../editor-prop-types";

/* */
const Token = ({
  numberRow,
  numberToken,
  token: { className, typeName, value },
  cursored
}) => {
  const { lines } = useContext(EditorContext);
  const tokenEl = useRef(null);
  useEffect(() => {
    if (tokenEl.current) {
      lines[numberRow].tokens[numberToken].dom = {
        el: tokenEl.current
      };
    }
  }, [tokenEl, lines, numberRow, numberToken]);
  return (
    <span
      ref={tokenEl}
      className={classnames("token", className, {
        "cursor-left": cursored === "left",
        "cursor-right": cursored === "right"
      })}
    >
      {value}
    </span>
  );
};

Token.propTypes = tokenProps;

export default React.memo(Token);
