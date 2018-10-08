var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import { Base } from './base.js';
import template from '../../../../includes/template/popover/section.html';

export class Section extends Base {
	constructor() {
		super();

		this.template = template;

		this.name = 'section';

		this.wrapTarget = '.boldgrid-section-wrap';

		this.selectors = [ '.boldgrid-section' ];

		this.emptySectionTemplate = wp.template( 'boldgrid-editor-empty-section' );

		this.selectorsString = this.selectors.join( ',' );

		return this;
	}

	/**
	 * Bind all events for this popover.
	 *
	 * @since 1.6
	 */
	_bindEvents() {
		super._bindEvents();

		let stopPropagation = function( e ) {
			e.stopPropagation();
		};

		this.$element.find( '[data-action]' ).on( 'click', stopPropagation );
		this.$element.find( '[data-action="section-width"]' ).on( 'click', e => this.sectionWidth( e ) );
		this.$element.find( '[data-action="move-up"]' ).on( 'click', () => this.moveUp() );
		this.$element.find( '[data-action="move-down"]' ).on( 'click', () => this.moveDown() );
		this.$element.find( '[data-action="save-gridblock"]' ).on( 'click', e => this._saveGridblock( e ) );
		this.$element.find( '[data-action="add-new"]' ).on( 'click', () => this.addNewSection() );
		this.$element.find( '[data-action="add-section-row"]' ).on( 'click', () => this.addRow() );
		this.$element.find( '.context-menu-imhwpb' ).on( 'click', e => this.menuDirection( e ) );
	}

	/**
	 * Get the selector string.
	 *
	 * @since 1.6
	 *
	 * @return {string} DOM query selector string.
	 */
	getSelectorString() {
		return this.selectorsString;
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
		return $target && ( $target.hasClass( 'slick-dots' ) || $target.hasClass( 'slick-arrow' ) );
	}

	/**
	 * Add a row to a section.
	 *
	 * @since 1.8.0
	 */
	addRow() {
		let $emptyRow = BG.Controls.$container.createEmptyRow();

		BG.Service.popover.selection.$target.find( '.container, .container-fluid' ).append( $emptyRow );

		BG.Controls.$container.postAddRow( $emptyRow );
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
		return {
			top: clientRect.bottom + 35,
			left: 'calc(50% - 38px)',
			transform: 'translateX(-50%)'
		};
	}

	/**
	 * Add New section under current section.
	 *
	 * @since 1.2.7
	 */
	addNewSection() {
		let $newSection = $( this.emptySectionTemplate() );
		this.getWrapTarget().after( $newSection );
		this.transistionSection( $newSection );
	}

	/**
	 * Fade the color of a section from grey to transparent.
	 *
	 * @since 1.2.7
	 * @param jQuery $newSection.
	 */
	transistionSection( $newSection, color ) {
		IMHWPB['tinymce_undo_disabled'] = true;

		color = color || '#eeeeee';

		$newSection.css( {
			transition: 'background-color 0.50s',
			'background-color': color
		} );

		setTimeout( () => {
			BG.Controls.addStyle( $newSection, 'background-color', '' );
		}, 250 );

		setTimeout( () => {
			BG.Controls.addStyle( $newSection, 'transition', '' );
			IMHWPB['tinymce_undo_disabled'] = false;
			BOLDGRID.EDITOR.mce.undoManager.add();
		}, 500 );
	}

	/**
	 * When the section menu is too close to the top, point it down.
	 *
	 * @since 1.2.8
	 * @param Event e.
	 */
	menuDirection( e ) {
		let pos = e.screenY - window.screenY,
			menuHeight = 340,
			staticMenuPos = BG.Menu.$mceContainer[0].getBoundingClientRect();

		if ( pos - staticMenuPos.bottom < menuHeight ) {
			this.$element.find( '.popover-menu-imhwpb' ).addClass( 'menu-down' );
		} else {
			this.$element.find( '.popover-menu-imhwpb' ).removeClass( 'menu-down' );
		}
	}

	/**
	 * Move the section up one in the DOM.
	 *
	 * @since 1.2.7
	 */
	moveUp() {
		let $target = this.getWrapTarget(),
			$prev = $target.prev();

		if ( $prev.length ) {
			$prev.before( $target );
			BG.Controls.$container.trigger( BG.Controls.$container.delete_event );
		}
	}

	/**
	 * Save a GridBlock.
	 *
	 * @since 1.6
	 */
	_saveGridblock( e ) {
		BG.Controls.get( 'Library' ).openPanel( {
			html: this.getWrapTarget()[0].outerHTML
		} );
	}

	/**
	 * Move the section down one in the DOM.
	 *
	 * @since 1.2.7
	 */
	moveDown() {
		let $target = this.getWrapTarget(),
			$next = $target.next();

		if ( $next.length ) {
			$next.after( $target );
			BG.Controls.$container.trigger( BG.Controls.$container.delete_event );
		}
	}

	/**
	 * Control whether a container is fluid or not.
	 *
	 * @since 1.2.7
	 */
	sectionWidth() {
		BG.CONTROLS.Container.toggleSectionWidth( this.$target.find( '.container, .container-fluid' ) );
		this.$target.trigger( BG.Controls.$container.delete_event );
	}
}

export { Section as default };
