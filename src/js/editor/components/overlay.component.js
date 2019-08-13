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
  const [anchor, setAnchor] = useState(undefined);
  const [extent, setExtent] = useState(undefined);
  const [cursorPosition, setCursorPosition] = useState(undefined);
  const [selectionStart, setSelectionStart] = useState(false);

  useEffect(() => {
    const screenRow = focusedRow - scrollRange.start;
    const top = rowHeight * screenRow;
    if (dom.tokens[screenRow]) {
      const left = getCursorLeft(dom.tokens[screenRow])(
        lines[focusedRow],
        index
      );
      setCursorPosition({ top, left });
    }
  }, [index, focusedRow, rowHeight, scrollRange.start, dom.tokens, lines]);

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
          e.stopPropagation();
          setSelectionStart(true);
          const { newFocusedRow, newIndex } = getCursorPosition(e, divEl, dom)(
            state
          );
          setAnchor({ row: newFocusedRow, index: newIndex });
          dispatch(actions.setCursorPosition(newFocusedRow, newIndex));
        }}
        onMouseUp={e => {
          e.stopPropagation();
          setSelectionStart(false);
          // if (anchor && extent) {
          //   if (anchor.row === extent.row && anchor.index === extent.index) {
          //     setAnchor(undefined);
          //     setExtent(undefined);
          //     dispatch(actions.setSelection(undefined));
          //   } else {
          //     dispatch(actions.setSelection({ start: anchor, stop: extent }));
          //   }
          // } else {
          dispatch(actions.setSelection(undefined));
          // }
        }}
        onMouseMove={e => {
          if (selectionStart) {
            const { newFocusedRow, newIndex } = getCursorPosition(
              e,
              divEl,
              dom
            )(state);
            setExtent({ row: newFocusedRow, index: newIndex });
            dispatch(actions.setCursorPosition(newFocusedRow, newIndex));
            dispatch(
              actions.setSelection({
                start: anchor,
                stop: { row: newFocusedRow, index: newIndex }
              })
            );
          }
        }}
      >
        {cursorPosition ? (
          <span
            className="cursor"
            style={{
              left: `${cursorPosition.left}px`,
              top: `${cursorPosition.top}px`
            }}
          />
        ) : null}
        {selection
          ? getSelectionBlocs(dom)(state).map(({ top, left, width }, i) => (
              <span
                key={i}
                className="bloc-selection"
                style={{ top, left, width: width === 0 ? 5 : width }}
              />
            ))
          : null}
      </div>
    );
  }
  return null;
};

/*
 * CURSOR
 */
const getCursorPosition = (e, parentEl, dom) => ({
  lines,
  scrollRange,
  rowHeight
}) => {
  const { clientX, clientY } = e;
  const { top } = parentEl.current.getBoundingClientRect();
  const posY = clientY - top;
  const screenRow = Math.trunc(posY / rowHeight);
  const newFocusedRow = screenRow + scrollRange.start;

  if (screenRow < scrollRange.offset) {
    const newIndex = getCursorIndex(
      clientX,
      parentEl,
      dom.tokens[newFocusedRow]
    )(lines[newFocusedRow]);
    return { newFocusedRow, newIndex };
  }
  return {};
};

const getCursorIndex = (clientX, parentEl, tokensEl) => line => {
  const { left } = parentEl.current.getBoundingClientRect();
  const rowWidth =
    line.value.length === 0
      ? 0
      : tokensEl.reduce((a, el) => el.getBoundingClientRect().width + a, 0);
  const chasse = rowWidth / line.value.length;
  const index = Math.trunc((clientX - left) / chasse);
  return Math.min(index, line.value.length);
};

const getCursorLeft = tokensEl => (line, index) => {
  const rowWidth =
    line.value.length === 0
      ? 0
      : tokensEl.reduce((a, el) => el.getBoundingClientRect().width + a, 0);
  const chasse = rowWidth / line.value.length;

  return Math.trunc(chasse * index);
};

/*
 * SELECTION
 */
const getSelectionBlocs = dom => state =>
  state.selection.start.row === state.selection.stop.row
    ? singleRowSelection(dom)(state)
    : multiRowSelection(dom)(state);

const singleRowSelection = dom => ({
  selection,
  scrollRange,
  lines,
  rowHeight
}) => {
  const top = rowHeight * selection.start.row;
  const left = getCursorLeft(
    dom.tokens[selection.start.row - scrollRange.start]
  )(lines[selection.start.row], selection.start.index);

  const width =
    getCursorLeft(dom.tokens[selection.stop.row - scrollRange.start])(
      lines[selection.stop.row],
      selection.stop.index
    ) - left;

  return [{ top, width, left }];
};

const multiRowSelection = dom => ({
  selection,
  lines,
  scrollRange,
  rowHeight
}) => {
  const end =
    selection.stop.row >= 0 ? selection.stop.row : scrollRange.offset - 1;
  const blocs = new Array(end - selection.start.row + 1)
    .fill({})
    .map((bloc, i) => {
      const top = rowHeight * (selection.start.row + i);
      return {
        left: 0,
        top,
        width: dom.tokens[selection.start.row + i - scrollRange.start].reduce(
          (a, t) => t.getBoundingClientRect().width + a,
          0
        )
      };
    });

  blocs[0] = {
    ...blocs[0],
    left: getCursorLeft(dom.tokens[selection.start.row - scrollRange.start])(
      lines[selection.start.row],
      selection.start.index
    )
  };

  blocs[blocs.length - 1] = {
    ...blocs[blocs.length - 1],
    width: getCursorLeft(dom.tokens[end - scrollRange.start])(
      lines[end],
      selection.stop.index || lines[end].length
    )
  };
  return blocs;
};

export default Overlay;
