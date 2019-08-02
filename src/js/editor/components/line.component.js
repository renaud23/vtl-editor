import React from "react";
import classnames from "classnames";
import Token from "./token.component";
import Cursor from "./cursor.component";
import { lineProps } from "../editor-prop-types";

const Line = ({ tokens = [], number, length, index, focused }) => {
  return (
    <div className="editor-line" tabIndex="0" onBlur={e => e.stopPropagation()}>
      <NumberLine number={number} />
      <span className="content">
        {tokens.map((token, i) => (
          <Token
            key={`${i}-${token.value}`}
            token={token}
            numberRow={number}
            numberToken={i}
            focused={focused && index >= token.start && index <= token.stop}
          />
        ))}
        {focused && index === length ? <Cursor endLine={true} /> : null}
      </span>
    </div>
  );
};

/* */
const NumberLine = ({ focused = false, number }) => (
  <div className={classnames("num", { "num-focused": focused })}>
    {number + 1}
  </div>
);

Line.propTypes = lineProps;

export default Line;
