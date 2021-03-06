import React, { useMemo, createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import editorReducer, { initializer } from "../editor.reducer";
import Suggestions from "./sugestions.component";
import Console from "./console.component";
import Editor from "./editor.component";
import createSuggester from "../suggestions-manager";
import createFulTokenizer from "../create-full-tokenizer";
import "./editor.scss";

const EditorPanel = ({
  content = [],
  edit = true,
  getTokens,
  parse,
  dictionnary = {}
}) => {
  const getFullTokens = createFulTokenizer(getTokens);
  const [state, dispatch] = useReducer(
    editorReducer,
    getFullTokens,
    initializer
  );
  const { errors } = state;
  const tokensEl = [];
  useEffect(() => {
    dispatch({
      type: "change-editor-content",
      lines: content
    });
  }, [content]);

  const suggester = useMemo(() => createSuggester(dictionnary), [dictionnary]);
  return (
    <EditorContext.Provider value={{ ...state, edit, tokensEl, dispatch }}>
      <div className="panel-editor">
        <Editor getTokens={getFullTokens} parse={parse} />
        <Suggestions suggest={suggester} />
        <Console errors={errors} />
      </div>
    </EditorContext.Provider>
  );
};

/* */
Editor.proTypes = {
  getTokens: PropTypes.func.isRequired,
  content: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
  dictionnary: PropTypes.shape({
    variables: PropTypes.arrayOf(PropTypes.string)
  })
};

export const TokenContext = createContext({});
export const EditorContext = createContext({});
export default EditorPanel;
