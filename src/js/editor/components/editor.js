import { createStore } from "redux";
import * as actions from "./../editor.actions";
import reducer from "./../editor.reducer";
import createTokenizer from "./../create-full-tokenizer";

const ROW_HEIGHT = 22;
let DOM_ELEMENTS = { lines: [], tokens: [] };
let CURSOR_POSITION = { top: undefined, left: undefined };

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
  const { focusedRow, index, lines, scrollRange } = store.getState();
  const range = document.createRange();
  range.selectNodeContents(layer);
  range.deleteContents();

  if (focusedRow !== undefined && index !== undefined) {
    // const { token, idx } = getTokenFromCursor(index, lines[focusedRow].tokens);

    // const curX = getCursorPos(
    //   DOM_ELEMENTS.tokens[focusedRow - scrollRange.start][idx],
    //   token,
    //   index
    // );
    const cursorEl = document.createElement("div");
    cursorEl.className = "cursor";
    cursorEl.style.top = `${CURSOR_POSITION.top}px`;
    cursorEl.style.left = `${CURSOR_POSITION.left}px`;
    layer.appendChild(cursorEl);
  }
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
    .map((line, i) => createLineEl(line, i))
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
const createLineEl = (line, i) => {
  const tokensEl = line.tokens.map(token => createTokenEl(token));
  const lineEl = document.createElement("div");
  lineEl.className = "row";
  lineEl.style.backgroundColor =
    i % 2 === 0 ? "rgba(100,100,0,0.5)" : "rgba(100,0,0,0.5)";
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
    const screenRow = Math.trunc((clientY - rect.top) / rowHeight);

    const row =
      screenRow < lines.length + scrollRange.start
        ? screenRow + scrollRange.start
        : undefined;
    // calcul index
    let index = undefined;
    if (row !== undefined && screenRow < scrollRange.offset) {
      const dom = DOM_ELEMENTS;
      const line = lines[row];
      const { el, token } = getToken(dom, screenRow, clientX, clientY)(line);

      if (el) {
        const { next, cursorLeft } = getCursorIndex(el, token, clientX);
        index = next;
        CURSOR_POSITION.left = cursorLeft;
      } else {
        const rect = getLineRect(dom.tokens[screenRow]);
        CURSOR_POSITION.left = rect.width;
        index = line.value.length;
      }
    }
    CURSOR_POSITION.top = screenRow * rowHeight;
    store.dispatch(actions.setCursorPosition(row, index));
  });
  layerEl.addEventListener("mousedown", e => {
    e.stopImmediatePropagation();
  });
  layerEl.addEventListener("mousemove", e => {
    e.stopImmediatePropagation();
  });
  layerEl.addEventListener("keydown", e => {});

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
  const cursorLeft = Math.round(chasse * next);
  return { next, cursorLeft };
};

const getLineRect = tokensEl =>
  tokensEl.reduce((a, el, i) => {
    const r = el.getBoundingClientRect();
    return i === 0
      ? { left: r.left, top: r.top, width: r.width }
      : { ...a, width: Math.round(a.width + r.width) };
  }, {});

/* UTILS */

export default createEditor;
