window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.RESIZE = BOLDGRID.EDITOR.RESIZE || {};

import { PaddingTop } from './padding-top';
import { PaddingBottom } from './padding-bottom';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.RESIZE.Row = {
		$body: null,

		handleSize: 20,

		rightOffset: 100,

		$container: null,

		$topHandle: null,

		$bottomHandle: null,

		handleOffset: null,

		currentlyDragging: false,

		$currentRow: null,

		/**
		 * Initialize Row Resizing.
		 * This control adds padding top and bottom to containers.
		 *
		 * @since 1.2.7
		 */
		init: function( $container ) {
			self.$container = $container;

			this.paddingTop = new PaddingTop();
			this.paddingBottom = new PaddingBottom();

			this.paddingTop.render();
			this.paddingBottom.render();

			self.hideHandles();
		},

		/**
		 * When the top handle is dragged, update the bottom handle.
		 *
		 * This is done because the fixed positioning of each means that adding
		 * padding to the top changes the position of the bottom.
		 *
		 * @since 1.8.0
		 */
		_syncBottomHandle( padding, diff ) {
			if ( 0 <= padding ) {
				let currentTop = parseInt( this.paddingBottom.$element.css( 'top' ), 10 );

				/*
				 * If possible, apply the diff to the other handle.
				 * In the case of negetive padding to a hard update. This optiomization
				 * prevents a repaint and stuttering.
				 */
				this.paddingBottom.$element.css( 'top', currentTop - diff );
			} else {
				this.paddingBottom.updatePosition();
			}
		},

		/**
		 * Reposition the handles.
		 *
		 * @since 1.2.7
		 */
		positionHandles: function( $this ) {
			var pos, rightOffset;

			if ( ! $this || ! $this.length ) {
				this.paddingTop.$element.hide();
				this.paddingBottom.$element.hide();
				return;
			}

			if ( self.currentlyDragging ) {
				return false;
			}

			pos = $this[0].getBoundingClientRect();

			// Save the current row.
			self.$currentRow = $this;

			this.paddingTop.updatePosition( pos );
			this.paddingBottom.updatePosition( pos );

			// Set the size text box
			this.paddingTop.updateSizeDisplay( self.$currentRow );
			this.paddingBottom.updateSizeDisplay( self.$currentRow );

			// Show handles.
			this.paddingTop.$element.show();
			this.paddingBottom.$element.show();
		},

		/**
		 * Hide the drag handles.
		 *
		 * @since 1.2.7
		 */
		hideHandles: function() {
			if ( self.currentlyDragging ) {
				return false;
			}

			this.paddingTop.$element.hide();
			this.paddingBottom.$element.hide();
		}
	};

	self = BOLDGRID.EDITOR.RESIZE.Row;
} )( jQuery );
