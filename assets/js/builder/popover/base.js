var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import Clone from './actions/clone.js';
import Delete from './actions/delete.js';
import GeneralActions from './actions/general.js';
import { EventEmitter } from 'eventemitter3';

export class Base {
	constructor( options ) {
		options = options || {};
		options.actions = options.actions || {};

		options.actions.clone = options.actions.clone || new Clone( this );
		options.actions.delete = options.actions.delete || new Delete( this );

		this.options = options;

		this.selectors = [ '.must-be-defined' ];

		this.debounceTime = 300;
		this._hideCb = this._getDebouncedHide();
		this._showCb = this._getDebouncedUpdate();

		this.hideHandleEvents = [
			'bge_row_resize_start',
			'start_typing_boldgrid',
			'boldgrid_modify_content',
			'resize_clicked',
			'drag_end_dwpb',
			'history_change_boldgrid',
			'clear_dwpb',
			'add_column_dwpb'
		];

		this.event = new EventEmitter();
	}

	/**
	 * Setup this class.
	 *
	 * @since 1.6
	 *
	 * @return {object} Class instance.
	 */
	init() {
		this.$target;
		this.eventName = this.capitalize( this.name );
		this.$element = this._render();

		this.$element.hide();
		this._bindEvents();

		// Init actions.
		this._setupMenuClick();
		this.options.actions.clone.init();
		this.options.actions.delete.init();
		new GeneralActions().bind( this );

		return this;
	}

	capitalize( string ) {
		return string[0].toUpperCase() + string.slice( 1 );
	}

	/**
	 * Hide the section handles.
	 *
	 * @since 1.6
	 * @param {object} event Event from listeners.
	 */
	hideHandles( event ) {
		let $target;

		if ( event && event.relatedTarget ) {
			$target = $( event.relatedTarget );
		}

		// Allow child class to prevent this action.
		if ( this.preventMouseLeave && this.preventMouseLeave( $target ) ) {
			return;
		}

		this._removeBorder();
		this.$element.$menu.addClass( 'hidden' );
		this.$element.hide();
		this.$element.trigger( 'hide' );
		this.$element.removeClass( 'menu-open' );
	}

	/**
	 * Update the position of the handles.
	 *
	 * @since 1.6
	 *
	 * @param  {object} event Event from listeners.
	 */
	updatePosition( event ) {
		let $newTarget;

		this._removeBorder();

		if ( event ) {
			$newTarget = $( event.target );
		}

		if ( this._isInvalidTarget( $newTarget || this.$target ) ) {
			this.$element.hide();
			return;
		}

		// Do not update if user is dragging.
		if (
			BG.Controls.$container.$current_drag ||
			BG.Controls.$container.resize ||
			this.disableAddPopover
		) {
			return false;
		}
		if ( $newTarget ) {

			// Rewrite target to parent.
			$newTarget = this._getParentTarget( $newTarget );

			// If hovering over a new target, hide menu.
			if ( this.$target && $newTarget[0] !== this.$target[0] ) {
				this.$element.removeClass( 'menu-open' );
				this.$element.$menu.addClass( 'hidden' );
			}

			this.$target = $newTarget;
		}

		// Check validation after all rewrites are done.
		if ( this.$target.closest( '[contenteditable="false"]:not(.wpview)' ).length ) {
			this.$element.hide();
			return;
		}

		// Store the wrap target for faster lookups later.
		this.$target.$wrapTarget = this._findWrapTarget();

		this._setPosition();
		this.$element.show();
		this.$target.$wrapTarget.addClass( 'popover-hover' );
	}

	/**
	 * Set positioning of popovers.
	 *
	 * @since 1.8.0
	 */
	_setPosition() {
		this.$element.trigger( 'updatePosition' );
		let pos = this.$target.$wrapTarget[0].getBoundingClientRect();
		this.$element.css( this.getPositionCss( pos ) );
	}

	/**
	 * Bind all selectors based on delegated selectors.
	 *
	 * @since 1.6
	 */
	bindSelectorEvents() {

		// When the user enters the popover, show popover.
		this.$element.on( 'mouseenter', () => {
			this.debouncedUpdate();
		} );

		BG.Controls.$container.$body.on( 'mouseenter.draggable', this.getSelectorString(), event => {
			this.debouncedUpdate( event );
		} );

		BG.Controls.$container.$body.on( 'mouseleave.draggable', this.getSelectorString(), event => {
			this.debouncedHide( event );
		} );
	}

	debouncedHide( event ) {
		this._hideCb( event );
		this.mostRecentAction = 'leave';
	}

	debouncedUpdate( event ) {
		this._showCb( event );
		this.mostRecentAction = 'enter';
	}

	/**
	 * Get a potentially wrapping element.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} Element to modify.
	 */
	getWrapTarget() {
		return this.$target.$wrapTarget || this.$target;
	}

	/**
	 * Check for parents if they exists and return it.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $target Target to check.
	 * @return {jQuery}         Parent target.
	 */
	_getParentTarget( $target ) {
		let $parent = $target.parents( this.getSelectorString() ).last();
		return $parent.length ? $parent : $target;
	}

