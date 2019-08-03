import React, { useContext, createRef, useState, useEffect } from 'react';
import KEY from '../key-bind';
import { EditorContext } from './editor-panel.component';
import * as actions from '../editor.actions';

const FrontEditor = () => {
	const divEl = createRef();
	const state = useContext(EditorContext);
	const { lines, dispatch, selection, handleChange, errors, shortcutPatterns } = state;

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
			onKeyDown={suggesterKeyDownProxy(keyDownCallback, shortcutPatterns)(dispatch, state)}
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
						dispatch(actions.setSelection({ anchorRow: i }));
					}}
					onMouseMove={(e) => {
						if (start) {
							const { anchorOffset, extentOffset } = window.getSelection();

							dispatch(
								actions.setSelection({
									...selection,
									extentRow: i,
									anchorOffset,
									extentOffset
								})
							);
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
const suggesterKeyDownProxy = (callback, shortcutPatterns) => (dispatch, state) => {
	if (!state.edit) return;
	const callee = callback(shortcutPatterns)(dispatch, state);

	return (e) => {
		const { open, index } = state.suggesterState;
		if (open) {
			switch (e.key) {
				case KEY.ARROW_UP:
					dispatch(actions.previousSuggestion());
					return false;
				case KEY.ARROW_DOWN:
					dispatch(actions.nextSuggestion());
					return false;
				case KEY.ENTER:
					if (index > -1) {
						dispatch(actions.suggestToken(state.suggesterState.value));
						return false;
					}
					return callee(e);
				default:
					dispatch(actions.resetSuggesterIndex());
					return callee(e);
			}
		}
		return callee(e);
	};
};

/* */
const keyDownCallback = (shortcutPatterns) => (dispatch, state) => (e) => {
	if (KEY.isUnbindedKey(e.key)) return;
	e.stopPropagation();
	e.preventDefault();
	if (e.ctrlKey || e.altKey) return shortcutCallback(shortcutPatterns)(dispatch, state)(e);
	const { key } = e;
	switch (key) {
		case KEY.ARROW_UP:
		case KEY.ARROW_DOWN:
			dispatch({ type: key });
			dispatch(actions.checkIndex());
			dispatch(actions.resetPrefix());
			break;
		case KEY.DELETE:
		case KEY.ENTER:
		case KEY.BACK_SPACE:
			if (isSelection(state.selection)) {
				dispatch(actions.deleteSelection(state.selection));
				break;
			}
			dispatch({ type: key });
			dispatch(actions.checkPrefix());
			break;
		case KEY.PAGE_UP:
		case KEY.PAGE_DOWN:
		case KEY.TAB:
		case KEY.HOME:
		case KEY.END:
		case KEY.CONTEXT_MENU:
		case KEY.ARROW_LEFT:
		case KEY.ARROW_RIGHT:
			dispatch({ type: key });
			dispatch(actions.resetPrefix());
			break;
		default:
			if (isCharCode(key)) {
				if (isSelection(state.selection)) {
					dispatch(actions.deleteSelection(state.selection));
				}
				dispatch(actions.insertCharacter(key));
				dispatch(actions.checkPrefix());
			}
			break;
	}
};

/* */
const shortcutCallback = (patterns) => (dispatch, state) => ({ key, altKey, ctrlKey, shiftKey }) => {
	const pattern = patterns.get({ altKey, shiftKey, ctrlKey, key });
	pattern.execute();
};

const isCharCode = (c) => true; //c && /[\w!@#$%^&*(),.?":{}|<>].{1}/g.test(c);

/* */
// const onBlurCallback = dispatch => e => {
//   e.stopPropagation();
//   e.preventDefault();
//   dispatch(actions.exitEditor());
// };

/* */
// const onMouseDownCallback = (dispatch, state) => e => {
//   const { prefix } = state;
//   if (prefix) dispatch(actions.resetPrefix());
// };

/* */
const isSelection = (selection) => selection && selection.extentOffset;

/* */
