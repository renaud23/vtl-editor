import React, { useRef, useEffect } from "react";
import createEditor from "./editor.js";
import "./editor.scss";

// content={content}
// dictionnary={dictionnary}
// getTokens={getTokens}
// parse={parse}
// edit={true}
// shortcuts={shortcuts}
// handleChange={editor => {
// setErrors(editor.errors);
// }}

const Editor = ({ content, getTokens }) => {
  const el = useRef(null);
  useEffect(() => {
    if (el.current) {
      createEditor({ content, getTokens })(el.current);
    }
  }, [el, content, getTokens]);
  return <div className="panel-editor" ref={el} />;
};

export default Editor;