	/**
	 * Find the current wrapping target.
	 *
	 * A wrap target is an element that contains a draggable item. The popover
	 * should exist on the original target and only some actions will rewrite to the
	 * wrap target. For example a boldgrid-slider wraps a group of sections.
	 * When the user clicks the clone action the event is mapped to the wrap and
	 * not the section. Other actions like change background, are still bound to
	 * the section.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} Current wrap element.
	 */
	_findWrapTarget() {
		if ( ! this.wrapTarget ) {
			return this.$target;
		}

		let $wrap = this.$target.closest( this.wrapTarget );
		return $wrap.length ? $wrap : this.$target;
	}

	/**
	 * Create a debounced version of the update function.
	 *
	 * @since 1.6
	 *
	 * @return {function} Debounced function.
	 */
	_getDebouncedHide() {
		return _.debounce( event => {

			// Only proceed of if this was the most recently triggered action.
			if ( 'leave' === this.mostRecentAction ) {
				this.hideHandles( event );
			}
		}, this.debounceTime );
	}

	/**
	 * Create a debounced version of the update function.
	 *
	 * @since 1.6
	 *
	 * @return {function} Debounced function.
	 */
	_getDebouncedUpdate() {
		return _.debounce( event => {

			// Only proceed of if this was the most recently triggered action.
			if ( 'enter' === this.mostRecentAction ) {
				this.updatePosition( event );
			}
		}, this.debounceTime );
	}

	/**
	 * Bind all event listeners.
	 *
	 * @since 1.6
	 */
	_bindEvents() {
		this.bindSelectorEvents();
		this._universalEvents();
	}

	/**
	 * Bind all events that will hide the handles.
	 *
	 * @since 1.6
	 */
	_universalEvents() {
		this.$element.on( 'mousedown', () => {
			BG.Service.popover.selection = this;
		} );

		BG.Controls.$container.on( 'edit-as-row-enter edit-as-row-leave', () => {
			this.bindSelectorEvents();
			this.hideHandles();
		} );

		// Force the popovers to be repositioned.
		BG.Service.event.on( 'popoverReposition', () => this.updatePosition() );

		BG.Controls.$container.on( 'end_typing_boldgrid', () => {
			if ( 'start_typing_boldgrid' === this.hideEventType ) {
				this.updatePosition();
			}
		} );

		BG.Controls.$container.on( 'history_change_boldgrid', () => {

			// A manually triggered mouse enter on undo/redo caused popovers to appear, wait before adding.
			this.disableAddPopover = true;
			setTimeout( () => {
				this.disableAddPopover = false;
			}, 500 );
		} );

		this.$element.on( 'mouseleave', event => {
			this.debouncedHide( event );
		} );

		BG.Controls.$container.find( '[data-action]' ).on( 'click', event => {
			this.hideHandles( event );
		} );

		BG.Controls.$container.on( 'mouseleave', event => {

			/*
			 * Something is triggering this event without manually. Dont hide the
			 * handles unless the user mouses out themselves.
			 */
			if ( event.relatedTarget ) {
				this.hideEventType = event.type;
				this.debouncedHide();
			}
		} );

		BG.Controls.$container.on( this.hideHandleEvents.join( ' ' ), event => {
			this.hideEventType = event.type;
			this.hideHandles();
		} );

		BG.Controls.$container.$window.on(
			'resize',
			_.debounce( () => {
				if ( 'block' === this.$element.css( 'display' ) && this.$target ) {
					this._setPosition();
				}
			}, 100 )
		);
	}

	/**
	 * Check if the popover target exists.
	 *
	 * @since 1.6
	 * @return {Boolean} Is the target still on the page.
	 */
	_isInvalidTarget( $newTarget ) {
		return ! $newTarget || ! $newTarget.length || ! BG.Controls.$container.find( $newTarget ).length;
	}

	/**
	 * Remove section poppover target border.
	 *
	 * @since 1.6
	 */
	_removeBorder() {
		if ( this.$target && this.$target.length ) {
			this.getWrapTarget().removeClass( 'popover-hover' );
		}
	}

	/**
	 * Render the popover after the body.
	 *
	 * @since 1.6
	 *
	 * @return {jQuery} Popover element.
	 */
	_render() {
		let $popover = $(
			_.template( this.template )( {
				actions: BG.Controls.$container.additional_menu_items
			} )
		);

		$popover.$menu = $popover.find( '.popover-menu-imhwpb' );
		BG.Controls.$container.$body.after( $popover );

		return $popover;
	}

	/**
	 * Setup the menu click event.
	 *
	 * @since 1.8.0
	 */
	_setupMenuClick() {
		this.$element.find( '.context-menu-imhwpb' ).on( 'click', event => {
			event.preventDefault();
			event.stopPropagation();

			BG.Controls.$container.hide_menus( event );

			this.$element.$menu.toggleClass( 'hidden' );
			BG.Controls.$container.setMenuPosition( this.$element );
			this._updateMenuState();
		} );
	}

	/**
	 * Update the menu classes based on the visibility state.
	 *
	 * @since 1.8.0
	 */
	_updateMenuState() {
		this.$element.removeClass( 'menu-open' );
		if ( false === this.$element.$menu.hasClass( 'hidden' ) ) {
			this.event.emit( 'open' );
			this.$element.addClass( 'menu-open' );
		}
	}
}

export { Base as default };
