import React, { useContext, useRef } from "react";
import Cursor from "./cursor.component";
import { EditorContext } from "./editor-panel.component";

const Overlay = ({ lines, el }) => {
  const { selection } = useContext(EditorContext);

  return <Selection selection={selection} lines={lines} />;
};

const Selection = ({ lines, selection }) => (
  <div className="editor-overlay">
    {lines.map(({ value }, i) => (
      <div key={i} className="row">
        {selection &&
        selection.extentOffset &&
        i >= selection.anchorRow &&
        i <= selection.extentRow ? (
          i === selection.anchorRow ? (
            [
              <span key={0}>{value.substr(0, selection.anchorOffset)}</span>,

              i === selection.extentRow ? (
                [
                  <span key={1} className="selected">
                    {value.substr(
                      selection.anchorOffset,
                      selection.extentOffset - selection.anchorOffset
                    )}
                  </span>,
                  <span key={2}>{value.substr(selection.extentOffset)}</span>
                ]
              ) : (
                <span key={1} className="selected">
                  {value.substr(selection.anchorOffset)}
                </span>
              )
            ]
          ) : i === selection.extentRow ? (
            [
              <span className="selected" key={0}>
                {value.substr(0, selection.extentOffset)}
              </span>,
              <span key={1}>{value.substr(selection.extentOffset)}</span>
            ]
          ) : (
            <span className="selected">{value}</span>
          )
        ) : (
          <span>{value}</span>
        )}
      </div>
    ))}
  </div>
);

/* */
// const DrawCursor = () => {
//   const { lines } = useContext(EditorContext);

//   return (
//     <div className="editor-overlay">
//       {lines.map((line, i) => (
//         <Row key={i} line={line} numberRow={i} />
//       ))}
//     </div>
//   );
// };

/* */
// const Row = ({ line, numberRow }) => {
//   const divEl = useRef(null);
//   const { x, y } = divEl.current
//     ? divEl.current.getBoundingClientRect()
//     : { x: 0, y: 0 };
//   return (
//     <div ref={divEl} style={{ position: "relative" }}>
//       {line.tokens.map((token, i) => (
//         <Token key={i} token={token} x={x} y={y} numberRow={numberRow} />
//       ))}
//     </div>
//   );
// };

/* */
// const Token = ({ x, y, token, numberRow }) => {
//   const { focusedRow, index } = useContext(EditorContext);
//   if (token.tokenEl) {
//     const r = token.tokenEl.getBoundingClientRect();
//     return (
//       <span
//         style={{
//           backgroundColor: "rgba(100,100,0,0.5)",
//           position: "absolute",
//           top: `${r.top - y}px`,
//           left: `${r.left - x}px`,
//           width: `${r.width}px`,
//           height: `${r.height}px`
//         }}
//       >
//         {numberRow === focusedRow ? <Cursor /> : null}
//       </span>
//     );
//   }
//   return null;
// };

export default Overlay;
