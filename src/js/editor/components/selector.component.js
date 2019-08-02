import React, { createRef, useState, useContext, useEffect } from "react";
import { EditorContext } from "./editor-panel.component";
import * as actions from "../editor.actions";

const Selector = ({ lines, el }) => {
  const { dispatch } = useContext(EditorContext);
  const divEl = createRef();

  const [row, setRow] = useState(undefined);
  const [start, setStart] = useState(false);
  const [selection, setSelection] = useState(undefined);
  return (
    <React.Fragment>
      <div
        ref={divEl}
        tabIndex="0"
        className="selector"
        onClick={() => {
          divEl.current.focus();
          dispatch(
            actions.setCursorPosition(row, window.getSelection().anchorOffset)
          );
        }}
        onKeyDown={e => {
          e.stopPropagation();
          const event = new CustomEvent("onEditorMouseDown", {
            detail: {
              key: e.key,
              stopPropagation: e.stopPropagation,
              preventDefault: e.preventDefault
            }
          });
          el.current.dispatchEvent(event);
        }}
      >
        {lines.map(({ value }, i) => (
          <div
            key={i}
            className="row"
            onMouseEnter={e => {}}
            onMouseDown={e => {
              setRow(i);
              setStart(true);
              setSelection({ anchorRow: i });
            }}
            onMouseMove={e => {
              if (start) {
                const { anchorOffset, extentOffset } = window.getSelection();
                setSelection({
                  ...selection,
                  extentRow: i,
                  anchorOffset,
                  extentOffset
                });
              }
            }}
            onMouseUp={e => {
              setStart(false);
              setRow(i);
            }}
          >
            {value}
          </div>
        ))}
      </div>
      <Selection selection={selection} lines={lines} />
    </React.Fragment>
  );
};

const Selection = ({ lines, selection }) => {
  return (
    <div className="selector-2">
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
};

export default Selector;
