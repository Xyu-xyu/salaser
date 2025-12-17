import { observer } from "mobx-react-lite";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import partStore from "./../../../store/partStore.jsx";
import { useTranslation } from 'react-i18next';


const TooltipCreator = observer (({ element }) => {
	const { t } = useTranslation();

	let id =  element.id
	let tooltipsInfo = {
		playCutPartOrder: {
			title: t("Play"),
			text: '',
			placement: 'bottom'
		},
		stopCutQue: {
			title: t("Stop"),
			text: '',
			placement: 'bottom'
		},
		speedPartShow: {
			title: t("Cut speed"),
			text: '',
			placement: 'bottom'
		},
		resizeCutItem: {
			title: t("Icon size"),
			text: '',
			placement: 'bottom'
		},
		proportion: {
			title: t("Save proportions in transforming"),
			text: '',
			placement: 'bottom'
		},
		transformAll: {
			title: t("Transform outer with inner contours"),
			text: '',
			placement: 'bottom'
		},
		textSize: {
			title: t("Font size"),
			text: '',
			placement: 'bottom'
		},
		textKerning: {
			title: t("Letter spacing"),
			text: '',
			placement: 'bottom'
		},
		resizeMode: {
			title: t("Resize mode"),
			text: '',
			placement: 'bottom'
		},
		dragMode: {
			title: t("Drag mode"),
			text: '',
			placement: 'bottom'
		},
		addPoint: {
			title: t("Add point"),
			text: '',
			placement: 'bottom'
		},
		addPointToPath: {
			title: t("Add point"),
			text: '',
			placement: 'bottom'
		},
		btn_copy: {
			title: t("Copy contour"),
			text: '',
			placement: 'bottom'
		},
		selectPoint: {
			title: t("Select point mode"),
			text: '',
			placement: 'bottom'
		},
		deletePoint: {
			title: t("Delete selected point"),
			text: '',
			placement: 'bottom'
		},
		rounding: {
			title: t("Round edges at selected point"),
			text: '',
			placement: 'bottom'
		},
		btn_paste: {
			title: t("Paste copied contour"),
			text: '',
			placement: 'bottom'
		},
		btn_reverse: {
			title: t("Revert contour path"),
			text: '',
			placement: 'bottom'
		},
		btn_shapes: {
			title: t("Add contour from shapes"),
			text: '',
			placement: 'bottom'
		},
		btn_text: {
			title: t("Select or create text"),
			text: '',
			placement: 'bottom'
		},
		btn_new_outer: {
			title: t("Set new outer contour"),
			text: '',
			placement: 'bottom'
		},
		btn_delete: {
			title: t("Delete"),
			text: '',
			placement: 'bottom'
		},
		btn_remove_joint: {
			title: t("Remove joint"),
			text: '',
			placement: 'bottom'
		},
		btn_resize_mode: {
			title: t("Select contour"),
			text: '',
			placement: 'bottom'
		},
		/* toolTipsSwitcher: {
			title: t("Enables and disables hints"),
			text: '',
			placement: 'bottom'
		} */
	}


	return (
		partStore.tooltips ?

		<OverlayTrigger 
			placement = { tooltipsInfo[id].placement } 
			overlay = {
				<Tooltip >
		  			<strong>{tooltipsInfo[id].title}</strong>{tooltipsInfo[id].secText}
				</Tooltip>
			}>
			{ element.info }
		</OverlayTrigger>
		:
		element.info
		
	);
});

export default TooltipCreator;