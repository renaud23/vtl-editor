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
  const [selectionBlocs, setSelectionBlocs] = useState([]);
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
  useEffect(() => {
    if (selection && selection.stop) {
      const blocs = getSelectionsBlocs(dom, rowHeight)(
        selection,
        lines,
        scrollRange
      );
      setSelectionBlocs(blocs);
    }
  }, [selection, dom, rowHeight, scrollRange, lines, index]);

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
            setSelectionBlocs([]);
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
        {selectionBlocs.map(({ top, left, width }, i) => (
          <span
            className="bloc-selection"
            key={i}
            style={{ top, left, width }}
          />
        ))}
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
const getCursorXScreenPos = el => ({ value, start }, index) => {
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

const getSelectionsBlocs = (dom, rowHeight) => (
  selection,
  lines,

  scrollRange
) =>
  selection && selection.stop
    ? selection.start.row === selection.stop.row
      ? singleRowSelection(dom, rowHeight)(selection, lines, scrollRange)
      : MultiRowSelection(dom, rowHeight)(selection, lines, scrollRange)
    : [];

const singleRowSelection = (dom, rowHeight) => (
  selection,
  lines,
  scrollRange
) => {
  return [];
};

const MultiRowSelection = (dom, rowHeight) => (
  { start, stop }, //selection
  lines,
  scrollRange
) => {
  const blocs = new Array(stop.row - start.row + 1)
    .fill({})
    .map((b, i) =>
      getFullRow(dom.tokens[start.row + i], start.row + i, rowHeight)(
        lines[start.row],
        start.index
      )
    );
  const anchorScreenRow = start.row - scrollRange.start;
  blocs[0] = getAnchorBloc(dom.tokens[anchorScreenRow], start.row, rowHeight)(
    lines[start.row],
    start.index
  );

  if (stop.row >= 0 && stop.index >= 0) {
    // const extentScreenRow = stop.row - scrollRange.start;
    // blocs[blocs.length - 1] = getExtentBloc(
    //   dom.tokens[extentScreenRow],
    //   stop.row,
    //   rowHeight
    // )(lines[start.row], stop.index);
  }

  return blocs;
};

const getAnchorBloc = (tokensEl, rowScreen, rowHeight) => (line, index) => {
  const { token, el } = getTokenFromIndex(tokensEl)(line, index);
  if (token) {
    const left = getCursorXScreenPos(el)(token, index);
    return {
      left,
      top: rowScreen * rowHeight,
      width: getLastCurxPosition(tokensEl) - left
    };
  }
  return {};
};

const getExtentBloc = (tokensEl, rowScreen, rowHeight) => (line, index) => {
  const { token, el } = getTokenFromIndex(tokensEl)(line, index);
  if (token) {
    const width = getCursorXScreenPos(el)(token, index);
    return {
      left: 0,
      top: rowScreen * rowHeight,
      width
    };
  }
  return {};
};

const getFullRow = (tokensEl, rowScreen, rowHeight) => (line, index) => {
  return {
    left: 0,
    top: rowScreen * rowHeight,
    width: getLastCurxPosition(tokensEl)
  };
};

export default Overlay;
