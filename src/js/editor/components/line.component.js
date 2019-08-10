import React, { useContext, useEffect, createRef } from "react";
import Token from "./token.component";
import { EditorContext } from "./editor-panel.component";
import { lineProps } from "../editor-prop-types";

const Line = ({ tokens = [], row }) => {
  const { scrollRange, dom } = useContext(EditorContext);
  const divEl = createRef();
  const tokensEl = tokens.map(() => createRef());
  useEffect(() => {
    if (divEl.current && tokensEl) {
      dom.lines[row] = divEl.current;
      dom.tokens[row] = tokensEl.map(l => l.current);
    }
  }, [row, divEl, dom, scrollRange.start, tokensEl]);

  return (
    <div ref={divEl} className="row" onBlur={e => e.stopPropagation()}>
      {tokens.map((token, i) => (
        <Token
          key={`${i}-${token.value}`}
          token={token}
          ref={tokensEl[i]}
          numberRow={row}
          numberToken={i}
        />
      ))}
    </div>
  );
};

Line.propTypes = lineProps;

export default Line;
