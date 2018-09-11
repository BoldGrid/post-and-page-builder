var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import Clone from './actions/clone.js';
import Delete from './actions/delete.js';
import GeneralActions from './actions/general.js';

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
		this.$element = this._render();

		this.$element.hide();
		this._bindEvents();

		// Init actions.
		this.options.actions.clone.init();
		this.options.actions.delete.init();
		new GeneralActions().bind( this );

		return this;
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
		let pos, $newTarget;

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
			$newTarget = $newTarget.closest( this.getSelectorString() );

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

		this.$element.trigger( 'updatePosition' );

		pos = this.$target[0].getBoundingClientRect();

		this.$element.css( this.getPositionCss( pos ) ).show();
		this.$target.addClass( 'popover-hover' );
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
			this.hideEventType = event.type;
			this.debouncedHide();
		} );

		BG.Controls.$container.on( this.hideHandleEvents.join( ' ' ), event => {
			this.hideEventType = event.type;
			this.hideHandles();
		} );
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
			this.$target.removeClass( 'popover-hover' );
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
}

export { Base as default };
