import React, { useContext } from "react";
import classnames from "classnames";
import { EditorContext } from "./editor-panel.component";

const RowNumbers = () => {
  const { lines, focusedRow } = useContext(EditorContext);
  return (
    <div className="row-numbers">
      <div className="row-numbers-container">
        {lines.map((l, i) => (
          <div className="row" key={i}>
            <span className={classnames("num", { focused: i === focusedRow })}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RowNumbers;
