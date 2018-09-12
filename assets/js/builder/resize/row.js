window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.RESIZE = BOLDGRID.EDITOR.RESIZE || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.RESIZE.Row = {
		$body: null,

		handleSize: 20,

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
			self.handleOffset = self.handleSize;
			self.createHandles();
			self.initDraggable();
		},

		/**
		 * Attach drag handle controls to the DOM.
		 *
		 * @since 1.2.7
		 */
		createHandles: function() {
			self.$topHandle = $(
				'<span class="draghandle top" title="Drag Resize Row" data-setting="padding-top"></span>'
			);
			self.$bottomHandle = $(
				'<span class="draghandle bottom" title="Drag Resize Row" data-setting="padding-bottom"></span>'
			);

			$.each( [ self.$topHandle, self.$bottomHandle ], function() {
				this.css( {
					position: 'fixed',
					height: self.handleSize,
					width: self.handleSize
				} );
			} );

			self.$container
				.find( 'body' )
				.after( self.$topHandle )
				.after( self.$bottomHandle );

			self.hideHandles();
		},

		/**
		 * Handle the drag events.
		 *
		 * @since 1.2.7
		 */
		initDraggable: function() {
			var startPadding, setting;

			self.$container.find( '.draghandle' ).draggable( {
				scroll: false,
				axis: 'y',
				start: function() {
					self.currentlyDragging = true;
					setting = $( this ).data( 'setting' );
					startPadding = parseInt( self.$currentRow.css( setting ) );
					self.$currentRow.addClass( 'changing-padding' );
					self.$container.$html.addClass( 'no-select-imhwpb' );
					self.$container.$html.addClass( 'changing-' + setting );
					BG.Controls.$container.trigger( 'bge_row_resize_start' );
				},
				stop: function() {
					BG.Controls.$container.trigger( 'bge_row_resize_end' );
					self.currentlyDragging = false;
					self.$currentRow.removeClass( 'changing-padding' );
					self.$container.$html.removeClass( 'no-select-imhwpb' );
					self.$container.$html.removeClass( 'changing-' + setting );
					self.hideHandles();
				},
				drag: function( e, ui ) {
					var padding,
						rowPos,
						relativePos,
						diff = ui.position.top - ui.originalPosition.top;

					if ( 'padding-top' === setting ) {
						padding = parseInt( self.$currentRow.css( setting ) ) - diff;
						relativePos = 'top';
						if ( 0 < padding && diff ) {
							window.scrollBy( 0, -diff );
						}
					} else {
						padding = startPadding + diff;
						relativePos = 'bottom';
					}

					// If padding is less than 0, prevent movement of handle.
					if ( 0 > padding ) {
						rowPos = self.$currentRow[0].getBoundingClientRect();
						ui.position.top =
							rowPos[relativePos] - ( ui.helper.hasClass( 'top' ) ? 0 : self.handleOffset );
						padding = 0;
					}

					BG.Controls.addStyle( self.$currentRow, setting, padding );

					if ( self.$container.$html.hasClass( 'editing-as-row' ) && $.fourpan ) {
						$.fourpan.refresh();
					}

					BG.Service.event.emit( 'rowResize', self.$currentRow );
				}
			} );
		},

		/**
		 * Reposition the handles.
		 *
		 * @since 1.2.7
		 */
		positionHandles: function( $this ) {
			var pos, rightOffset;

			if ( ! $this || ! $this.length ) {
				self.$topHandle.hide();
				self.$bottomHandle.hide();
				return;
			}

			pos = $this[0].getBoundingClientRect();
			rightOffset = pos.right - 100;

			if ( self.currentlyDragging ) {
				return false;
			}

			// Save the current row.
			self.$currentRow = $this;

			self.$topHandle.css( {
				top: pos.top - 1,
				left: rightOffset
			} );

			self.$bottomHandle.css( {
				top: pos.bottom - self.handleOffset + 1,
				left: rightOffset
			} );

			self.$topHandle.show();
			self.$bottomHandle.show();
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

			self.$topHandle.hide();
			self.$bottomHandle.hide();
		}
	};

	self = BOLDGRID.EDITOR.RESIZE.Row;
} )( jQuery );
