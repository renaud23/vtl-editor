import React, { createRef, useState, useContext, useEffect } from "react";
import { EditorContext } from "./editor-panel.component";
import * as actions from "../editor.actions";

const Selector = ({ lines, el }) => {
  const divEl = createRef();
  const [index, setIndex] = useState(-1);
  const { dispatch } = useContext(EditorContext);
  const [anchorOffset, setAnchorOffset] = useState(-1);

  useEffect(() => {
    dispatch(actions.setCursorPosition(index, anchorOffset));
  }, [dispatch, index, anchorOffset]);

  return (
    <div
      ref={divEl}
      tabIndex="0"
      className="selector"
      onClick={() => {
        setAnchorOffset(window.getSelection().anchorOffset);
        divEl.current.focus();
      }}
      onKeyUp={e => {
        e.stopPropagation();
        e.preventDefault();
        const event = new CustomEvent("onEditorMouseDown", {
          detail: {
            key: e.key,
            stopPropagation: e.stopPropagation,
            preventDefault: e.preventDefault
          }
        });
        el.current.dispatchEvent(event);
      }}
    >
      {lines.map(({ value }, i) => (
        <div key={i} className="row" onClick={e => setIndex(i)}>
          {value}
        </div>
      ))}
    </div>
  );
};

export default Selector;
