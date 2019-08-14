import React, { useContext } from "react";
import { EditorContext } from "./editor-panel.component";

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

export default ScrollUpDown;
