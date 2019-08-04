import React, { useContext, createRef, useState, useEffect } from 'react';
import KEY from '../key-bind';
import { EditorContext } from './editor-panel.component';
import * as actions from '../editor.actions';

const FrontEditor = () => {
	const divEl = createRef();
	const state = useContext(EditorContext);
	const [ effectiveSel, setEffectiveSel ] = useState(undefined);
	const { lines, dispatch, handleChange, errors, shortcutPatterns } = state;

	useEffect(
		() => {
			handleChange({ lines, errors });
		},
		[ lines, errors, handleChange ]
	);

	const [ start, setStart ] = useState(false);

	return (
		<div
			className="front-editor"
			ref={divEl}
			tabIndex="0"
			onKeyDown={compose(dispatch, state, shortcutPatterns)(
				keydowShorcutCallback,
				keyDownWithSelection,
				keyDownsuggesterProxy,
				keyDownCallback
			)}
			onMouseDown={(e) => {
				divEl.current.focus();
			}}
		>
			{lines.map(({ value }, i) => (
				<div
					key={i}
					className="row"
					onMouseEnter={(e) => {}}
					onMouseDown={(e) => {
						setStart(true);
						setEffectiveSel({ anchorRow: i });
						dispatch(actions.setSelection({ anchorRow: i }));
					}}
					onMouseMove={(e) => {
						const { anchorOffset, extentOffset } = window.getSelection();
						if (start) {
							const next = {
								...effectiveSel,
								extentRow: i,
								anchorOffset,
								extentOffset
							};
							setEffectiveSel(next);
							const finalSel =
								next && next.anchorRow > next.extentRow
									? {
											anchorRow: next.extentRow,
											extentRow: next.anchorRow,
											anchorOffset: next.extentOffset,
											extentOffset: next.anchorOffset
										}
									: next;

							dispatch(actions.setSelection(finalSel));
						}
					}}
					onMouseUp={(e) => {
						setStart(false);
						const { anchorOffset } = window.getSelection();
						dispatch(actions.setCursorPosition(i, anchorOffset));
					}}
				>
					{value}
				</div>
			))}
		</div>
	);
};

export default FrontEditor;

/* */
const compose = (...opts) => (...callbacks) =>
	callbacks.reverse().reduce(
		(a, call) => (e) => {
			if (!call(...opts)(e)) a(e);
		},
		(e) => false
	);

/* */
const keyDownsuggesterProxy = (dispatch, state, shortcutPattern) => (e) => {
	const { open, index } = state.suggesterState;
	if (open) {
		switch (e.key) {
			case KEY.ARROW_UP:
				stopAndPrevent(e);
				dispatch(actions.previousSuggestion());
				return true;
			case KEY.ARROW_DOWN:
				stopAndPrevent(e);
				dispatch(actions.nextSuggestion());
				return true;
			case KEY.ENTER:
				if (index > -1) {
					stopAndPrevent(e);
					dispatch(actions.suggestToken(state.suggesterState.value));
					return true;
				}
				return false;
			default:
				dispatch(actions.resetSuggesterIndex());
				return false;
		}
	}
	return false;
};

/* */
const keyDownCallback = (dispatch, state, shortcutPattern) => (e) => {
	if (KEY.isUnbindedKey(e.key)) return false;
	switch (e.key) {
		case KEY.ARROW_UP:
		case KEY.ARROW_DOWN:
			stopAndPrevent(e);
			dispatch({ type: e.key });
			dispatch(actions.checkIndex());
			dispatch(actions.resetPrefix());
			return true;
		case KEY.DELETE:
		case KEY.ENTER:
		case KEY.BACK_SPACE:
			stopAndPrevent(e);
			dispatch({ type: e.key });
			dispatch(actions.checkPrefix());
			return true;
		case KEY.PAGE_UP:
		case KEY.PAGE_DOWN:
		case KEY.TAB:
		case KEY.HOME:
		case KEY.END:
		case KEY.CONTEXT_MENU:
		case KEY.ARROW_LEFT:
		case KEY.ARROW_RIGHT:
			stopAndPrevent(e);
			dispatch({ type: e.key });
			dispatch(actions.resetPrefix());
			return true;
		default:
			if (isCharCode(e.key)) {
				dispatch(actions.insertCharacter(e.key));
				dispatch(actions.checkPrefix());
				return true;
			}
			return false;
	}
};

/* */
const keyDownWithSelection = (dispatch, state, shortcutPatterns) => (e) => {
	if (isSelection(state.selection)) {
		switch (e.key) {
			case KEY.DELETE:
			case KEY.ENTER:
			case KEY.BACK_SPACE:
				stopAndPrevent(e);
				dispatch(actions.deleteSelection());
				return true;
			default:
				return false;
		}
	}

	return false;
};

/* */
const keydowShorcutCallback = (dispatch, state, shortcutPatterns) => (e) => {
	const { altKey, shiftKey, ctrlKey, key } = e;
	if (ctrlKey || altKey || shiftKey) {
		if (key !== KEY.ALT && key !== KEY.SHIFT && key !== KEY.CONTROL) {
			stopAndPrevent(e);
			return shortcutPatterns.get({ altKey, shiftKey, ctrlKey, key }).execute(dispatch, state);
		}
	}
	return false;
};

/* */
const stopAndPrevent = (e) => {
	e.stopPropagation();
	e.preventDefault();
};

/* */
const isCharCode = (c) => true; //c && /[\w!@#$%^&*(),.?":{}|<>].{1}/g.test(c);

/* */
// const onBlurCallback = dispatch => e => {
//   e.stopPropagation();
//   e.preventDefault();
//   dispatch(actions.exitEditor());
// };

/* */
const isSelection = (selection) => selection && selection.extentOffset;

/* */
