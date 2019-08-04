import React, { useContext } from 'react';
import { EditorContext } from './editor-panel.component';

const Selector = ({ lines, el }) => {
	const { selection } = useContext(EditorContext);

	return <Selection selection={selection} lines={lines} />;
};

const Selection = ({ lines, selection }) => {
	// const selection =
	// 	is && is.anchorRow > is.extentRow
	// 		? {
	// 				anchorRow: is.extentRow,
	// 				extentRow: is.anchorRow,
	// 				anchorOffset: is.extentOffset,
	// 				extentOffset: is.anchorOffset
	// 			}
	// 		: is;
	return (
		<div className="selector-2">
			{lines.map(({ value }, i) => (
				<div key={i} className="row">
					{selection && selection.extentOffset && i >= selection.anchorRow && i <= selection.extentRow ? i ===
					selection.anchorRow ? (
						[
							<span key={0}>{value.substr(0, selection.anchorOffset)}</span>,

							i === selection.extentRow ? (
								[
									<span key={1} className="selected">
										{value.substr(
											selection.anchorOffset,
											selection.extentOffset - selection.anchorOffset
										)}
									</span>,
									<span key={2}>{value.substr(selection.extentOffset)}</span>
								]
							) : (
								<span key={1} className="selected">
									{value.substr(selection.anchorOffset)}
								</span>
							)
						]
					) : i === selection.extentRow ? (
						[
							<span className="selected" key={0}>
								{value.substr(0, selection.extentOffset)}
							</span>,
							<span key={1}>{value.substr(selection.extentOffset)}</span>
						]
					) : (
						<span className="selected">{value}</span>
					) : (
						<span>{value}</span>
					)}
				</div>
			))}
		</div>
	);
};

export default Selector;
