import React, { useContext, useRef, useState, useEffect } from "react";
import KEY from "../key-bind";
import { EditorContext } from "./editor-panel.component";
import * as actions from "../editor.actions";

const FrontEditor = () => {
  const state = useContext(EditorContext);
  // const [effectiveSel, setEffectiveSel] = useState(undefined);
  const { lines, dispatch, handleChange, errors, shortcutPatterns } = state;

  useEffect(() => {
    handleChange({ lines, errors });
  }, [lines, errors, handleChange]);
  const divEl = useRef(null);
  // const [start, setStart] = useState(false);
  const [{ top, left }, setPosition] = useState({});

  useEffect(() => {
    const rect = divEl.current.getBoundingClientRect();
    setPosition({ top: rect.top, left: rect.left });
  }, [divEl, setPosition]);
  return (
    <div
      className="front-editor"
      ref={divEl}
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
      onMouseDown={e => {
        divEl.current.focus();
      }}
    >
      <div className="overlay-container" style={{ position: "relative" }}>
        {lines.map((line, row) => (
          <Row line={line} key={row} mx={left} my={top} row={row}>
            {line.tokens.map((token, i) => {
              return <Token token={token} key={i} row={row} mx={left} />;
            })}
          </Row>
        ))}
      </div>
    </div>
  );
};

export const Row = ({ line, mx, my, children }) => {
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
      onMouseDown={e => {}}
      onMouseMove={e => {}}
      onMouseUp={e => {}}
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
