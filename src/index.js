import React from "react";
import ReactDOM from "react-dom";
import Editor from "./js/editor";
import { getTokens } from "./js/parser-vtl";
import * as serviceWorker from "./serviceWorker";

// const content = ["if (a>0) ", "\tthen 'positive'", "\telse 'negative'"];
const content = ["var1=895+6", "toto_2=7", "last=var1+toto_2"];
const dico = { variables: ["toto", "var_1", "TATA", "TITI", "var_2", "titi"] };

ReactDOM.render(
  <Editor content={content} dictionnary={dico} getTokens={getTokens} />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
