import React, { useContext, useState, useEffect, createRef } from "react";
import { EditorContext } from "./editor-panel.component";
import createKeydownCallback from "./../editor-keydown-callback";
import * as actions from "../editor.actions";

const FrontEditor = () => {
  const state = useContext(EditorContext);
  const {
    lines,
    dom,
    scrollRange,
    dispatch,
    handleChange,
    errors,
    shortcutPatterns,
    index,
    focusedRow
  } = state;

  const visiblesLines = lines.reduce(
    (a, line, i) =>
      i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
    []
  );

  useEffect(() => {
    if (typeof handleChange === "function") {
      handleChange({ lines, errors });
    }
  }, [lines, handleChange, errors]);

  const callbackKeyDown = createKeydownCallback(
    dispatch,
    state,
    shortcutPatterns
  );

  const [startSelection, setStartSelection] = useState(false);
  const [localSel, setLocalSel] = useState({});

  const callbackCursorPos = (tokensEl, line, row) => e => {
    e.stopPropagation();
    const next = calculCursorIndex(tokensEl, line, getClientX(e));
    if (row !== focusedRow || next !== index) {
      dispatch(actions.setCursorPosition(row, next));
    }
  };

  const divEl = createRef();
  useEffect(() => {
    if (divEl.current) {
      divEl.current.addEventListener(
        "wheel",
        e => {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (e.deltaY > 0) {
            dispatch(actions.scrollDown());
          } else {
            dispatch(actions.scrollUp());
          }
        },
        {
          passive: false
        }
      );
    }
  }, [divEl, dispatch]);
  return (
    <div
      ref={divEl}
      className="front-editor"
      tabIndex="0"
      onKeyDown={callbackKeyDown}
      onMouseLeave={() => {
        setStartSelection(false);
      }}
      onBlur={() => {
        // setStartSelection(false);
      }}
    >
      <div style={{ positon: "relative" }}>
        {visiblesLines.map((line, i) => {
          const row = i + scrollRange.start;
          return (
            <LineEl
              key={`${row}`}
              el={dom.lines[i]}
              onMouseDown={e => {
                setStartSelection(true);
                e.stopPropagation();
                const next = calculCursorIndex(
                  dom.tokens[i],
                  line,
                  getClientX(e)
                );
                if (row !== focusedRow || next !== index) {
                  dispatch(actions.setCursorPosition(row, next));
                  setLocalSel({ start: { row, index: next } });
                  dispatch(
                    actions.setSelection({ start: { row, index: next } })
                  );
                }
              }}
              onMouseUp={e => {
                setStartSelection(false);
                callbackCursorPos(dom.tokens[i], line, row)(e);
              }}
              onMouseMove={e => {
                if (startSelection) {
                  const next = calculCursorIndex(
                    dom.tokens[i],
                    line,
                    getClientX(e)
                  );
                  const ls = {
                    ...localSel,
                    stop: {
                      row: row,
                      index: next
                    }
                  };

                  if (
                    (ls.stop && !localSel.stop) ||
                    ls.stop.row !== localSel.stop.row ||
                    ls.stop.index !== localSel.stop.index ||
                    ls.start.row !== localSel.start.row ||
                    ls.start.index !== localSel.start.index
                  ) {
                    setLocalSel(ls);
                    const invert =
                      ls.stop.row < ls.start.row ||
                      (ls.stop.row === ls.start.row &&
                        ls.stop.index < ls.start.index);
                    if (invert) {
                      dispatch(
                        actions.setSelection({ start: ls.stop, stop: ls.start })
                      );
                      dispatch(
                        actions.setCursorPosition(ls.stop.row, ls.stop.index)
                      );
                    } else {
                      dispatch(actions.setSelection(ls));
                      dispatch(actions.setCursorPosition(row, next));
                    }
                  }
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/* */
const getClientX = e => {
  return e.clientX;
};

/* */
const calculCursorIndex = (tokensEl, { value, tokens }, clientX) => {
  const { el, token } = tokensEl.reduce((a, el, i) => {
    const { left, width } = el.getBoundingClientRect();
    return el && clientX >= left && clientX <= left + width
      ? { el, token: tokens[i] }
      : a;
  }, {});

  return el
    ? getCursorIndex(el, token, clientX)
    : tokensEl.length > 0
    ? value.length
    : 0;
};

/* */
const getCursorIndex = (el, { start, value }, clientX) => {
  const { width, left } = el.getBoundingClientRect();
  const chasse = width / value.length;
  const curX = clientX - left;
  const next = start + Math.round(curX / chasse);
  return next;
};

/* */
export const LineEl = ({
  el,
  children,
  onMouseDown = () => null,
  onMouseUp = () => null,
  onMouseMove = () => null
}) => {
  if (el) {
    const { width, height, top, left } = el.getBoundingClientRect();

    return (
      <div
        className="row"
        style={{ width, height, top, left, positon: "absolute" }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {children}
      </div>
    );
  }

  return null;
};

export default FrontEditor;
