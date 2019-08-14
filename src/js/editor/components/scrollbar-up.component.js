import React, { useContext } from "react";
import { EditorContext } from "./editor-panel.component";

const ScrollUpDown = ({ parentEl }) => {
  const { lines, scrollRange, selection, index, focusedRow } = useContext(
    EditorContext
  );
  if (parentEl && lines.length > scrollRange.offset) {
    const { height } = parentEl.getBoundingClientRect();
    const dgHeight = Math.max((scrollRange.offset / lines.length) * height, 10);
    const dgStart = (scrollRange.start / lines.length) * height;
    return (
      <div className="scroll-up-down" style={{ height }}>
        <span className="dragger" style={{ height: dgHeight, top: dgStart }} />
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

export default ScrollUpDown;
