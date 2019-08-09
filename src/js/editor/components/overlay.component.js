import React, { useContext, useEffect, useState } from "react";
import { LineEl } from "./front-editor.component";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines, dom, scrollRange } = useContext(EditorContext);
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
    <div className="overlay">
      <div style={{ positon: "relative" }}>
        {visiblesLines.map((line, i) => {
          const row = i + scrollRange.start;
          return (
            <LineEl key={`${row}-${line.value}`} el={dom.lines[i]}>
              <Line
                tokens={line.tokens}
                tokensEl={dom.tokens[i]}
                row={row}
                left={
                  dom.lines[i] ? dom.lines[i].getBoundingClientRect().left : 0
                }
              />
            </LineEl>
          );
        })}
      </div>
    </div>
  );
};

const Line = ({ tokensEl, tokens, row, left }) => {
  const { index, focusedRow, selection } = useContext(EditorContext);
  return isSelectedLine(selection, row) ? (
    row === selection.start.row && row === selection.stop.row ? (
      <SingleSelectionRow
        tokensEl={tokensEl}
        tokens={tokens}
        index={index}
        start={selection.start.index}
        stop={selection.stop.index}
        left={left}
      />
    ) : row === selection.start.row ? (
      <Anchor
        tokensEl={tokensEl}
        tokens={tokens}
        index={selection.start.index}
        left={left}
        focused={row === focusedRow}
      />
    ) : row === selection.stop.row ? (
      <Extent
        tokensEl={tokensEl}
        tokens={tokens}
        index={selection.stop.index}
        left={left}
        focused={row === focusedRow}
      />
    ) : (
      <Full tokens={tokens} tokensEl={tokensEl} />
    )
  ) : (
    <WithOutSelection
      tokensEl={tokensEl}
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
    const { token, idx } = getToken(index)(tokens);
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
    const { token, idx } = getToken(index)(tokens);
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

const WithOutSelection = ({ tokensEl, focused, index, tokens, left }) => {
  if (focused) {
    const { token, idx } = getToken(index)(tokens);
    const pos =
      idx !== undefined && tokensEl
        ? getCursorPos(tokensEl[idx], token, index)
        : 0;
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
  const { token, idx } = tokens.reduce(
    ({ token, idx }, tk, i) =>
      index >= tk.start && index <= tk.stop
        ? { token: tk, idx: i }
        : { token, idx },
    { token: undefined, idx: undefined }
  );

  return token
    ? { token, idx }
    : tokens.length > 0
    ? { token: tokens[tokens.length - 1], idx: tokens.length - 1 }
    : { tokens, idx };
};
const getCursorPos = (el, token, index) => {
  const { width, left } = el.getBoundingClientRect();
  const chasse = width / token.value.length;
  const curX = Math.round(left + (index - token.start) * chasse);
  return curX;
};

export default Overlay;
