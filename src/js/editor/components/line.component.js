import React, { useContext, useRef } from "react";
import classnames from "classnames";
import Token from "./token.component";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";
import { lineProps } from "../editor-prop-types";

const Line = ({ tokens = [], number, length, index, focused }) => {
  const { lines } = useContext(EditorContext);
  const contentEl = useRef(null);
  const rectLine = lines[number].tokens
    .map(token =>
      token.tokenEl ? token.tokenEl.getBoundingClientRect() : undefined
    )
    .reduce(
      ({ width, height, top, left }, r) =>
        r
          ? {
              width: width + r.width,
              height: height || r.height,
              top: top || r.top,
              left: left || r.left
            }
          : { width, height },
      {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      }
    );

  if (contentEl.current) {
    lines[number].contentEl = contentEl.current;
  }
  lines[number].rectLine = rectLine;
  return (
    <div className="editor-line" tabIndex="0" onBlur={e => e.stopPropagation()}>
      <NumberLine number={number} />
      <span className="content" ref={contentEl}>
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
