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

  const callbackCursorPos = (line, row) => e => {
    e.stopPropagation();
    const { clientX } = e;
    const token = line.tokens.find(token => {
      const { left, width } = token.dom.rect;
      return clientX >= left && clientX <= left + width;
    });
    const next = token ? getCursorIndex(token, clientX) : 0;

    if (row !== focusedRow || next !== index) {
      dispatch(actions.setCursorPosition(row, next));
    }
  };

  return (
    <div
      className="front-editor"
      tabIndex="0"
      onKeyDown={createKeydownCallback(dispatch, state, shortcutPatterns)}
    >
      <div style={{ positon: "relative" }}>
        {lines.map((line, row) => (
          <LineEl
            key={row}
            line={line}
            onMouseDown={callbackCursorPos(line, row)}
            onMouseUp={callbackCursorPos(line, row)}
          >
            {null}
          </LineEl>
        ))}
      </div>
    </div>
  );
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
  onMouseUp = () => null
}) => {
  if (line.dom) {
    const { width, height, top, left } = line.dom.rect;
    return (
      <div
        className="row"
        style={{ width, height, top, left, positon: "absolute" }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {children}
      </div>
    );
  }

  return <span>{children}</span>;
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
