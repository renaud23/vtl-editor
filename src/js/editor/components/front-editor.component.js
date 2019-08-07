import React, { useContext, useRef, useState, useEffect } from "react";
import KEY from "../key-bind";
import { EditorContext } from "./editor-panel.component";
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
      onKeyDown={compose(
        dispatch,
        state,
        shortcutPatterns
      )(
        keydowShorcutCallback,
        keyDownWithSelection,
        keyDownsuggesterProxy,
        keyDownCallback
      )}
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

/* */
const Token = ({ token, row, mx }) => {
  const { dispatch, index, focusedRow } = useContext(EditorContext);
  const [{ width, height, left }, setPosition] = useState({});
  const spanEl = useRef(null);
  const [chasse, setChasse] = useState(undefined);
  useEffect(() => {
    if (token.tokenEl) {
      const r = token.tokenEl.getBoundingClientRect();
      setPosition({
        width: r.width,
        height: r.height,
        top: r.top,
        left: r.left
      });
      setChasse(Math.round(r.width / token.value.length));
    }
  }, [token, token.tokenEl]);
  const start = token.start;
  const setCursorPosition = e => {
    e.stopPropagation();
    e.preventDefault();
    const posX = Math.round(e.clientX - left);
    const pos = Math.round(posX / chasse);
    const newIndex = pos + start;

    if (index !== newIndex || row !== focusedRow) {
      dispatch(actions.setCursorPosition(row, newIndex));
    }
  };

  return (
    <span
      ref={spanEl}
      style={{
        display: "inline-block",
        width: `${width}px`,
        height: `${height}px`
      }}
      onMouseDown={setCursorPosition}
      onMouseUp={setCursorPosition}
    />
  );
};

export default FrontEditor;

/* */
const compose = (...opts) => (...callbacks) =>
  callbacks.reverse().reduce(
    (a, call) => e => {
      if (!call(...opts)(e)) a(e);
    },
    e => false
  );

/* */
const keyDownsuggesterProxy = (dispatch, state, shortcutPattern) => e => {
  console.debug("%ckeyDownsuggesterProxy", "color: gold;");
  const { open, index } = state.suggesterState;
  if (open) {
    switch (e.key) {
      case KEY.ARROW_UP:
        stopAndPrevent(e);
        dispatch(actions.previousSuggestion());
        return true;
      case KEY.ARROW_DOWN:
        stopAndPrevent(e);
        dispatch(actions.nextSuggestion());
        return true;
      case KEY.ENTER:
        if (index > -1) {
          stopAndPrevent(e);
          dispatch(actions.suggestToken(state.suggesterState.value));
          return true;
        }
        return false;
      default:
        dispatch(actions.resetSuggesterIndex());
        return false;
    }
  }
  return false;
};

/* */
const keyDownCallback = (dispatch, state, shortcutPattern) => e => {
  console.debug("%ckeyDownCallback", "color: gold;");
  if (KEY.isUnbindedKey(e.key)) return false;
  switch (e.key) {
    case KEY.ARROW_UP:
    case KEY.ARROW_DOWN:
      stopAndPrevent(e);
      dispatch({ type: e.key });
      dispatch(actions.checkIndex());
      dispatch(actions.resetPrefix());
      return true;
    case KEY.DELETE:
    case KEY.ENTER:
    case KEY.BACK_SPACE:
      stopAndPrevent(e);
      dispatch({ type: e.key });
      dispatch(actions.checkPrefix());
      return true;
    case KEY.PAGE_UP:
    case KEY.PAGE_DOWN:
    case KEY.TAB:
    case KEY.HOME:
    case KEY.END:
    case KEY.CONTEXT_MENU:
    case KEY.ARROW_LEFT:
    case KEY.ARROW_RIGHT:
      stopAndPrevent(e);
      dispatch({ type: e.key });
      dispatch(actions.resetPrefix());
      return true;
    default:
      if (isCharCode(e.key)) {
        dispatch(actions.insertCharacter(e.key));
        dispatch(actions.checkPrefix());
        return true;
      }
      return false;
  }
};

/* */
const keyDownWithSelection = (dispatch, state, shortcutPatterns) => e => {
  console.debug("%ckeyDownWithSelection", "color: gold;");
  if (isSelection(state.selection)) {
    switch (e.key) {
      case KEY.DELETE:
      case KEY.ENTER:
      case KEY.BACK_SPACE:
        stopAndPrevent(e);
        dispatch(actions.deleteSelection());
        return true;
      default:
        return false;
    }
  }

  return false;
};

/* */
const keydowShorcutCallback = (dispatch, state, shortcutPatterns) => e => {
  console.debug("%ckeydowShorcutCallback", "color: gold;");
  const { altKey, shiftKey, ctrlKey, key } = e;
  if (ctrlKey || altKey || shiftKey) {
    if (key !== KEY.ALT && key !== KEY.SHIFT && key !== KEY.CONTROL) {
      stopAndPrevent(e);
      return shortcutPatterns
        .get({ altKey, shiftKey, ctrlKey, key })
        .execute(dispatch, state);
    }
  }
  return false;
};

/* */
const stopAndPrevent = e => {
  e.stopPropagation();
  e.preventDefault();
};

/* */
const isCharCode = c => true; //c && /[\w!@#$%^&*(),.?":{}|<>].{1}/g.test(c);

/* */
// const onBlurCallback = dispatch => e => {
//   e.stopPropagation();
//   e.preventDefault();
//   dispatch(actions.exitEditor());
// };

/* */
const isSelection = selection => selection && selection.extentOffset;

/* */
