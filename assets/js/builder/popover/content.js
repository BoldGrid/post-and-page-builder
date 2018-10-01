var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import { Base } from './base.js';
import template from '../../../../includes/template/popover/content.html';

export class Content extends Base {
	constructor() {
		super();

		this.template = template;

		this.name = 'content';

		this.wrapTarget = '.boldgrid-wrap-row';

		this.nestedSelector = this.createNestedSelector();

		return this;
	}

	/**
	 * Bind all events.
	 *
	 * @since 1.6
	 */
	_bindEvents() {
		super._bindEvents();

		this.$element.on( 'updatePosition', () => this._onUpdatePosition() );
		this.$element.find( '.edit-as-row' ).on( 'click', () => this._onEditRow() );
		this.event.on( 'open', () => this._toggleFontOption() );
		this.event.on( 'open', () => this._toggleAdvancedOption() );
	}

	/**
	 * When the popover is opened toggle visibility of the font option Based
	 * on the selector of the font control.
	 *
	 * @since 1.8.0
	 */
	_toggleFontOption() {
		let display = this.$target.is( BG.Controls.get( 'font' ).selectorString );
		this.$element.toggleClass( 'has-font-support', display );
	}

	/**
	 * When the popover is opened toggle visibility of the font option Based
	 * on the selector of the font control.
	 *
	 * @since 1.8.0
	 */
	_toggleAdvancedOption() {
		let display = ! this.$target.hasClass( 'wpview' );
		this.$element.toggleClass( 'has-advanced-support', display );
	}

	/**
	 * Override functionality to skip target wrap checking while in edit as row.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} Element to modify.
	 */
	_findWrapTarget() {
		if ( BG.Controls.$container.editting_as_row ) {
			return this.$target;
		}

		return super._findWrapTarget();
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
		let offset = 40;

		// 80 is double the default offset.
		if ( 80 > clientRect.height ) {
			offset = clientRect.height / 2;
		}

		return {
			top: clientRect.top + offset,
			left: clientRect.left
		};
	}

	/**
	 * Get the current selector string depending on drag mode.
	 *
	 * @since 1.6
	 *
	 * @return {string} Selectors.
	 */
	getSelectorString() {
		let selector =
			BG.Controls.$container.original_selector_strings.unformatted_content_selectors_string;

		if ( BG.Controls.$container.editting_as_row ) {
			selector = this.nestedSelector;
		}

		return selector;
	}

	/**
	 * Create a selector to be used when nesting rows.
	 *
	 * @since 1.6
	 *
	 * @return {string} DOM query selector string.
	 */
	createNestedSelector() {
		let contentSelectors = [];

		_.each( BG.Controls.$container.content_selectors, ( value, index ) => {
			if ( '.row .row:not(.row .row .row)' !== value ) {
				contentSelectors.push( value.replace( 'not(.row .row', 'not(.row .row .row' ) );
			}
		} );

		return contentSelectors.join( ',' );
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
		return $target && 1 === $target.closest( this.$target ).length;
	}

	/**
	 * Process to occur when updating the position of the popover.
	 *
	 * @since 1.6
	 */
	_onUpdatePosition() {
		let $nestedContent = this.$target.parents( this.getSelectorString() ).last();
		if ( $nestedContent.length ) {
			this.$target = $nestedContent;
		}

		if ( this.$target.hasClass( 'row' ) && ! BG.Controls.$container.editting_as_row ) {
			this.$element.addClass( 'nested-row-popover-imhwpb' );
		} else {
			this.$element.removeClass( 'nested-row-popover-imhwpb' );
		}
	}

	/**
	 * When the user clicks on the edit row button, perform the following actions.
	 *
	 * @since 1.6
	 */
	_onEditRow() {
		BG.Controls.$container.trigger( 'boldgrid_edit_row', this.$target );

		if ( BG.Controls.$container.editting_as_row ) {
			$.fourpan.dismiss();
		} else {
			$.fourpan.highlight( this.getWrapTarget() );
		}
	}
}

export { Content as default };
