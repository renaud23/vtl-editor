import React, { useContext, useEffect, useState, useRef } from "react";
import createKeydownCallback from "./../editor-keydown-callback";
import * as actions from "./../editor.actions";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const state = useContext(EditorContext);
  const {
    dom,
    selection,
    lines,
    index,
    focusedRow,
    rowHeight,
    scrollRange,
    shortcutPatterns,
    dispatch
  } = state;
  const divEl = useRef(null);
  const [cursorPos, setCursorPos] = useState({
    top: undefined,
    left: undefined
  });
  const [startSelection, setStartSelection] = useState(false);
  const callbackCursorPos = e => {
    const { next, row } = getXPositions(e, divEl, dom)(
      scrollRange,
      rowHeight,
      lines
    );
    dispatch(actions.setCursorPosition(row, next));
    return { next, row };
  };

  /* cursor */
  useEffect(() => {
    if (focusedRow >= 0 && index >= 0) {
      if (focusedRow > scrollRange.start + scrollRange.offset) {
        console.log("TODO avancer d'un rang le scrollRange");
        return;
      }

      // focusedRow is in offset range
      const { token, el } = getTokenFromIndex(dom.tokens[focusedRow])(
        lines[focusedRow],
        index
      );
      const screenIndex = focusedRow - scrollRange.start;
      const top = rowHeight * screenIndex;
      if (token) {
        const left = Math.trunc(getCursorXScreenPos(el)(token, index));
        setCursorPos({ top, left });
      } else {
        const left = getLastCurxPosition(dom.tokens[screenIndex]);
        setCursorPos({ top, left });
      }
    }
  }, [
    index,
    focusedRow,
    lines,
    dom.tokens,
    rowHeight,
    scrollRange.start,
    scrollRange.offset
  ]);
  /* selection */
  useEffect(() => {}, []);

  const callbackKeyDown = createKeydownCallback(
    dispatch,
    state,
    shortcutPatterns
  );

  if (dom.lines.length > 0) {
    return (
      <div
        ref={divEl}
        tabIndex="0"
        className="front-editor"
        onKeyDown={callbackKeyDown}
        onMouseDown={e => {
          setStartSelection(true);
          e.stopPropagation();
          const { next, row } = callbackCursorPos(e);
          dispatch(actions.setSelection({ start: { row, index: next } }));
        }}
        onMouseUp={e => {
          setStartSelection(false);
          e.stopPropagation();
          const { next, row } = callbackCursorPos(e);
          if (selection.start.row === row && selection.start.index === next) {
            dispatch(actions.setSelection(undefined));
          }
        }}
        onMouseMove={e => {
          if (startSelection) {
            e.stopPropagation();
            const { next, row } = callbackCursorPos(e);
            if (selection.start.row !== row || selection.start.index !== next) {
              dispatch(
                actions.setSelection({
                  ...selection,
                  stop: { row, index: next }
                })
              );
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

/*
 * CURSOR
 */
const getXPositions = (e, parentEl, dom) => (scrollRange, rowHeight, lines) => {
  const { clientX, clientY } = e;
  const { top } = parentEl.current.getBoundingClientRect();
  const posY = clientY - top;
  const row = Math.trunc(posY / rowHeight) + scrollRange.start;
  if (row < scrollRange.start + scrollRange.offset) {
    const { token, el } = getTokenFromEl(clientX, dom.tokens[row])(lines[row]);

    return token && el
      ? { ...getCursorXPositions(clientX, el)(token), row }
      : {
          ...getLastXPositions(lines[row]),
          row
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

const getTokenFromIndex = tokensEl => (line, index) =>
  tokensEl
    ? line.tokens.reduce(
        (a, t, i) =>
          index >= t.start && index <= t.stop
            ? { token: t, el: tokensEl[i] }
            : a,
        {}
      )
    : {};

const getCursorXPositions = (clientX, el) => ({ start, value }) => {
  const { width, left } = el.getBoundingClientRect();
  const chasse = width / value.length; // char width in pixel
  const curX = clientX - left; // cursor pos in token, in pixel
  const tokX = Math.trunc(curX / chasse); // nb char in token before cursor
  const next = start + tokX; // nb char in row before cursor
  return { next };
};

const getLastXPositions = line => {
  return { next: line.value.length };
};

/* */
const getCursorXScreenPos = (el, rowHeight) => ({ value, start }, index) => {
  const { width } = el.getBoundingClientRect();
  const chasse = width / value.length; // char width in pixel
  return chasse * (index - start) + el.offsetLeft;
};

const getLastCurxPosition = tokensEl =>
  tokensEl
    ? tokensEl.reduce((a, el) => a + el.getBoundingClientRect().width, 0)
    : 0;

/*
 * SELECTION
 */
const getSelection = () => {
  return null;
};

const getSelectionScreen = () => {
  return null;
};

export default Overlay;
