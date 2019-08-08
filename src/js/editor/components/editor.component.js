import React, { useContext, useEffect, createRef } from "react";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Overlay from "./overlay.component";
import * as actions from "./../editor.actions";
import FrontEditor from "./front-editor.component";

const Editor = ({ parse }) => {
  const editorEl = createRef();
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
    <React.Fragment>
      <FrontEditor lines={lines} />
      <Overlay lines={lines} el={editorEl} />
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
    </React.Fragment>
  );
};

export default Editor;
