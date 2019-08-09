import React, { useContext } from "react";
import { LineEl } from "./front-editor.component";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines } = useContext(EditorContext);
  return (
    <div className="overlay">
      <div style={{ positon: "relative" }}>
        {lines.map((line, row) => (
          <LineEl key={`${row}-${line.value}`} line={line}>
            <Line
              tokens={line.tokens}
              row={row}
              left={line.dom ? line.dom.el.getBoundingClientRect().left : 0}
            />
          </LineEl>
        ))}
      </div>
    </div>
  );
};

const Line = ({ tokens, row, left }) => {
  const { index, focusedRow, selection } = useContext(EditorContext);
  return isSelectedLine(selection, row) ? (
    row === selection.start.row && row === selection.stop.row ? (
      <SingleSelectionRow
        tokens={tokens}
        index={index}
        start={selection.start.index}
        stop={selection.stop.index}
        left={left}
      />
    ) : row === selection.start.row ? (
      <Anchor
        tokens={tokens}
        index={selection.start.index}
        left={left}
        focused={row === focusedRow}
      />
    ) : row === selection.stop.row ? (
      <Extent
        tokens={tokens}
        index={selection.stop.index}
        left={left}
        focused={row === focusedRow}
      />
    ) : (
      <Full tokens={tokens} />
    )
  ) : (
    <WithOutSelection
      focused={row === focusedRow}
      tokens={tokens}
      index={index}
      left={left}
    />
  );
};

const SingleSelectionRow = ({ tokens, start, stop, index, left }) => {
  if (tokens.length > 0) {
    const stt = getToken(start)(tokens);
    const startPos = stt && stt.dom ? getCursorPos(stt, start) : 0;
    const spt = getToken(stop)(tokens);
    const stopPos = spt && spt.dom ? getCursorPos(spt, stop) : 0;
    return [
      <span
        key="start"
        className="unselected"
        style={{
          width: startPos - left
        }}
      />,
      index === start ? <Cursor key="cursor-start" /> : null,
      <span
        key="selected"
        className="selected"
        style={{
          width: stopPos - startPos
        }}
      />,
      index === stop ? <Cursor key="cursor-stop" /> : null
    ];
  }

  return null;
};

const Full = ({ tokens }) => {
  if (tokens.length > 0) {
    const r = tokens.reduce(
      ({ width }, token) => {
        return {
          width: Math.round(width + token.dom.el.getBoundingClientRect().width)
        };
      },
      { width: 0 }
    );

    return (
      <span
        className="selected"
        style={{
          width: r.width
        }}
      />
    );
  }
  return (
    <span
      className="selected"
      style={{
        width: 5
      }}
    />
  );
};

const Anchor = ({ tokens, index, left, focused }) => {
  if (tokens.length > 0) {
    const token = getToken(index)(tokens);
    const pos = token && token.dom ? getCursorPos(token, index) : 0;
    const width = tokens.reduce(
      (a, t) => a + t.dom.el.getBoundingClientRect().width,
      0
    );
    return [
      <span
        key="start"
        className="unselected"
        style={{
          width: pos - left
        }}
      />,
      focused ? <Cursor key="cursor" /> : null,
      <span
        className="selected"
        style={{ width: width - pos + left }}
        key="selected"
      />
    ];
  }
  return null;
};

const Extent = ({ tokens, index, left, focused }) => {
  if (tokens.length > 0) {
    const token = getToken(index)(tokens);
    const pos = token && token.dom ? getCursorPos(token, index) : 0;
    const width = tokens.reduce(
      (a, t) => a + t.dom.el.getBoundingClientRect().width,
      0
    );
    return [
      <span
        key="start"
        className="selected"
        style={{
          width: pos - left
        }}
      />,
      <span style={{ width: pos + width - left }} key="selected" />,
      focused ? <Cursor key="cursor" /> : null
    ];
  }
  return null;
};

const WithOutSelection = ({ focused, index, tokens, left }) => {
  if (focused) {
    const token = getToken(index)(tokens);
    const pos = token && token.dom ? getCursorPos(token, index) : 0;
    return [
      <span
        key="before"
        style={{
          width: pos - left,
          height: "100%",
          display: "inline-block"
        }}
      />,
      <Cursor key="cursor" />
    ];
  }

  return null;
};

const isSelectedLine = (selection, row) =>
  selection && selection.start && selection.stop
    ? row >= selection.start.row &&
      row <= selection.stop.row &&
      (selection.start.row !== selection.stop.row ||
        selection.start.index !== selection.stop.index)
    : false;

const getToken = index => tokens => {
  const token = tokens.find(
    ({ start, stop }) => index >= start && index <= stop
  );

  return token
    ? token
    : tokens.length > 0
    ? tokens[tokens.length - 1]
    : undefined;
};
const getCursorPos = (token, index) => {
  const { width, left } = token.dom.el.getBoundingClientRect();
  const chasse = width / token.value.length;
  const curX = Math.round(left + (index - token.start) * chasse);
  return curX;
};

export default Overlay;
