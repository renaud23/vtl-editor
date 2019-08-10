import { createStore } from "redux";
import * as actions from "./../editor.actions";
import reducer from "./../editor.reducer";
import createTokenizer from "./../create-full-tokenizer";

/* */
const createEditor = ({ content, getTokens }) => elParent => {
  if (typeof getTokens === "function" && Array.isArray(content)) {
    const { el, editorEl, eventsLayerEl } = createContainer();
    elParent.appendChild(el);
    const getTokensFull = createTokenizer(getTokens);
    // step init
    const store = createStore(reducer(getTokensFull));
    // subscribe
    store.subscribe(() => {
      //
      //   console.log(store.getState());
    });

    init(store)(content, editorEl, eventsLayerEl);

    // render step
    render(store)(editorEl, eventsLayerEl);
  }
  return () => {
    // TODO clean méthode
  };
};

// render brutal
const render = store => (editorEl, eventsLayerEl) => {
  const { lines, scrollRange } = store.getState();
  const visiblesLines = lines.reduce(
    (a, line, i) =>
      i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
    []
  );

  editorEl.innerHtml = null;
  eventsLayerEl.innerHtml = null;
  const dom = createTokensLayer(visiblesLines);
  dom.lines.forEach(lineEl => {
    editorEl.appendChild(lineEl);
  });

  const eventsLayerRows = createEventsLayer(dom)(store);
  eventsLayerRows.forEach(lineEl => eventsLayerEl.appendChild(lineEl));
};

export default createEditor;

const init = store => content => {
  store.dispatch({
    type: "change-editor-content",
    lines: content
  });
};

const createContainer = lines => {
  const el = document.createElement("div");
  el.className = "editor-container";
  const editorEl = document.createElement("div");
  editorEl.className = "tokens-layer";
  el.appendChild(editorEl);
  const eventsLayerEl = document.createElement("div");
  eventsLayerEl.className = "events-layer";
  el.appendChild(eventsLayerEl);
  return { el, editorEl, eventsLayerEl };
};

/* TOKEN LAYER */
const createTokensLayer = lines => {
  const dom = lines
    .map(line => createLineEl(line))
    .reduce(
      ({ lines, tokens }, { tokensEl, lineEl }) => ({
        lines: [...lines, lineEl],
        tokens: [...tokens, tokensEl]
      }),
      {
        lines: [],
        tokens: []
      }
    );
  return dom;
};
const createLineEl = line => {
  const tokensEl = line.tokens.map(token => createTokenEl(token));
  const lineEl = document.createElement("div");
  lineEl.className = "row";
  tokensEl.forEach(tokenEl => lineEl.appendChild(tokenEl));
  return { tokensEl, lineEl };
};
const createTokenEl = ({ value, className }) => {
  const spanEl = document.createElement("span");
  spanEl.appendChild(document.createTextNode(value));
  spanEl.className = className;

  return spanEl;
};

/* On verra plus tard */
const computeScrollRange = (parentEl, linesEl, nbLines) => {
  if (parentEl && linesEl.length > 0) {
    const { height: lineHeight } = linesEl[0].getBoundingClientRect();
    const { height: containerHeight } = parentEl.getBoundingClientRect();
    const nbRows = Math.min(Math.round(containerHeight / lineHeight), nbLines);
    return { start: 0, stop: nbRows - 1, offset: nbRows };
  }
  return { start: 0, stop: 0, offset: 0 };
};

/* EVENTS LAYER */
const createEventsLayer = dom => store => {
  const { dispatch, scrollRange } = store.getState();
  const linesEl = dom.lines.map((el, i) => {
    const rect = el.getBoundingClientRect();
    const rel = document.createElement("div");
    rel.className = "row";
    rel.style.width = `${rect.width}px`;
    rel.style.height = `${rect.height}px`;
    rel.style.left = `${rect.left}px`;
    rel.addEventListener("click", e => {
      e.stopImmediatePropagation();
      console.log("row", i + scrollRange.start);
    });
    return rel;
  });

  return linesEl;
};
