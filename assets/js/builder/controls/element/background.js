/* eslint.global-strict: 0 */
window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

// Import Semver.
import { gte as semverGte } from 'semver';
import { createRoot } from '@wordpress/element';
import { BoldgridPanel } from 'boldgrid-panel';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Background = {
		/**
		 * Name.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		name: 'background',

		/**
		 * Tooltip.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		tooltip: 'Background',

		/**
		 * Priority.
		 * 
		 * @since 1.25.0
		 * @type {number}
		 */
		priority: 10,

		/**
		 * Currently controlled element.
		 *
		 * @type {$} Jquery Element.
		 */
		$target: null,

		/**
		 * Tracking of clicked elements.
		 * @type {Object}
		 */
		layerEvent: { latestTime: 0, targets: [] },

		/**
		 * Element Type.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		elementType: '',

		/**
		 * Icon Classes
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		iconClasses: 'genericon genericon-picture',

		/**
		 * Selectors.
		 * 
		 * @since 1.25.0
		 * @type {Array<string>}
		 */
		selectors: [ '.boldgrid-section', '.row', '[class*="col-md-"]', '.bg-box' ],

		/**
		 * Menu Dropdown Config.
		 * 
		 * @since 1.25.0
		 * @type {Object<title: string, options: Array<Object<name: string, class: string>>>}
		 */
		menuDropDown: {
			title: 'Background',
			options: [
				{
					name: 'Section',
					class: 'action section-background'
				},
				{
					name: 'Row',
					class: 'action row-background'
				},
				{
					name: 'Column',
					class: 'action column-background'
				},
				{
					name: 'Column Shape',
					class: 'action column-shape-background'
				}
			]
		},

		/**
		 * Panel Config.
		 * 
		 * @since 1.25.0
		 * 
		 * @type {Object<title: string, height: string, width: string, noSlimScroll: boolean, scrollTarget: string, sizeOffset: number>}
		 */
		panel: {
			title: 'Background',
			height: '625px',
			width: '450px',
			noSlimScroll: true,
			scrollTarget: '.panel-body',
			sizeOffset: 0
		},

		/**
		 * Control Init
		 * 
		 * @since 1.25.0
		 */
		init: function() {
			if ( this.loadLegacyControl() ) {
				BOLDGRID.EDITOR.Controls.registerControl( this );
			}
		},

		/**
		 * Load Legacy Control
		 *
		 * This determines whether or not to load this control based on
		 * a set of conditions. This is run in legacy controls, and in new
		 * controls that have a legacy version.
		 *
		 * @since 1.25.0
		 *
		 * @return {boolean} Whether or not to load this control.
		 */
		loadLegacyControl() {
			var minCrioVersion = '2.20.0', // Crio 2.20.0 is the first version to support the new BG control.
				isCrio         = BoldgridEditor.is_crio;

			// If the theme is not Crio, don't load this control.
			if ( ! isCrio ) {
				return false;
			}

			// If the theme is Crio, and the version is greater than or equal to the minimum version, load this control.
			if ( semverGte( BoldgridEditor.theme_version, minCrioVersion ) ) {
				return true;
			}

			return false;
		},

		/**
		 * Get the current target.
		 *
		 * @since 1.25.0
		 *
		 * @return {jQuery} Element.
		 */
		getTarget: function() {
			return self.$target;
		},

		/**
		 * When the user clicks on a menu item, update the available options.
		 *
		 * @since 1.25.0
		 */
		onMenuClick: function() {
			self.updateMenuOptions();
		},

		/**
		 * Update the avilable options in the background drop down.
		 *
		 * @since 1.25.0
		 */
		updateMenuOptions: function() {
			let availableOptions = [];

			for ( let target of self.layerEvent.targets ) {
				availableOptions.push( self.checkElementType( $( target ) ) );
			}

			self.$menuItem.attr( 'data-available-options', availableOptions.join( ',' ) );
		},

		/**
		 * When a menu item is reopened because a user clicked on another similar element
		 * Update the available options.
		 *
		 * @since 1.25.0
		 */
		_setupMenuReactivate: function() {
			self.$menuItem.on( 'reactivate', self.updateMenuOptions );
		},

		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.25.0
		 *
		 * @param  {string} selector Selector.
		 */
		open( selector ) {
			for ( let target of self.layerEvent.targets ) {
				let $target = $( target );
				if ( $target.is( selector ) ) {
					self.openPanel( $target );
				}
			}
		},

		/**
		 * When the user clicks on an element within the mce editor record the element clicked.
		 *
		 * @since 1.25.0
		 *
		 * @param  {MouseEvent} event DOM Event
		 */
		elementClick( event ) {
			if ( self.layerEvent.latestTime !== event.timeStamp ) {
				self.layerEvent.latestTime = event.timeStamp;
				self.layerEvent.targets = [];
			}

			self.layerEvent.targets.push( event.currentTarget );
		},

		/**
		 * Bind each of the sub menu items.
		 *
		 * @since 1.25.0
		 */
		_setupMenuClick() {
			BG.Menu.$element
				.find( '.bg-editor-menu-dropdown' )
				.on( 'click', '.action.column-background', () => self.open( '[class*="col-md"]' ) )
				.on( 'click', '.action.column-shape-background', () => self.open( '.bg-box' ) )
				.on( 'click', '.action.row-background', () => self.open( '.row' ) )
				.on( 'click', '.action.section-background', () => self.open( '.boldgrid-section' ) );
		},

		/**
		 * Setup Legacy Hover Boxes.
		 * 
		 * In order for hover boxes created in the old
		 * method to be shown in the editor, we still
		 * have to set them up here.
		 *
		 * @since 1.25.0
		 */
		_setupLegacyHoverBoxes() {
			var css         = '',
				$head       = $( tinyMCE.activeEditor.iframeElement )
					.contents()
					.find( 'head' ),
				$body       = $( tinyMCE.activeEditor.iframeElement )
					.contents()
					.find( 'body' ),
				$hoverBoxes = $body.find( '.has-hover-bg' );

			$hoverBoxes.each( ( index, hoverBox ) => {
				var $hoverBox     = $( hoverBox ),
					hoverBoxClass = $hoverBox.attr( 'data-hover-bg-class' ),
					hoverBgUrl    = $hoverBox.attr( 'data-hover-image-url' ),
					hoverOverlay  = $hoverBox.attr( 'data-hover-bg-overlaycolor' ),
					hoverBgSize   = $hoverBox.attr( 'data-hover-bg-size' ),
					hoverBgSize   = hoverBgSize ? hoverBgSize : 'cover',
					hoverBgPos    = $hoverBox.attr( 'data-hover-bg-position' ),
					hoverBgPos    = hoverBgPos ? hoverBgPos : '50',
					hoverBgColor  = $hoverBox.attr( 'data-hover-bg-color' );

				if ( 'cover' === hoverBgSize ) {
					hoverBgSize =
						'background-size: cover !important; background-repeat: "unset  !important";';
				} else {
					hoverBgSize =
						'background-size: auto auto !important; background-repeat: repeat  !important;';
				}

				if ( hoverOverlay && hoverBgUrl ) {
					css  = `.${hoverBoxClass}:hover {`;
					css += `background-image: linear-gradient(to left, ${hoverOverlay}, ${
						hoverOverlay
					} ), url('${hoverBgUrl}') !important; }`;
					$head.append( `<style id="${hoverBoxClass}-image">${css}</style>` );

					css = `.${hoverBoxClass}:hover { background-position: 50% ${hoverBgPos}% !important; }`;
					$head.append( `<style id="${hoverBoxClass}-position">${css}</style>` );

					css = `.${hoverBoxClass}:hover { ${hoverBgSize} }`;
					$head.append( `<style id="${hoverBoxClass}-bg-size">${css}</style>` );
				} else if ( hoverBgUrl ) {
					css  = `.${hoverBoxClass}:hover {`;
					css += `background-image: url('${hoverBgUrl}') !important; }`;
					$head.append( `<style id="${hoverBoxClass}-image">${css}</style>` );

					css = `.${hoverBoxClass}:hover { background-position: 50% ${hoverBgPos}% !important; }`;
					$head.append( `<style id="${hoverBoxClass}-position">${css}</style>` );

					css = `.${hoverBoxClass}:hover { ${hoverBgSize} }`;
					$head.append( `<style id="${hoverBoxClass}-bg-size">${css}</style>` );
				}

				if ( hoverBgColor && hoverBgUrl ) {
					css = `.${hoverBoxClass}:hover { background-color: ${hoverBgColor} !important; }`;
					$head.append( `<style id="${hoverBoxClass}-bg-color">${css}</style>` );
				} else if ( hoverBgColor && ! hoverBgUrl ) {
					css = `.${hoverBoxClass}:hover { background-color: ${hoverBgColor} !important; }`;
					$head.append( `<style id="${hoverBoxClass}-bg-color">${css}</style>` );

					css = `.${hoverBoxClass}:hover {background-image: unset !important; }`;
					$head.append( `<style id="${hoverBoxClass}-image">${css}</style>` );
				}

				css = '@media screen and (max-width: 991px) {';
				if ( hoverBoxClass && hoverBgUrl && hoverOverlay ) {
					let overlayImage = 'linear-gradient(to left, ' + hoverOverlay + ', ' + hoverOverlay + ')';
					let hoverCss = overlayImage + ', url("' + hoverBgUrl + '")';
					css += `.${hoverBoxClass}.hover-mobile-bg {background-image: ${hoverCss} !important; }`;
					css += `.${hoverBoxClass}.hover-mobile-bg:hover {background-image: ${
						hoverCss
					} !important; }`;
				} else if ( hoverBoxClass && ! hoverBgUrl && hoverBgColor ) {
					css += `.${hoverBoxClass}.hover-mobile-bg {
						background-color: ${hoverBgColor} !important;
						background-image: none !important;
					}`;
				} else {
					css += `.${hoverBoxClass}.hover-mobile-bg { background-image: url('${
						hoverBgUrl
					}') !important; } }`;
				}
				$head.append( `<style id="${hoverBoxClass}-mobile-image">${css}</style>` );
			} );
		},

		/**
		 * Setup Init.
		 *
		 * @since 1.25.0
		 */
		setup: function() {
			self.$menuItem = BG.Menu.$element.find( '[data-action="menu-background"]' );

			self._setupLegacyHoverBoxes();
			self._setupMenuReactivate();
			self._setupMenuClick();
		},

		/**
		 * Find out what type of element we're controlling the background of.
		 *
		 * @since 1.25.0
		 */
		setElementType: function() {
			self.elementType = this.checkElementType( self.$target );
			BG.Panel.$element.find( '.customize-navigation' ).attr( 'data-element-type', self.elementType );
			self.panel.targetType = self.elementType;
		},

		/**
		 * Determine the element type supported by this control.
		 *
		 * @since 1.8.0
		 *
		 * @param  {jQuery} $element Jquery Element.
		 * @return {string}          Element.
		 */
		checkElementType: function( $element ) {
			let type = '';
			if ( $element.hasClass( 'boldgrid-section' ) ) {
				type = 'section';
			} else if ( $element.hasClass( 'row' ) ) {
				type = 'row';
			} else if ( $element.hasClass( 'bg-box' ) ) {
				type = 'bg-box';
			} else {
				type = 'column';
			}

			return type;
		},

		/**
		 * Open Panel.
		 *
		 * @since 1.2.7
		 *
		 * @param $target Current Target.
		 */
		openPanel: function( $target ) {
			var panel = BG.Panel,
				template = wp.template( 'boldgrid-editor-background' ),
				selectedComponent = 'BoldgridBackgroundColor';

			self.$target = $target;

			// Remove all content from the panel.
			panel.clear();

			panel.$element.find( '.panel-body' ).html();

			self.setElementType();

			panel.$element.find( '.ui-sortable' ).sortable( {
				handle: '.dashicons-move'
			} );

			// Open Panel.
			panel.open( self );

			panel.$element.find( '.panel-body' ).append( '<div class="bg-background-react-container"></div>' );

			// This will be the element that the React App attaches to.
			const bgRoot = createRoot( panel.$element.find( '.bg-background-react-container' ).get( 0 ) );

			// TODO: Create a dynamic way of setting this to support other themes.
			const colorVariables = {
				'color-1': 'var(--color-1)',
				'color-2': 'var(--color-2)',
				'color-3': 'var(--color-3)',
				'color-4': 'var(--color-4)',
				'color-5': 'var(--color-5)',
				'color-neutral': 'var(--color-neutral )',
			};

			const savedColors = BoldgridEditor.saved_colors;

			// This ensures that the background image panel shows if there is a background image set.
			if ( self.$target.css( 'background-image' ).includes( 'url' ) ) {
				selectedComponent = 'BoldgridBackgroundImage';
			}

			const usedComponents = [
				{
					name: 'BoldgridBackgroundColor',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'dashicons dashicons-art',
					title: 'Background Color',
					Component: null
				},
				{
					name: 'BoldgridBackgroundImage',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'dashicons dashicons-format-image',
					title: 'Background Image',
					Component: null
				},
				{
					name: 'BoldgridHoverEffects',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'fa fa-hand-pointer-o',
					title: 'Hover Effects',
					Component: null
				}
			];

			return bgRoot.render(
				<BoldgridPanel type="background" selectedComponent={selectedComponent} usedComponents={usedComponents} target={self.$target} />
			);
		},
	};

	BOLDGRID.EDITOR.CONTROLS.Background.init();
	self = BOLDGRID.EDITOR.CONTROLS.Background;

	if ( ! self.loadLegacyControl() ) {
		delete BOLDGRID.EDITOR.CONTROLS.Background;
	}
} )( jQuery );
