import React, { useContext, useState, useEffect } from "react";
import { EditorContext } from "./editor-panel.component";
import * as actions from "./../editor.actions";

const ScrollUpDown = ({ parentEl }) => {
  const state = useContext(EditorContext);
  const { lines, scrollRange, selection, index, focusedRow, dispatch } = state;

  window.addEventListener("scroll", e => {
    // TODO something
  });

  if (parentEl) {
    const dragger = parentEl && lines.length > scrollRange.offset;
    const { height, top } = parentEl.getBoundingClientRect();

    return (
      <div
        className="scroll-up-down"
        style={{ height }}
        onMouseDown={e => {
          e.stopPropagation();
          if (dragger) {
            const clickPosition = e.clientY - top;
            const percent = clickPosition / height;
            const sr = computeScrollrange(state)(percent);
            dispatch(actions.setScrollrange(sr));
          }
        }}
        onMouseUp={e => e.stopPropagation()}
      >
        {dragger ? <Dragguer height={height} parentEl={parentEl} /> : null}
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
/* */
const Dragguer = ({ height, parentEl }) => {
  const state = useContext(EditorContext);
  const { lines, scrollRange, dispatch } = state;

  const [offsetY, setOffsetY] = useState(0);
  const [drag, setDrag] = useState(false);
  const [dgHeight, setDgHeight] = useState(0);
  const [dgTop, setDgTop] = useState(0);

  useEffect(() => {
    setDgHeight(Math.max((scrollRange.offset / lines.length) * height, 5));
  }, [scrollRange.offset, lines.length, height]);

  useEffect(() => {
    setDgTop((scrollRange.start / lines.length) * height);
  }, [scrollRange.start, lines.length, height]);

  useEffect(() => {
    if (drag) {
      const dragEvent = e => {
        const varY = (e.clientY - offsetY) / height;
        const varLines = Math.round(lines.length * varY);
        const ps = scrollRange.start + varLines;
        const start =
          varLines > 0
            ? Math.min(ps, lines.length - scrollRange.offset - 1)
            : Math.max(ps, 0);
        const stop =
          varLines > 0
            ? Math.min(start + scrollRange.offset - 1, lines.length - 1)
            : Math.max(start + scrollRange.offset - 1, 0);
        setOffsetY(e.clientY);
        console.log(varLines);
        dispatch(actions.setScrollrange({ ...scrollRange, start, stop }));
      };
      const upEvent = e => {
        setDrag(false);
        document.removeEventListener("mousemove", dragEvent);
      };
      document.addEventListener("mousemove", dragEvent);
      document.addEventListener("mouseup", upEvent);
      return () => {
        document.removeEventListener("mousemove", dragEvent);
        document.removeEventListener("mouseup", upEvent);
      };
    }
  }, [drag, scrollRange, dgTop, lines.length, offsetY, height, dispatch]);

  return (
    <span
      className="dragger"
      style={{ height: dgHeight, top: dgTop }}
      onMouseDown={e => {
        e.stopPropagation();
        setOffsetY(e.clientY);
        setDrag(true);
      }}
      onMouseUp={e => {
        e.stopPropagation();
        setOffsetY(0);
        setDrag(false);
      }}
    />
  );
};

/* */
const Selection = ({ start, stop, parentHeight, nbLines }) => {
  const top = Math.round((start.row / nbLines) * parentHeight);
  const height = Math.round(((stop.row - start.row) / nbLines) * parentHeight);
  return <span className="selection" style={{ top, height }} />;
};

/* */
const Cursor = ({ focusedRow, parentHeight, nbLines }) => {
  const top = Math.round((focusedRow / nbLines) * parentHeight);
  return <span className="cursor-selection" style={{ top }} />;
};

/* */
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
