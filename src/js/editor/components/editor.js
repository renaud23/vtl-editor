import { createStore } from "redux";
import * as actions from "./../editor.actions";
import reducer from "./../editor.reducer";
import createTokenizer from "./../create-full-tokenizer";

const ROW_HEIGHT = 22;
let DOM_ELEMENTS = { lines: [], tokens: [] };

/* */
const createEditor = ({ content, getTokens }) => elParent => {
  if (typeof getTokens === "function" && Array.isArray(content)) {
    const { el, tokensLayerEL, eventsLayerEl } = createContainer();
    elParent.appendChild(el);
    const getTokensFull = createTokenizer(getTokens);
    // step init
    const store = createStore(reducer(getTokensFull));
    // subscribe
    store.subscribe(() => {
      renderTokenLayer(store)(tokensLayerEL);
      eventsLayerOverlay(store)(eventsLayerEl);
    });

    init(store)(content, tokensLayerEL, eventsLayerEl);

    // render first
    renderTokenLayer(store)(tokensLayerEL, eventsLayerEl);
    prepareEventsLayerEl(store)(eventsLayerEl, ROW_HEIGHT);
  }
  return () => {
    // TODO clean méthode
  };
};

// render

const eventsLayerOverlay = store => layer => {
  const range = document.createRange();
  range.selectNodeContents(layer);
  range.deleteContents();
  console.log("render");
};

const renderTokenLayer = store => tokensLayerEL => {
  const { lines, scrollRange } = store.getState();
  const visiblesLines = lines.reduce(
    (a, line, i) =>
      i >= scrollRange.start && i <= scrollRange.stop ? [...a, line] : a,
    []
  );

  const range = document.createRange();
  range.selectNodeContents(tokensLayerEL);
  range.deleteContents();

  const dom = createTokensLayer(visiblesLines);
  DOM_ELEMENTS = dom;
  dom.lines.forEach(lineEl => {
    tokensLayerEL.appendChild(lineEl);
  });
  return dom;
};

const init = store => content => {
  store.dispatch({
    type: "change-editor-content",
    lines: content
  });
};

const createContainer = lines => {
  const el = document.createElement("div");
  el.className = "editor-container";
  const tokensLayerEL = document.createElement("div");
  tokensLayerEL.className = "tokens-layer";
  el.appendChild(tokensLayerEL);
  const eventsLayerEl = document.createElement("div");
  eventsLayerEl.className = "events-layer";
  eventsLayerEl.setAttribute("tabindex", "0");
  el.appendChild(eventsLayerEl);
  return { el, tokensLayerEL, eventsLayerEl };
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
const prepareEventsLayerEl = store => (layerEl, rowHeight) => {
  const { scrollRange, lines } = store.getState();
  layerEl.addEventListener("mouseup", e => {
    e.stopImmediatePropagation();
    // calcul row
    const { clientX, clientY } = e;
    const rect = layerEl.getBoundingClientRect();
    const screenRow = Math.round((clientY - rect.top) / rowHeight);
    const row =
      screenRow < lines.length + scrollRange.start
        ? screenRow + scrollRange.start
        : undefined;
    // calcul index
    let index = undefined;
    if (row) {
      const dom = DOM_ELEMENTS;
      const line = lines[row];
      const { el, token } = getToken(dom, screenRow, clientX, clientY)(line);

      index = el
        ? getCursorIndex(el, token, clientX)
        : dom.tokens[screenRow].length > 0
        ? line.value.length
        : 0;
    }
    store.dispatch(actions.setCursorPosition(row, index));
  });
  layerEl.addEventListener("mousedown", e => {
    e.stopImmediatePropagation();
  });
  layerEl.addEventListener("mousemove", e => {
    e.stopImmediatePropagation();
  });
  layerEl.addEventListener("keydown", e => {
    console.log("key");
  });

  return {};
};

const getToken = (dom, screenRow, clientX, clientY) => line => {
  const { el, token } = dom.tokens[screenRow].reduce((a, el, i) => {
    const { left, width } = el.getBoundingClientRect();
    return el && clientX >= left && clientX <= left + width
      ? { el, token: line.tokens[i] }
      : a;
  }, {});
  return { el, token };
};

const getCursorIndex = (el, { start, value }, clientX) => {
  const { width, left } = el.getBoundingClientRect();
  const chasse = width / value.length;
  const curX = clientX - left;
  const next = start + Math.round(curX / chasse);
  return next;
};
/* UTILS */

export default createEditor;
