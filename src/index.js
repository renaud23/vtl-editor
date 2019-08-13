import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { useState } from "react";
import ReactDOM from "react-dom";
import Editor from "./js/editor";
import Console from "./js/console";
import { getTokens, parse } from "./js/vtl-integration";
import * as serviceWorker from "./serviceWorker";
import { LoremIpsum } from "lorem-ipsum";
import { composeShortcuts } from "./js/editor";

import "./app.scss";
import "./vtl-tokens.scss";

/* map order alt|shift|ctrl|key */
const shortcuts = composeShortcuts({
  "ctrl|s": () => {
    console.log("save");
    return true;
  },
  "shift|ctrl|R": () => {
    console.log("Renaud est super balaise !");
    return true;
  }
});

const getWords = () => {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 160,
      min: 50
    }
  });

  return Object.keys(
    lorem
      .generateWords(100)
      .split(" ")
      .reduce((a, x) => ({ ...a, [x]: null }), {})
  );
};

const dictionnary = {
  variables: getWords(),
  keywords: ["if", "then", "else"],
  operator: ["=", ">", "<", "+", "-", "*", "/"],
  toto: ["ifff", "kkkk"]
};

const content = [
  'tata := "toto";',
  'if toto = "toto"',
  ' var_1 = "One row more;"',
  ' var_2 = "2 One row more;"',
  ' var_3 = " 3One row more;"',
  ' var_4 = " 4One row more;"',
  "",
  "a;",

  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'row := "11";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;",
  'tata := "toto";',
  'if toto = "toto"',
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;"
];

const App = () => {
  const [errors, setErrors] = useState([]);

  return (
    <div className="workbench">
      <div className="toolbar" />
      <div className="panel">
        <div className="workbench-nav" />
        <div className="workbench-editor">
          <div className="workbench-display">
            <Editor
              content={content}
              dictionnary={dictionnary}
              getTokens={getTokens}
              parse={parse}
              edit={true}
              shortcuts={shortcuts}
              handleChange={editor => {
                setErrors(editor.errors);
              }}
            />
          </div>
          <div className="workbench-console">
            <Console errors={errors} />
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
