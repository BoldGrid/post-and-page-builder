window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Section = {
		$container: null,

		$popover: null,

		$currentSection: [],

		zoomSliderSettings: {
			min: 1,
			max: 6,
			defaultVal: 3
		},

		/**
		 * Init section controls.
		 *
		 * @since 1.2.7.
		 */
		init: function( $container ) {
			self.renderZoomTools();
			self.$container = $container;
			self.bindHandlers();
		},

		/**
		 * Bind all events.
		 *
		 * @since 1.2.7
		 */
		bindHandlers: function() {
			var $zoomControls = $( '.bg-zoom-controls' ),
				$zoomIn = $zoomControls.find( '.zoom-in' ),
				$zoomOut = $zoomControls.find( '.zoom-out' );

			BG.Service.popover.section.$element
				.find( '.move-sections' )
				.on( 'click', self.enableSectionDrag );
			$( '.exit-row-dragging, .bg-close-zoom-view' ).on( 'click', self.exitSectionDrag );
			$zoomIn.on( 'click', self.zoom.zoomIn );
			$zoomOut.on( 'click', self.zoom.zoomOut );
			$( window ).on( 'resize', self.updateHtmlSize );
		},

		/**
		 * Match the height of the HTML area and the body area.
		 *
		 * @since 1.2.7
		 */
		updateHtmlSize: function() {
			var rect, bodyHeight;

			if ( ! $( 'body' ).hasClass( 'boldgrid-zoomout' ) ) {
				return;
			}

			( rect = self.$container.$body[0].getBoundingClientRect() ),
				( bodyHeight = rect.bottom - rect.top + 50 );

			self.$container.find( 'html' ).css( 'max-height', bodyHeight );
			$( '#content_ifr' ).css( 'max-height', bodyHeight );
		},

		zoom: {
			change: function( change ) {
				var val = parseInt( self.$slider.slider( 'value' ) );
				self.$slider.slider( 'value', change( val ) ).trigger( 'change' );
			},
			zoomIn: function() {
				self.zoom.change( function( val ) {
					return val + 1;
				} );
			},
			zoomOut: function() {
				self.zoom.change( function( val ) {
					return val - 1;
				} );
			}
		},

		/**
		 * Render the controls for the zoomed view.
		 *
		 * @since 1.2.7
		 */
		renderZoomTools: function() {
			var template = wp.template( 'boldgrid-editor-zoom-tools' );
			$( '#wp-content-editor-tools' ).append( template() );
		},

		/**
		 * Exit section dragging mode.
		 *
		 * @since 1.2.7
		 */
		exitSectionDrag: function( e ) {
			var $body = $( 'body' ),
				$window = $( window ),
				$frameHtml = self.$container.find( 'html' );

			e.preventDefault();
			self.$container.validate_markup();
			self.$container.$body.find( '.loading-gridblock' ).remove();
			self.sectionDragEnabled = false;
			$body.removeClass( 'focus-on boldgrid-zoomout' );
			$frameHtml.removeClass( 'zoomout dragging-section' );
			self.$container.$body.attr( 'contenteditable', 'true' );
			BG.Controls.$menu.hide();
			self.$container.$body.css( 'transform', '' );
			$frameHtml.css( 'max-height', '' );
			$( '#content_ifr' ).css( 'max-height', '' );
			$( window ).trigger( 'resize' );

			$( 'html, body' ).animate(
				{
					scrollTop: $( '#postdivrich' ).offset().top
				},
				0
			);
		},

		/**
		 * Check if the user can use zoomout view..
		 *
		 * @since 1.4
		 */
		zoomDisabled: function() {
			if ( IMHWPB.WP_MCE_Draggable.instance && IMHWPB.WP_MCE_Draggable.instance.draggable_inactive ) {
				alert(
					'Add Block requires that BoldGrid Editing be enabled on this page. You can enable it by clicking the move icon ☩ on your editor toolbar.'
				);
				return true;
			}
		},

		/**
		 * Enable section dragging mode.
		 *
		 * @since 1.2.7
		 */
		enableSectionDrag: function() {
			var updateZoom;

			if ( self.zoomDisabled() ) {
				return;
			}

			BG.Panel.closePanel();
			$.fourpan.dismiss();
			self.sectionDragEnabled = true;
			self.$container.find( 'html' ).addClass( 'zoomout dragging-section' );
			self.$container.$body.removeAttr( 'contenteditable' );
			self.$slider = $( '.bg-zoom-controls .slider' );
			BG.Controls.$menu.addClass( 'section-dragging' );

			$( 'body' )
				.addClass( 'focus-on boldgrid-zoomout' )
				.find( '#wpadminbar' )
				.addClass( 'focus-off' );

			$( window )
				.trigger( 'resize' )
				.scrollTop( 0 );
			self.updateHtmlSize();
			BOLDGRID.EDITOR.GRIDBLOCK.Loader.firstOpen();
			BG.GRIDBLOCK.View.onOpen();

			updateZoom = function( val ) {
				self.removeZoomClasses();
				self.$container.$body.addClass( 'zoom-scale-' + val );
				self.updateHtmlSize();
			};

			self.$slider.slider( {
				min: self.zoomSliderSettings.min,
				max: self.zoomSliderSettings.max,
				value: self.zoomSliderSettings.defaultVal,
				orientation: 'vertical',
				range: 'max',
				change: function( event, ui ) {
					updateZoom( ui.value );
				},
				slide: function( event, ui ) {
					updateZoom( ui.value );
				}
			} );
		},

		/**
		 * Remove zoom classes from the body.
		 *
		 * @since 1.2.7
		 */
		removeZoomClasses: function() {
			self.$container.$body.removeClass( function( index, css ) {
				return ( css.match( /(^|\s)zoom-scale-\S+/g ) || [] ).join( ' ' );
			} );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.Section;
} )( jQuery );
