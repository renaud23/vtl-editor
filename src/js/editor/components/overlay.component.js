import React, { useContext } from "react";
import { LineEl } from "./front-editor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = () => {
  const { lines } = useContext(EditorContext);
  return (
    <div className="overlay">
      <div style={{ positon: "relative" }}>
        {lines.map((line, row) => (
          <LineEl key={row} line={line}>
            <Line
              tokens={line.tokens}
              row={row}
              left={line.dom ? line.dom.rect.left : 0}
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
    row === selection.start.row ? (
      <Anchor tokens={tokens} index={selection.start.index} left={left} />
    ) : row === selection.stop.row ? (
      <Extent />
    ) : (
      <Full tokens={tokens} />
    )
  ) : null;
};

const Full = ({ tokens }) => {
  if (tokens.length > 0) {
    const r = tokens.reduce(
      ({ width }, token) => {
        return { width: Math.round(width + token.dom.rect.width) };
      },
      { width: 0 }
    );

    return (
      <span
        className="selection"
        style={{
          width: r.width
        }}
      />
    );
  }
  return null;
};

const Anchor = ({ tokens, index, left }) => {
  if (tokens.length > 0) {
    const token = getToken(index)(tokens);
    const pos = token && token.dom ? getCursorPos(token, index) : 0;
    const width = tokens.reduce((a, t) => a + t.dom.rect.width, 0);
    console.log(width);
    return [
      <span
        key={0}
        style={{
          width: pos - left,
          height: "100%",
          display: "inline-block"
        }}
      />,
      <span
        className="selection"
        style={{ width: pos + width - left }}
        key={1}
      />
    ];
  }
  return null;
};

const Extent = () => {
  return <span />;
};

// const Normal = ({ row, focusedRow, index, tokens, left }) => {
//   if (row === focusedRow) {
//     const token = getToken(index)(tokens);
//     const pos = token && token.dom ? getCursorPos(token, index) : 0;
//     return [
//       <span
//         key={0}
//         style={{
//           width: pos - left,
//           height: "100%",
//           display: "inline-block"
//         }}
//       />,
//       <span className="cursor" key={1} />
//     ];
//   }

//   return null;
// };

const isCursorToken = () => false;

const isSelectedLine = (selection, row) =>
  selection && selection.start && selection.stop
    ? row >= selection.start.row && row <= selection.stop.row
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
  const chasse = token.dom.rect.width / token.value.length;
  const curX = Math.round(token.dom.rect.left + (index - token.start) * chasse);
  return curX;
};

export default Overlay;
