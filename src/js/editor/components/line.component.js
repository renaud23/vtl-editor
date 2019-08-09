import React, { useContext, useEffect, useRef } from "react";
import Token from "./token.component";
import { EditorContext } from "./editor-panel.component";
import { lineProps } from "../editor-prop-types";

const Line = ({ tokens = [], row }) => {
  const { lines } = useContext(EditorContext);
  const divEl = useRef(null);
  useEffect(() => {
    if (divEl.current) {
      lines[row].dom = {
        el: divEl.current
      };
    }
  }, [row, divEl, lines]);

  return (
    <div ref={divEl} className="row" onBlur={e => e.stopPropagation()}>
      {tokens.map((token, i) => (
        <Token
          key={`${i}-${token.value}`}
          token={token}
          numberRow={row}
          numberToken={i}
        />
      ))}
    </div>
  );
};

Line.propTypes = lineProps;

export default Line;
