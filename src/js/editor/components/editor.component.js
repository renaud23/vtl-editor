import React, { useContext, useEffect, createRef } from "react";
import KEY from "../key-bind";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Selector from "./selector.component";
import * as actions from "../editor.actions";

const Editor = ({ parse }) => {
  const editorEl = createRef();
  const state = useContext(EditorContext);
  const { lines, focusedRow, index, dispatch } = state;

  useEffect(() => {
    const code = lines.reduce(
      (a, { value }) => (value.length > 0 ? `${a}${value}\n` : a),
      ""
    );
    const { errors, dico } = parse(code);

    dispatch(actions.updateErrors(errors));
  }, [lines, parse, dispatch]);

  useEffect(() => {
    editorEl.current.addEventListener(
      "onEditorMouseDown",
      e => {
        e.stopImmediatePropagation();
        suggesterKeyDownProxy(keyDownCallback)(dispatch, state)(e.detail);
      },
      false
    );
  }, [editorEl, dispatch, state]);
  // onKeyDown={e => null}
  // onMouseDown={onMouseDownCallback(dispatch, state)}
  // onBlur={onBlurCallback(dispatch, state)}
  return (
    <div className="panel-editor">
      <div ref={editorEl} className="editor">
        {lines.map(({ tokens, value }, i) => (
          <Line
            key={`${i}-line`}
            tokens={tokens}
            length={value.length}
            number={i}
            index={index}
            focused={focusedRow === i}
          />
        ))}
      </div>
      <Selector lines={lines} el={editorEl} />
    </div>
  );
};

/* */
const suggesterKeyDownProxy = callback => (dispatch, state) => {
  if (!state.edit) return;
  const callee = callback(dispatch, state);

  return e => {
    const { open, index } = state.suggesterState;
    if (open) {
      switch (e.key) {
        case KEY.ARROW_UP:
          dispatch(actions.previousSuggestion());
          return false;
        case KEY.ARROW_DOWN:
          dispatch(actions.nextSuggestion());
          return false;
        case KEY.ENTER:
          if (index > -1) {
            dispatch(actions.suggestToken(state.suggesterState.value));
            return false;
          }
          return callee(e);
        default:
          dispatch(actions.resetSuggesterIndex());
          return callee(e);
      }
    }
    return callee(e);
  };
};

/* */
const keyDownCallback = (dispatch, state) => e => {
  if (KEY.isUnbindedKey(e.key)) return;
  e.stopPropagation();
  e.preventDefault();
  const { key } = e;
  switch (key) {
    case KEY.ARROW_UP:
    case KEY.ARROW_DOWN:
      dispatch({ type: key });
      dispatch(actions.checkIndex());
      dispatch(actions.resetPrefix());
      break;
    case KEY.DELETE:
    case KEY.ENTER:
    case KEY.BACK_SPACE:
      if (isSelection()) {
        break;
      }
      dispatch({ type: key });
      dispatch(actions.checkPrefix());
      break;
    case KEY.PAGE_UP:
    case KEY.PAGE_DOWN:
    case KEY.TAB:
    case KEY.HOME:
    case KEY.END:
    case KEY.CONTEXT_MENU:
    case KEY.ARROW_LEFT:
    case KEY.ARROW_RIGHT:
      dispatch({ type: key });
      dispatch(actions.resetPrefix());
      break;
    default:
      if (isCharCode(key)) {
        dispatch(actions.insertCharacter(key));
        dispatch(actions.checkPrefix());
      }
      break;
  }
};

const isCharCode = c => true; //c && /[\w!@#$%^&*(),.?":{}|<>].{1}/g.test(c);

/* */
const onBlurCallback = dispatch => e => {
  e.stopPropagation();
  e.preventDefault();
  dispatch(actions.exitEditor());
};

/* */
const onMouseDownCallback = (dispatch, state) => e => {
  const { prefix } = state;
  if (prefix) dispatch(actions.resetPrefix());
};

/* */
const isSelection = () => {
  const {
    anchorOffset,
    focusOffset,
    anchorNode,
    focusNode
  } = window.getSelection();
  return (
    (focusNode && !focusNode.isEqualNode(anchorNode)) ||
    anchorOffset !== focusOffset
  );
};

/* */

export default Editor;
