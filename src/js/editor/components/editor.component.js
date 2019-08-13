import React, { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Overlay from "./overlay.component";
import * as actions from "./../editor.actions";

const Editor = ({ parse }) => {
  const editorEl = useRef();
  const state = useContext(EditorContext);
  const { lines, dom, dispatch, scrollRange, rowHeight } = state;

  useEffect(() => {
    const code = lines.reduce(
      (a, { value }) => (value.length > 0 ? `${a}${value}\n` : a),
      ""
    );
    const { errors } = parse(code);

    dispatch(actions.updateErrors(errors));
  }, [lines, parse, dispatch]);

  const visiblesLines = lines.reduce(
    (a, line, i) =>
      i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
    []
  );

  useEffect(() => {
    if (editorEl.current) {
      dispatch(
        actions.setScrollrange(computeScrollRange(editorEl.current, rowHeight))
      );
    }
  }, [editorEl, rowHeight, dispatch]);

  return (
    <div className="editor-container">
      <div ref={editorEl} className="editor">
        {visiblesLines.map(({ tokens, value }, i) => (
          <Line key={`${i}-${value}`} tokens={tokens} row={i} />
        ))}
      </div>
      <ScrollUpDown parentEl={editorEl.current} linesEl={dom.lines} />
      {/* <FrontEditor lines={lines} />   */}
      <Overlay lines={lines} el={editorEl} />
    </div>
  );
};

const ScrollUpDown = ({ parentEl }) => {
  const { lines, scrollRange } = useContext(EditorContext);
  if (parentEl && lines.length > scrollRange.offset) {
    const { height } = parentEl.getBoundingClientRect();
    const dgHeight = Math.max((scrollRange.offset / lines.length) * height, 10);
    const dgStart = (scrollRange.start / lines.length) * height;
    return (
      <div className="scroll-up-down" style={{ height }}>
        <span className="dragger" style={{ height: dgHeight, top: dgStart }} />
      </div>
    );
  }
  return null;
};

const computeScrollRange = (parentEl, rowHeight) => {
  const { height } = parentEl.getBoundingClientRect();
  const offset = Math.round(height / rowHeight);
  return { start: 0, stop: offset - 1, offset };
};

export default Editor;
