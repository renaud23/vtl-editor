import React, { useContext, useEffect, useState } from "react";
import { LineEl } from "./front-editor.component";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines, dom, scrollRange } = useContext(EditorContext);
  const visiblesLines = lines.reduce(
    (a, line, i) =>
      i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
    []
  );
  return (
    <div className="overlay">
      <div style={{ positon: "relative" }}>
        {visiblesLines.map((line, i) => {
          const row = i + scrollRange.start;
          return (
            <LineEl key={`${row}-${line.value}`} el={dom.lines[i]}>
              <Line
                line={line}
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

const SingleSelectionRow = ({ tokensEl, tokens, start, stop, index, left }) => {
  if (tokens.length > 0) {
    const stt = getToken(start)(tokens);
    const startPos =
      stt.idx && tokensEl[stt.idx]
        ? getCursorPos(tokensEl[stt.idx], stt.token, start)
        : undefined;
    const spt = getToken(stop)(tokens);
    const stopPos =
      spt.idx && tokensEl[spt.idx]
        ? getCursorPos(tokensEl[spt.idx], spt.token, stop)
        : undefined;
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

const Full = ({ tokensEl, tokens }) => {
  if (tokens.length > 0) {
    const r = tokens.reduce(
      ({ width }, token, idx) => {
        return {
          width: tokensEl[idx]
            ? Math.round(width + tokensEl[idx].getBoundingClientRect().width)
            : undefined
        };
      },
      { width: 0 }
    );

    return r.width !== undefined ? (
      <span
        className="selected"
        style={{
          width: r.width
        }}
      />
    ) : null;
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

const Anchor = ({ tokensEl, tokens, index, left, focused }) => {
  if (tokens.length > 0) {
    const { token, idx } = getToken(index)(tokens);
    const pos =
      idx !== undefined && tokensEl[idx]
        ? getCursorPos(tokensEl[idx], token, index)
        : undefined;
    const width = tokens.reduce(
      (a, t, i) => a + tokensEl[i].getBoundingClientRect().width,
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

const Extent = ({ tokensEl, tokens, index, left, focused }) => {
  if (tokens.length > 0) {
    const { token, idx } = getToken(index)(tokens);
    const pos =
      idx !== undefined && tokensEl[idx]
        ? getCursorPos(tokensEl[idx], token, index)
        : undefined;
    const width = tokens.reduce(
      (a, t, i) => a + tokensEl[i].getBoundingClientRect().width,
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
      idx !== undefined && tokensEl[idx]
        ? getCursorPos(tokensEl[idx], token, index)
        : undefined;

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
  // console.log(index, token, tokens.reduce((a, t) => `${a}|${t.value}`, ""));
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
