import React, { useContext, useEffect, useState, useRef } from "react";
import { LineEl } from "./front-editor.component";
import Cursor from "./cursor.component";
import * as actions from "./../editor.actions";
import { EditorContext } from "./editor-panel.component";
import { isNullOrUndefined } from "util"; 

const Overlay = () => {
  const { dom, lines, rowHeight, scrollRange,dispatch } = useContext(EditorContext);
  const divEl = useRef(null);
  const [cursorPos, setCursorPos] = useState({
    top: undefined,
    left: undefined
  });
  if (dom.lines.length > 0) {
    return (
      <div
        ref={divEl}
        className="front-editor"
        onMouseDown={e => {
          const { clientX, clientY } = e;
          const { top, left } = divEl.current.getBoundingClientRect();
          const posX = clientX - left;
          const posY = clientY - top;

          const row = Math.trunc(posY / rowHeight) + scrollRange.start;
          const rowY = Math.trunc(posY / rowHeight) * rowHeight;

          if (row < scrollRange.start + scrollRange.offset) {
            // rien à faire si hors de l'offset
            const { token, el } = getTokenFromEl(clientX, dom.tokens[row])(
              lines[row]
            );
            if (token && el) {
              const { next, rowX } = getCursorXPositions(clientX, el)(token);
              setCursorPos({ top: rowY, left: rowX });
              dispatch(actions.setCursorPosition(next, row));
            } else {
              // fin de ligne
            }
          }
        }}
      >
        {cursorPos.top !== undefined && cursorPos.left !== undefined ? (
          <span
            className="cursor"
            style={{ top: cursorPos.top, left: cursorPos.left }}
          />
        ) : null}
      </div>
    );
  }
  return null;
};

const getXPositions = e => {
  return {};
};

const getTokenFromEl = (clientX, tokensEl) => line =>
  tokensEl.reduce(
    (a, el, i) => {
      const { left, width } = el.getBoundingClientRect();
      return clientX >= left && clientX <= left + width
        ? { el, token: line.tokens[i] }
        : a;
    },
    { token: undefined, el: undefined }
  );

const getCursorXPositions = (clientX, el) => ({ start, value }) => {
  const { width, left } = el.getBoundingClientRect();
  const chasse = width / value.length; // char width in pixel
  const curX = clientX - left; // cursor pos in token, in pixel
  const tokX = Math.trunc(curX / chasse); // nb char in token before cursor
  const next = start + tokX; // nb char in row before cursor
  const rowX = tokX * chasse + el.offsetLeft; // cur pos in row, at char start position
  return { next, rowX };
};

export default Overlay;
