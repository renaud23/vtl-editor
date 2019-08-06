import React, { useContext, useRef, useEffect } from "react";
import classnames from "classnames";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";
import { tokenProps } from "../editor-prop-types";

/* */
const Token = props => {
  return <Unfocused {...props} />;
  // const {
  //   token: { className },
  //   focused
  // } = props;
  // return className === "unmapped" ? (
  //   <Unmapped {...props} />
  // ) : focused ? (
  //   <Focused {...props} />
  // ) : (
  //   <Unfocused {...props} />
  // );
};

Token.propTypes = tokenProps;

/* */
const Focused = props => {
  const {
    token: { start, value }
  } = props;
  const { index } = useContext(EditorContext);
  return (
    <span className="token-with-cursor">
      <Unfocused
        {...props}
        token={{
          ...props.token,
          value: value.substr(0, index - start),
          stop: index - 1
        }}
        cursored="left"
      />
      <span style={{ position: "relative" }}>
        <Unfocused
          {...props}
          token={{
            ...props.token,
            value: value.substr(index - start),
            start: index
          }}
          cursored="right"
        />
        <Cursor />
      </span>
    </span>
  );
};

/* */
const Unfocused = ({
  numberRow,
  numberToken,
  token: { className, typeName, value },
  cursored
}) => {
  const { lines } = useContext(EditorContext);
  const tokenEl = useRef(null);
  useEffect(() => {
    if (tokenEl.current) {
      lines[numberRow].tokens[numberToken].tokenEl = tokenEl.current;
    }
  }, [tokenEl, lines, numberRow, numberToken]);

  return (
    <span
      ref={tokenEl}
      title={`${typeName} : ${value}`}
      className={classnames("token", className, {
        "cursor-left": cursored === "left",
        "cursor-right": cursored === "right"
      })}
    >
      {value}
    </span>
  );
};

/* */
const Unmapped = props => {
  const {
    token: { value },
    focused
  } = props;
  const classNames = classnames("unmapped", "vtl-commons");
  return focused ? (
    <Focused className={classNames} value={value} {...props} />
  ) : (
    <Unfocused className={classNames} value={value} {...props} />
  );
};

export default Token;
