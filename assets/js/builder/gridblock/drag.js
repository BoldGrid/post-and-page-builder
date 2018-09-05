window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

/**
 * Handles adding gridblocks.
 */
( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR,
		self = {
			$body: $( 'body' ),
			$window: $( window ),
			$dragHelper: null,
			currentDrag: null,
			$mceContainer: null,

			/**
			 * Initialize the drag.
			 *
			 * @since 1.4
			 */
			init: function() {
				self.$mceContainer = BG.Controls.$container;
				self.$dragHelper = self.createDragHelper();
				self.bindEvents();
			},

			/**
			 * Create drag helper.
			 *
			 * @since 1.4
			 */
			createDragHelper: function() {
				var $dragHelper = $( '<div id="boldgrid-drag-pointer"></div>' ).hide();
				self.$body.append( $dragHelper );
				return $dragHelper;
			},

			/**
			 * Bind all events.
			 *
			 * @since 1.4
			 */
			bindEvents: function() {
				var exit = function() {
					return false;
				};

				// Bind mouse event to the parent.
				$( 'html' )
					.on( 'dragstart', '.gridblock', exit )
					.on( 'mousemove', '.section-dragging-active', self.mouseMove )
					.on( 'mouseup', '.section-dragging-active', self.endDrag )
					.on( 'mouseleave', '.section-dragging-active', self.endDrag )
					.on( 'mousedown', 'body.boldgrid-zoomout .gridblock', self.startDrag );

				// Bind event to the iframe.
				self.$mceContainer
					.on( 'mouseup', '.dragging-section.dragging-gridblock-iframe', self.endDrag )
					.on( 'mousemove', '.dragging-section.dragging-gridblock-iframe', self.overIframe )
					.on(
						'mouseenter',
						'.dragging-section.dragging-gridblock-iframe > body',
						self.enterIframeBody
					)
					.on( 'mouseleave', '.dragging-section.dragging-gridblock-iframe', self.leaveIframeBody );
			},

			/**
			 * Start iFrame dragging.
			 *
			 * @since 1.4
			 */
			enterIframeBody: function() {
				if ( ! BG.DRAG.Section.isDragging() ) {
					self.$mceContainer.find( 'body' ).append( self.currentDrag.$element );
					BG.Service.event.emit( 'blockDragEnter', self.currentDrag.$element );
					BG.DRAG.Section.startDrag( self.currentDrag.$element );
				}
			},

			/**
			 * When you leave mce html end mce drag and remove html.
			 *
			 * @since 1.4
			 */
			leaveIframeBody: function() {
				if ( BG.DRAG.Section.isDragging() ) {
					BG.DRAG.Section.end();
					self.currentDrag.$element.detach();
				}
			},

			/**
			 * While mousing over iframe while this.drag initiated, the the parent drag helper.
			 *
			 * @since 1.4
			 */
			overIframe: function() {
				if ( self.currentDrag ) {
					self.$dragHelper.hide();
					BG.DRAG.Section.showDragHelper = true;
					BG.DRAG.Section.$dragHelper.show();
				}
			},

			/**
			 * End the dragging process on the parent. (Also ends child).
			 *
			 * @since 1.4
			 */
			endDrag: function() {
				if ( self.currentDrag ) {
					IMHWPB['tinymce_undo_disabled'] = false;
					BG.DRAG.Section.$dragHelper.hide();
					BG.DRAG.Section.showDragHelper = false;
					BG.DRAG.Section.end();
					self.$dragHelper.hide();
					self.installGridblock();
					self.$body.removeClass( 'section-dragging-active' );
					self.currentDrag.$gridblockUi.removeClass( 'dragging-gridblock' );
					self.$mceContainer.$html.removeClass( 'dragging-gridblock-iframe' );
					self.currentDrag = false;
				}
			},

			/**
			 * Swap the preview html with loading html.
			 *
			 * @since 1.4
			 */
			installGridblock: function() {
				if ( self.$mceContainer.$body.find( self.currentDrag.$element ).length ) {
					BG.GRIDBLOCK.Add.replaceGridblock(
						self.currentDrag.$element,
						self.currentDrag.gridblockId
					);
					self.currentDrag.$element.removeClass( 'dragging-gridblock-placeholder' );
				}
			},

			/**
			 * Start the drag process.
			 *
			 * @since 1.4
			 *
			 * @param  {DOMEvent} e [description]
			 */
			startDrag: function( e ) {
				var config,
					$this = $( this ),
					gridblockId = $this.attr( 'data-id' );

				if ( false === isTargetValid( e ) || BG.GRIDBLOCK.Generate.needsUpgrade( $this ) ) {
					return;
				}

				IMHWPB['tinymce_undo_disabled'] = true;
				config = BG.GRIDBLOCK.configs.gridblocks[gridblockId];
				self.currentDrag = {
					$gridblockUi: $this,
					gridblockId: gridblockId,
					gridblock: config,
					$element: config.getPreviewPlaceHolder()
				};

				// Add enable classes.
				self.currentDrag.$gridblockUi.addClass( 'dragging-gridblock' );
				self.$mceContainer.$html.addClass( 'dragging-gridblock-iframe' );
				self.currentDrag.$element.addClass( 'dragging-gridblock-placeholder' );
				self.$body.addClass( 'section-dragging-active' );

				// Init the helper for the process.
				BG.DRAG.Section.positionHelper( e, self.$dragHelper );
				self.$dragHelper.show();
			},

			/**
			 * When you mouse move within the parent.
			 *
			 * @since 1.4
			 *
			 * @param {DOMEvent} e
			 */
			mouseMove: function( e ) {
				self.$dragHelper.show();
				BG.DRAG.Section.$dragHelper.hide();
				BG.DRAG.Section.positionHelper( e, self.$dragHelper );
			}
		};

	/**
	 * Check if a drag start target is valid.
	 *
	 * @return {Boolean} Is Valid?
	 */
	function isTargetValid( e ) {
		var valid = true,
			$target = $( e.target || e.srcElement );

		if ( $target && $target.hasClass( 'add-gridblock' ) ) {
			valid = false;
		}

		return valid;
	}

	BG.GRIDBLOCK.Drag = self;
} )( jQuery );
