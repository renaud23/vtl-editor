import React, { useContext, useState, useEffect } from "react";
import { EditorContext } from "./editor-panel.component";
import createKeydownCallback from "./../editor-keydown-callback";
import * as actions from "../editor.actions";

const FrontEditor = () => {
  const state = useContext(EditorContext);
  const {
    lines,
    dispatch,
    handleChange,
    errors,
    shortcutPatterns,
    index,
    focusedRow
  } = state;

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

  const callbackCursorPos = (line, row) => e => {
    e.stopPropagation();
    const next = calculCursorIndex(line, getClientX(e));
    if (row !== focusedRow || next !== index) {
      dispatch(actions.setCursorPosition(row, next));
    }
  };

  return (
    <div
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
        {lines.map((line, row) => (
          <LineEl
            key={row}
            line={line}
            onMouseDown={e => {
              setStartSelection(true);
              e.stopPropagation();
              const next = calculCursorIndex(line, getClientX(e));
              if (row !== focusedRow || next !== index) {
                dispatch(actions.setCursorPosition(row, next));
                setLocalSel({ start: { row, index: next } });
                dispatch(actions.setSelection({ start: { row, index: next } }));
              }
            }}
            onMouseUp={e => {
              setStartSelection(false);
              callbackCursorPos(line, row)(e);
            }}
            onMouseMove={e => {
              if (startSelection) {
                const next = calculCursorIndex(line, getClientX(e));

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
        ))}
      </div>
    </div>
  );
};

/* */
const getClientX = e => {
  return e.clientX;
};

/* */
const calculCursorIndex = (line, clientX) => {
  const token = line.tokens.find(token => {
    const { left, width } = token.dom.el.getBoundingClientRect();
    return clientX >= left && clientX <= left + width;
  });
  return token
    ? getCursorIndex(token, clientX)
    : line.tokens.length > 0
    ? line.value.length
    : 0;
};

/* */
const getCursorIndex = (token, clientX) => {
  const { width, left } = token.dom.el.getBoundingClientRect();
  const chasse = width / token.value.length;
  const curX = clientX - left;
  const next = token.start + Math.round(curX / chasse);
  return next;
};

/* */
export const LineEl = ({
  line,
  children,
  onMouseDown = () => null,
  onMouseUp = () => null,
  onMouseMove = () => null
}) => {
  if (line.dom) {
    const { width, height, top, left } = line.dom.el.getBoundingClientRect();

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
