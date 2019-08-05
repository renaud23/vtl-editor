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
  "\tthen true",
  "\t else false;",
  "if titi >=30 then 50 else 60;"
];

const App = () => {
  const [errors, setErrors] = useState([]);

  return (
    <React.Fragment>
      <div>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum
        quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam
        eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
        voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam
        corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
        quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
        voluptas nulla pariatur?
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "50%" }}>
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
        <div style={{ width: "50%" }}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
          aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
          qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui
          dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
          quia non numquam eius modi tempora incidunt ut labore et dolore magnam
          aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
          exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex
          ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in
          ea voluptate velit esse quam nihil molestiae consequatur, vel illum
          qui dolorem eum fugiat quo voluptas nulla pariatur?
        </div>
      </div>

      <Console errors={errors} />
    </React.Fragment>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
