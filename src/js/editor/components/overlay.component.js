import React, { useContext, useEffect, useState, useRef } from "react";
import { LineEl } from "./front-editor.component";
import Cursor from "./cursor.component";
import * as actions from "./../editor.actions";
import { EditorContext } from "./editor-panel.component";
import { isNullOrUndefined } from "util";

const Overlay = () => {
  const { dom, lines, rowHeight, scrollRange, dispatch } = useContext(
    EditorContext
  );
  const divEl = useRef(null);
  const [cursorPos, setCursorPos] = useState({
    top: undefined,
    left: undefined
  });

  const callbackCursorPos = e => {
    const { next, row, rowY, rowX } = getXPositions(e, divEl, dom)(
      scrollRange,
      rowHeight,
      lines
    );
    setCursorPos({ top: rowY, left: rowX });
    dispatch(actions.setCursorPosition(row, next));
  };

  if (dom.lines.length > 0) {
    return (
      <div
        ref={divEl}
        className="front-editor"
        onMouseDown={e => {
          e.stopPropagation();
          callbackCursorPos(e);
        }}
        onMouseUp={e => {
          e.stopPropagation();
          callbackCursorPos(e);
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

const getXPositions = (e, parentEl, dom) => (scrollRange, rowHeight, lines) => {
  const { clientX, clientY } = e;
  const { top } = parentEl.current.getBoundingClientRect();
  const posY = clientY - top;

  const row = Math.trunc(posY / rowHeight) + scrollRange.start;
  const rowY = Math.trunc(posY / rowHeight) * rowHeight;

  if (row < scrollRange.start + scrollRange.offset) {
    const { token, el } = getTokenFromEl(clientX, dom.tokens[row])(lines[row]);

    return token && el
      ? { ...getCursorXPositions(clientX, el)(token), row, rowY }
      : {
          ...getLastXPositions(clientX, dom.tokens[row])(lines[row]),
          row,
          rowY
        };
  }
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

const getLastXPositions = (clientX, tokensEl) => line => {
  const width = tokensEl.reduce(
    (w, t) => w + t.getBoundingClientRect().width,
    0
  );

  return { next: line.value.length, rowX: width };
};

export default Overlay;
