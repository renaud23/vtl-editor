import React, { useContext, useRef, useState, useEffect } from "react";
import { LineEl } from "./front-editor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines } = useContext(EditorContext);
  return (
    <div className="overlay">
      <div style={{ positon: "relative" }}>
        {lines.map((line, row) => (
          <LineEl key={row} line={line}>
            <Line
              tokens={line.tokens}
              row={row}
              left={line.dom ? line.dom.rect.left : 0}
            />
          </LineEl>
        ))}
      </div>
    </div>
  );
};

const Line = ({ tokens, row, left }) => {
  const { index, focusedRow } = useContext(EditorContext);
  if (row === focusedRow) {
    const token = tokens.find(
      ({ start, stop }) => index >= start && index <= stop
    );
    const pos = token ? getCursorPos(token, index) : 0;

    return [
      <span
        key={0}
        style={{
          width: pos - left,
          height: "100%",
          display: "inline-block"
        }}
      />,
      <span className="cursor" key={1} />
    ];
  }

  return null;
};

const getCursorPos = (token, index) => {
  const chasse = token.dom.rect.width / token.value.length;
  const curX = Math.round(token.dom.rect.left + (index - token.start) * chasse);
  return curX;
};

export default Overlay;
