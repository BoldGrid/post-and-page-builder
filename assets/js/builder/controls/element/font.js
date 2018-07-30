window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

import { Typography } from '@boldgrid/controls';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Font = {
		name: 'font',

		tooltip: 'Font',

		priority: 30,

		iconClasses: 'fa fa-text-width',

		selectors: [ 'p, h1, h2, h3, h4, h5, h6, table, section, ul, ol, dl', 'blockquote' ],

		// Ignore images clicked in paragraphs.
		exceptionSelector: 'img, .draggable-tools-imhwpb *',

		templateMarkup: null,

		fontClasses: [
			'bg-font-family-alt',
			'bg-font-family-body',
			'bg-font-family-heading',
			'bg-font-family-menu'
		],

		disabledTextContrast: true,

		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		panel: {
			title: 'Text Setting',
			height: '625px',
			width: '375px',
			includeFooter: true,
			customizeLeaveCallback: true,
			customizeSupport: [
				'width',
				'margin',
				'padding',
				'box-shadow',
				'border',
				'border-radius',
				'animation',
				'background-color',
				'blockAlignment',
				'device-visibility',
				'customClasses'
			],
			customizeCallback: true
		},

		/**
		 * Constructor.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			this.mergeFontClasses();
			self.bindFontCollpase();

			BG.CONTROLS.GENERIC.Fontcolor.bind();
		},

		/**
		 * Merge predefined font families with font families provided by the theme.
		 *
		 * @since 1.7.5
		 */
		mergeFontClasses() {
			self.fontClasses = self.fontClasses.concat(
				Object.keys( BoldgridEditor.builder_config.theme_fonts )
			);
			self.fontClasses = _.unique( self.fontClasses );
		},

		/**
		 * When scrolling on window with font family open, collapse font family.
		 *
		 * @since 1.3
		 */
		bindFontCollpase: function() {
			var hideFamilySelect = _.debounce( function() {
				var $fontFamily = $( '.font-family-dropdown' );
				if ( $fontFamily.hasClass( 'ui-selectmenu-open' ) ) {
					$fontFamily.removeClass( 'ui-selectmenu-open' );
				}
			}, 50 );

			$( window ).on( 'scroll', hideFamilySelect );
		},

		/**
		 * Get the fonts used by the theme.
		 *
		 * @since 1.2.7
		 */
		getThemeFonts: function() {
			var themeFonts = [];

			if ( -1 !== BoldgridEditor.builder_config.theme_features.indexOf( 'theme-fonts-classes' ) ) {
				themeFonts = BoldgridEditor.builder_config.theme_fonts;
			}

			return themeFonts;
		},

		/**
		 * Open panel when clicking on menu item.
		 *
		 * @since 1.2.7
		 */
		onMenuClick: function() {
			self.openPanel();
		},

		/**
		 * When the user clicks on an image, if the panel is open, set panel content.
		 *
		 * @since 1.2.7
		 */
		elementClick: function( e ) {
			if ( BOLDGRID.EDITOR.Panel.isOpenControl( this ) ) {
				self.openPanel();

				if ( BG.Panel.$element.find( '[for="font-color"]' ).is( ':visible' ) ) {
					e.boldgridRefreshPanel = true;
					BG.CONTROLS.Color.$currentInput = BG.Panel.$element.find( 'input[name="font-color"]' );
				}
			}
		},

		/**
		 * If the user is controlling the font of a button, don't display color.
		 *
		 * @since 1.2.8
		 */
		_hideButtonColor: function() {
			var $clone,
				buttonQuery = '> .btn, > .button-primary, > .button-secondary, > a',
				$colorPreview = BG.Panel.$element.find( '.presets .font-color-control' ),
				$target = BG.Menu.getTarget( self );

			$clone = $target.clone();
			$clone.find( buttonQuery ).remove();

			// If removing all buttons, results in an empty string or white space.
			if ( ! $clone.text().replace( / /g, '' ).length && $target.find( buttonQuery ).length ) {

				// Hide color control.
				$colorPreview.hide();
			}
		},

		/**
		 * Open all panels.
		 *
		 * @since 1.2.7
		 */
		openPanel: function() {
			var panel = BG.Panel,
				$target = BG.Menu.getTarget( self );

			let typography = new Typography( { target: $target } );

			// Remove all content from the panel.
			panel.clear();
			let $wrap = $( '<div class="choices supports-customization"><div class="presets">' );
			$wrap.find( '.presets' ).html( typography.render() );
			panel.$element.find( '.panel-body' ).html( $wrap );

			self._hideButtonColor();

			// Open Panel.
			panel.open( self );
			panel.scrollTo( 0 );
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Font.init();
	self = BOLDGRID.EDITOR.CONTROLS.Font;
} )( jQuery );
