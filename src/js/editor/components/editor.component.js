import React, { useContext, useEffect, useRef } from "react";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Overlay from "./overlay.component";
import * as actions from "./../editor.actions";
import FrontEditor from "./front-editor.component";

const Editor = ({ parse }) => {
  const editorEl = useRef();
  const state = useContext(EditorContext);
  const { lines, focusedRow, index, dispatch } = state;

  useEffect(() => {
    const code = lines.reduce(
      (a, { value }) => (value.length > 0 ? `${a}${value}\n` : a),
      ""
    );
    const { errors } = parse(code);

    dispatch(actions.updateErrors(errors));
  }, [lines, parse, dispatch]);

  return (
    <div className="editor-container">
      <div ref={editorEl} className="editor">
        {lines.map(({ tokens, value }, i) => (
          <Line
            key={`${i}-${value}`}
            tokens={tokens}
            length={value.length}
            row={i}
            index={index}
            focused={focusedRow === i}
          />
        ))}
      </div>
      <FrontEditor lines={lines} />
      <Overlay lines={lines} el={editorEl} />
    </div>
  );
};

export default Editor;
