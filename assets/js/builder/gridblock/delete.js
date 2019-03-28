window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR,
		self = {
			$mceContainer: null,
			$deleteIcon: null,

			/**
			 * Initialize the drag.
			 *
			 * @since 1.5
			 */
			init: function() {
				self.$mceContainer = BG.Controls.$container;
				self.$deleteIcon = self.$mceContainer.find( '.delete-icon-wrap' );
				self.bindEvents();
			},

			/**
			 * Bind all events.
			 *
			 * @since 1.5
			 */
			bindEvents: function() {
				self.$mceContainer
					.on( 'mouseenter', '.dragging-section .boldgrid-section', self.section.mouseEnter )
					.on( 'mouseleave', '.dragging-section .boldgrid-section', self.section.mouseLeave )
					.on( 'click', '.delete-icon-wrap', self.icon.click )
					.on( 'mouseenter', '.delete-icon-wrap', self.icon.mouseEnter )
					.on( 'mouseleave', '.delete-icon-wrap', self.icon.mouseLeave );
			},

			section: {

				/**
				 * When the users mouse enters the section.
				 */
				mouseEnter: function() {
					var $this = $( this ),
						$wrap = $this.closest( '.boldgrid-section-wrap' ),
						rect = this.getBoundingClientRect();

					self.$deleteIcon.css( {
						left: rect.right,
						display: 'block',
						top: rect.top + rect.height / 2
					} );

					self.$deleteIcon.$section = $wrap.length ? $wrap : $this;
				},

				/**
				 * When the users mouse leaves the section.
				 * @param  {event} e Event
				 */
				mouseLeave: function( e ) {
					var $relatedTarget = $( e.relatedTarget || e.toElement );
					if ( false === $relatedTarget.hasClass( 'delete-icon' ) ) {
						$( this ).removeClass( 'delete-overlay' );
						self.$deleteIcon.hide();
					}
				}
			},

			icon: {

				/**
				 * When the users mouse enters the icon.
				 */
				mouseEnter: function() {
					self.$deleteIcon.$section.addClass( 'delete-overlay' );
				},

				/**
				 * When the users mouse leaves the icon.
				 */
				mouseLeave: function() {
					self.$deleteIcon.$section.removeClass( 'delete-overlay' );
					self.$deleteIcon.hide();
				},

				/**
				 * When the user clicks on the delete icon.
				 */
				click: function() {
					self.$deleteIcon.$section.removeClass( 'delete-overlay' );
					self.$deleteIcon.hide();
					self.$deleteIcon.$section.remove();
					BOLDGRID.EDITOR.mce.undoManager.add();
					BG.GRIDBLOCK.Add.$window.trigger( 'resize' );
				}
			}
		};

	BG.GRIDBLOCK.Delete = self;
} )( jQuery );
