import React, { useContext, useRef, useState, useEffect } from "react";
import Cursor from "./cursor.component";
import { Row } from "./front-editor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines, focusedRow, index } = useContext(EditorContext);
  const divEl = useRef(null);
  const [{ top, left }, setPosition] = useState({});
  const [posX, setPosX] = useState(0);

  useEffect(() => {
    if (divEl.current) {
      const rect = divEl.current.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.left, height: rect.height });
    }
  }, [divEl, setPosition]);

  useEffect(() => {
    if (focusedRow !== undefined) {
      const line = lines[focusedRow];
      const token = line.tokens.find(t => index >= t.start && index <= t.stop);
      if (token && token.tokenEl) {
        const rt = token.tokenEl.getBoundingClientRect();
        const chasse = Math.round(rt.width / token.value.length);
        setPosX(
          rt.left -
            left -
            line.contentEl.offsetLeft +
            chasse * (index - token.start)
        );
        return;
      }
    }
  }, [index, focusedRow, lines]);

  return (
    <div className="overlay">
      <div
        className="overlay-container"
        style={{ position: "relative", zIndex: "1" }}
        ref={divEl}
      >
        {lines.map((line, i) => (
          <Row line={line} key={i} row={i} mx={left} my={top}>
            {i === focusedRow ? (
              <span
                style={{
                  width: `${posX}px`,
                  height: "100%",
                  display: "inline-block",
                  backgroundColor: "rgba(0,100,100,0.5)"
                }}
              />
            ) : (
              <span />
            )}
          </Row>
        ))}
      </div>
    </div>
  );
};

export default Overlay;
