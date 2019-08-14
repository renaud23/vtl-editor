import React, { useContext } from "react";
import { EditorContext } from "./editor-panel.component";
import * as actions from "./../editor.actions";

const ScrollUpDown = ({ parentEl }) => {
  const state = useContext(EditorContext);
  const { lines, scrollRange, selection, index, focusedRow, dispatch } = state;

  if (parentEl) {
    const dragger = parentEl && lines.length > scrollRange.offset;
    const { height, top } = parentEl.getBoundingClientRect();
    const dgHeight = Math.max((scrollRange.offset / lines.length) * height, 10);
    const dgStart = (scrollRange.start / lines.length) * height;
    return (
      <div
        className="scroll-up-down"
        style={{ height }}
        onClick={e => {
          e.stopPropagation();
          if (dragger) {
            const clickPosition =
              e.clientY - top + window.scrollY - window.scrollY;
            const percent = clickPosition / height;
            const sr = computeScrollrange(state)(percent);
            dispatch(actions.setScrollrange(sr));
          }
        }}
      >
        {dragger ? (
          <span
            className="dragger"
            style={{ height: dgHeight, top: dgStart }}
          />
        ) : null}
        {selection ? (
          <Selection
            {...selection}
            parentHeight={height}
            nbLines={lines.length}
          />
        ) : null}
        {index >= 0 && focusedRow >= 0 ? (
          <Cursor
            focusedRow={focusedRow}
            nbLines={lines.length}
            parentHeight={height}
          />
        ) : null}
      </div>
    );
  }

  return null;
};

const Selection = ({ start, stop, parentHeight, nbLines }) => {
  const top = Math.round((start.row / nbLines) * parentHeight);
  const height = Math.round(((stop.row - start.row) / nbLines) * parentHeight);
  return <span className="selection" style={{ top, height }} />;
};

const Cursor = ({ focusedRow, parentHeight, nbLines }) => {
  const top = Math.round((focusedRow / nbLines) * parentHeight);
  return <span className="cursor" style={{ top }} />;
};

const computeScrollrange = ({ scrollRange: sr, lines }) => percent => {
  const start = Math.min(
    Math.round(lines.length * percent),
    lines.length - sr.offset
  );
  return {
    ...sr,
    start,
    stop: Math.min(start + sr.offset + 1, lines.length - 1)
  };
};

export default ScrollUpDown;
