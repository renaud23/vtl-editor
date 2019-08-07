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
    focusedRow,
    selection
  } = state;

  useEffect(() => {
    if (typeof handleChange === "function") {
      handleChange({ lines, errors });
    }
  }, [lines, handleChange, errors]);

  const [startSelection, setStartSelection] = useState(false);

  const callbackCursorPos = (line, row) => e => {
    e.stopPropagation();
    const next = calculCursorIndex(line, e.clientX);
    if (row !== focusedRow || next !== index) {
      dispatch(actions.setCursorPosition(row, next));
    }
  };

  return (
    <div
      className="front-editor"
      tabIndex="0"
      onKeyDown={createKeydownCallback(dispatch, state, shortcutPatterns)}
      onMouseLeave={() => {
        setStartSelection(false);
      }}
      onBlur={() => {
        setStartSelection(false);
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
              const next = calculCursorIndex(line, e.clientX);
              if (row !== focusedRow || next !== index) {
                dispatch(actions.setCursorPosition(row, next));
                dispatch(actions.setSelection({ start: { row, index: next } }));
              }
            }}
            onMouseUp={e => {
              setStartSelection(false);
              callbackCursorPos(line, row)(e);
            }}
            onMouseMove={e => {
              if (startSelection) {
                const next = calculCursorIndex(line, e.clientX);
                dispatch(
                  actions.setSelection({
                    ...selection,
                    stop: { row, index: next }
                  })
                );
              }
            }}
          >
            {null}
          </LineEl>
        ))}
      </div>
    </div>
  );
};

/* */
const calculCursorIndex = (line, clientX) => {
  const token = line.tokens.find(token => {
    const { left, width } = token.dom.rect;
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
  const chasse = token.dom.rect.width / token.value.length;
  const curX = clientX - token.dom.rect.left;
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
    const { width, height, top, left } = line.dom.rect;
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

  return null; //<span>{children}</span>;
};

export const Row = ({ line, mx, my, children, onMouseUp, onMouseDown }) => {
  const { rectLine } = line;
  const [{ width, height, top, left }, setSize] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  });
  useEffect(() => {
    if (rectLine) {
      setSize({ ...rectLine });
    }
  }, [rectLine]);

  return (
    <div
      className="row"
      style={{
        position: "absolute",
        width: `${width}px`,
        height: `${height}px`,
        top: `${top - my}px`,
        left: `${left - mx}px`
      }}
      onMouseEnter={e => {}}
      onMouseDown={onMouseDown ? onMouseDown : e => {}}
      onMouseMove={e => {}}
      onMouseUp={onMouseUp ? onMouseUp : e => {}}
    >
      {children}
    </div>
  );
};

export default FrontEditor;

/* */
// const onBlurCallback = dispatch => e => {
//   e.stopPropagation();
//   e.preventDefault();
//   dispatch(actions.exitEditor());
// };
