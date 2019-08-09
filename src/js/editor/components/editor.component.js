import React, { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Overlay from "./overlay.component";
import * as actions from "./../editor.actions";
import FrontEditor from "./front-editor.component";

const Editor = ({ parse }) => {
  const editorEl = useRef();
  const state = useContext(EditorContext);
  const { lines, focusedRow, index, dispatch, scrollRange } = state;

  useEffect(() => {
    const code = lines.reduce(
      (a, { value }) => (value.length > 0 ? `${a}${value}\n` : a),
      ""
    );
    const { errors } = parse(code);

    dispatch(actions.updateErrors(errors));
  }, [lines, parse, dispatch]);

  const [visiblesLines, setVisiblesLines] = useState([]);
  useEffect(() => {
    setVisiblesLines(
      lines.reduce(
        (a, line, i) =>
          i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
        []
      )
    );
  }, [lines, scrollRange.start, scrollRange.stop]);

  return (
    <div className="editor-container">
      <div ref={editorEl} className="editor">
        {visiblesLines.map(({ tokens, value }, i) => (
          <Line key={`${i}-${value}`} tokens={tokens} row={i} />
        ))}
      </div>
      <ScrollRight parentEl={editorEl.current} />
      <FrontEditor lines={lines} />
      <Overlay lines={lines} el={editorEl} />
    </div>
  );
};

const ScrollRight = ({ parentEl }) => {
  const { lines, scrollRange } = useContext(EditorContext);
  if (parentEl) {
    const offset = scrollRange.stop - scrollRange.start + 1;
    const { height } = parentEl.getBoundingClientRect();
    const ration = offset / lines.length;
    const dgHeight = Math.max(ration * height, 10);
    // const dgStart= ratio
    console.log(dgHeight);
    return (
      <div className="scroll-right" style={{ height }}>
        <span className="dragger" style={{ height: dgHeight }} />
      </div>
    );
  }
  return null;
};

export default Editor;
