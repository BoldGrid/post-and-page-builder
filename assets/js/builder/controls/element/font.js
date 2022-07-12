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

		selectors: [
			'p, h1, h2, h3, h4, h5, h6, a, table, section, ul, ol, dl, blockquote, .boldgrid-shortcode, .bgc-heading *'
		],

		// Ignore images clicked in paragraphs.
		exceptionSelector:
			'.boldgrid-component-menu *, .bgc-header-template-menu, .menu-item a, .boldgrid-component-logo, img, .draggable-tools-imhwpb *',

		templateMarkup: null,

		allowNested: true,

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
			BG.CONTROLS.GENERIC.Fontcolor.bind();
		},

		/**
		 * Get the fonts used by the theme.
		 *
		 * @since 1.8.0
		 */
		getThemeFontsConfig: function() {
			var themeFonts = false;

			if (
				-1 !== BoldgridEditor.builder_config.theme_features.indexOf( 'theme-fonts-classes' ) &&
				0 !== BoldgridEditor.builder_config.theme_fonts.length
			) {
				themeFonts = {
					sectionName: 'Theme Fonts',
					type: 'class',
					options: {}
				};

				_.each( BoldgridEditor.builder_config.theme_fonts, ( name, className ) => {
					themeFonts.options[name] = {
						class: className
					};
				} );
			}

			return themeFonts;
		},

		/**
		 * Get the configuration of used fonts.
		 *
		 * @since 1.8.0
		 *
		 * @return {Object} Configuration of fonts.
		 */
		getUsedFontsConfig() {
			let usedFontConfig = false,
				usedFonts = BoldgridEditor.builder_config.components_used.font || [];

			if ( usedFonts.length ) {
				usedFontConfig = {
					sectionName: 'Used Fonts',
					type: 'inline',
					options: {}
				};

				_.each( usedFonts, name => {
					usedFontConfig.options[name] = {};
				} );
			}

			return usedFontConfig;
		},

		/**
		 * Create a configuration of fonts to be added tp the control config.
		 *
		 * @since 1.8.0
		 *
		 * @return {array} Font Configurations.
		 */
		createFontConfig: function() {
			let fonts = [],
				themeFonts = self.getThemeFontsConfig(),
				usedFonts = self.getUsedFontsConfig();

			if ( themeFonts ) {
				fonts.push( themeFonts );
			}

			if ( usedFonts ) {
				fonts.push( usedFonts );
			}

			return fonts;
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
				buttonQuery = '> .btn, > .button-primary, > .button-secondary',
				$colorPreview = BG.Panel.$element.find( '.presets .font-color-control' ),
				$target = BG.Menu.getTarget( self );

			$clone = $target.clone();
			$clone.find( buttonQuery ).remove();

			// If removing all buttons, results in an empty string or white space.
			if ( ! $clone.text().replace( / /g, '' ).length && $target.find( buttonQuery ).length ) {

				// Hide color control.
				$colorPreview.hide();
			} else {
				$colorPreview.show();
			}
		},

		/**
		 * Open all panels.
		 *
		 * @since 1.2.7
		 */
		openPanel: function() {
			var panel = BG.Panel;
			let typography = new Typography( {
				target: BG.Menu.getTarget( self ),
				fonts: self.createFontConfig()
			} );

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
