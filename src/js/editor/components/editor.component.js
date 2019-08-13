import React, { useContext, useEffect, useRef } from "react";
import { EditorContext } from "./editor-panel.component";
import Line from "./line.component";
import Overlay from "./overlay.component";
import * as actions from "./../editor.actions";

const Editor = ({ parse }) => {
  const editorEl = useRef();
  const state = useContext(EditorContext);
  const { lines, dom, dispatch, scrollRange } = state;

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
    if (editorEl.current && dom.lines.length > 0) {
      dispatch(
        actions.setScrollrange(
          computeScrollRange(editorEl.current, dom.lines, lines.length)
        )
      );
    }
  }, [editorEl, dom.lines.length, dom.lines, lines, dispatch]);

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

const computeScrollRange = (parentEl, linesEl, nbLines) => {
  if (parentEl && linesEl.length > 0) {
    const { height: lineHeight } = linesEl[0].getBoundingClientRect();
    const { height: containerHeight } = parentEl.getBoundingClientRect();
    const nbRows = Math.min(Math.round(containerHeight / lineHeight), nbLines);
    return { start: 0, stop: nbRows - 1, offset: nbRows };
  }
  return { start: 0, stop: 0, offset: 0 };
};

export default Editor;
