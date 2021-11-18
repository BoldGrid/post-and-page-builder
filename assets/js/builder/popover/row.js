var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import { Base } from './base.js';
import template from '../../../../includes/template/popover/row.html';

export class Row extends Base {
	constructor() {
		super();

		this.template = template;

		this.name = 'row';

		return this;
	}

	/**
	 * Bind all events.
	 *
	 * @since 1.6
	 */
	_bindEvents() {
		super._bindEvents();

		this.$element.on( 'updatePosition', () => {
			BG.RESIZE.Row.positionHandles( this.$target );
		} );

		this.$element.on( 'hide', () => {
			BG.RESIZE.Row.hideHandles();
		} );
	}

	/**
	 * Get a position for the popover.
	 *
	 * @since 1.6
	 *
	 * @param  {object} clientRect Current coords.
	 * @return {object}            Css for positioning.
	 */
	getPositionCss( clientRect ) {
		var fullscreen = window.getUserSetting( 'editor_fullscreen' ),
			isFullScreen = 'on' === fullscreen ? true : false;

		/*
		 * Fullscreen mode requires the use of jQuery offset
		 * instead of boundingRect and absolute positioning.
		 */
		if ( isFullScreen ) {
			return {
				position: 'absolute',
				top: this.$target.$wrapTarget.offset().top,
				left: clientRect.left + clientRect.width
			};
		} else {
			return {
				position: 'fixed',
				top: clientRect.top,
				left: clientRect.left + clientRect.width
			};
		}
	}

	/**
	 * If the element that I entered is still within the current target, do not hide.
	 *
	 * @since 1.6
	 *
	 * @param  {$} $target Jquery
	 * @return {$}         Should we prevent mouse leave action?
	 */
	preventMouseLeave( $target ) {
		return (
			$target &&
			$target.closest( '.resize-handle' ).length &&
			this.$target.is( BG.RESIZE.Row.$currentRow )
		);
	}

	/**
	 * Get the current selector string depending on drag mode.
	 *
	 * @since 1.6
	 *
	 * @return {string} Selectors.
	 */
	getSelectorString() {
		let selectorString = BG.Controls.$container.original_selector_strings.row_selectors_string;

		if ( BG.Controls.$container.editting_as_row ) {
			selectorString = BG.Controls.$container.nested_row_selector_string;
		}

		return selectorString;
	}
}

export { Row as default };
