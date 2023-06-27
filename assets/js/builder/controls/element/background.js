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
		name: 'background',

		tooltip: 'Background',

		uploadFrame: null,

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

		elementType: '',

		isHoverImage: false,

		iconClasses: 'genericon genericon-picture',

		selectors: [ '.boldgrid-section', '.row', '[class*="col-md-"]', '.bg-box' ],

		availableEffects: [ 'background-parallax', 'background-fixed' ],

		availableHoverEffects: [ 'background-hover-fixed' ],

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

		init: function() {
			if ( this.loadLegacyControl() ) {
				BOLDGRID.EDITOR.Controls.registerControl( this );
			}
		},

		panel: {
			title: 'Background',
			height: '625px',
			width: '450px',
			noSlimScroll: true,
			scrollTarget: '.boldgrid-panel__content',
			sizeOffset: 0
		},

		/**
		 * Load Legacy Control
		 *
		 * This determines whether or not to load this control based on
		 * a set of conditions. This is run in legacy controls, and in new
		 * controls that have a legacy version.
		 *
		 * @since SINCEVERSION
		 *
		 * @return {boolean} Whether or not to load this control.
		 */
		loadLegacyControl() {
			var loadControl = false,
				minCrioVersion = '2.20.0',
				isCrio = BoldgridEditor.is_crio,
				themeIsGte;

			if ( ! isCrio ) {
				return false;
			}

			themeIsGte = semverGte( BoldgridEditor.theme_version, minCrioVersion )

			if ( themeIsGte ) {
				loadControl = true;
			}

			return loadControl;
		},

		/**
		 * Get the current target.
		 *
		 * @since 1.8.0
		 * @return {jQuery} Element.
		 */
		getTarget: function() {
			return self.$target;
		},

		/**
		 * When the user clicks on a menu item, update the available options.
		 *
		 * @since 1.8.0
		 */
		onMenuClick: function() {
			self.updateMenuOptions();
		},

		/**
		 * Update the avilable options in the background drop down.
		 *
		 * @since 1.8.0
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
		 * @since 1.8.0
		 */
		_setupMenuReactivate: function() {
			self.$menuItem.on( 'reactivate', self.updateMenuOptions );
		},

		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.8.0
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
		 * @since 1.8.0
		 *
		 * @param  {object} event DOM Event
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
		 * @since 1.8.0
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
		 * Setup Init.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			self.$menuItem = BG.Menu.$element.find( '[data-action="menu-background"]' );

			self._setupMenuReactivate();
			self._setupMenuClick();
		},

		/**
		 * Find out what type of element we're controlling the background of.
		 *
		 * @since 1.8.0
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
				template = wp.template( 'boldgrid-editor-background' )

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

			const bgRoot = createRoot( panel.$element.find( '.panel-body' ).get( 0 ) );

			const colorVariables = {
				'color-1': 'var(--color-1)',
				'color-2': 'var(--color-2)',
				'color-3': 'var(--color-3)',
				'color-4': 'var(--color-4)',
				'color-5': 'var(--color-5)',
				'color-neutral': 'var(--color-neutral )',
			};

			const savedColors = BoldgridEditor.saved_colors;

			const usedComponents = [
				{
					name: 'BoldgridBackgroundColor',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'dashicons dashicons-art',
					Component: null
				},
				{
					name: 'BoldgridBackgroundImage',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'dashicons dashicons-format-image',
					Component: null
				},
				{
					name: 'BoldgridHoverEffects',
					props: { colorVariables, savedColors, target: self.$target },
					navClass: 'fa fa-hand-pointer-o',
					Component: null
				}
			];

			return bgRoot.render(
				<BoldgridPanel type="background" usedComponents={usedComponents} target={self.$target} />
			);
		},

		mountReactComponents: function() {
			
		},


		controls: {
			get: function( control ) {
				if ( self.controls.hasOwnProperty( control ) ) {
					return self.controls[control];
				} else {
					return false;
				}
			},

			bgColor: {
				getTargetColors: function( $target ) {
					var bgColors = [],
						classList = $target.attr( 'class' ),
						colorClass = classList.match( /color-|(\d|neutral)-background-color/ ),
						dataAlpha = $target.attr( 'data-alpha' );

					// If the target has the new data-bgColorSet attribute, use that.
					if ( $target.attr( 'data-bgColorSet' ) ) {
						bgColors = JSON.parse( $target.attr( 'data-bgColorSet' ) );

						// If the target has a color palette overlay on a bg image, use that.
					} else if ( $target.attr( 'data-bg-overlaycolor' ) ) {
						bgColors = [
							[
								$target.attr( 'data-bg-overlaycolor-class' ) ?
									$target.attr( 'data-bg-overlaycolor-class' ) :
									$target.attr( 'data-bg-overlaycolor' ),
								$target.attr( 'data-bg-overlaycolor-alpha' ),
								0
							]
						];

						// If the target has a gradient, use that.
					} else if ( $target.attr( 'data-bg-color-1' ) ) {
						bgColors = [
							[ $target.attr( 'data-bg-color-1' ), 1, 0 ],
							[ $target.attr( 'data-bg-color-2' ), 1, 1 ]
						];

						// If the target has a color class, use that.
					} else if ( colorClass ) {
						bgColors = [ [ colorClass[1], 'undefined' !== typeof dataAlpha ? dataAlpha : 1, 0 ] ];

						// Else use the background-color property.
					} else {
						bgColors = [ [ $target.css( 'background-color' ), 1, 0 ] ];
					}

					return bgColors;
				},

				normalizeColor: function( color ) {
					var normalizedColor = color.replace( /\s/g, '' );

					normalizedColor = normalizedColor.replace( /var\(--color-(\d|neutral)\)/g, '$1' );

					return normalizedColor;
				},

				getColorType: function( color ) {
					if ( color.match( /^rgb/ ) || color.match( /^#/ ) || color.match( /^hsl/ ) ) {
						return 'color';
					} else {
						return 'class';
					}
				},
				renderColorControl: function( colorArray, index ) {
					var color = self.controls.bgColor.normalizeColor( colorArray[0] ),
						alpha = colorArray[1],
						position = colorArray[2],
						colorType = self.controls.bgColor.getColorType( color ),
						$control;

					if ( 'class' === colorType ) {
						color = `rgba( var(--color-${color}-raw), ${alpha} )`;
					}

					$control = $(
						`<li>
								<span class="dashicons dashicons-move"></span>
								<label for="bg-color-${index}" class="color-preview" style="background-color:${color}"></label>
								<input type="text" data-property="background-color" name="bg-color-${
									index
								}" class="color-control" value="${color}" data-type="${color}">
								<input type="number" name="bg-color-position-${
									index
								}" min="0" max="1" step="0.05" class="gradient-position-control" value="${
							position
						}">
								<input type="hidden" name="bg-color-alpha-${position}" class='color-alpha-control' value="${alpha}">
								<span data-bg-color-pos="${position}" class="dashicons dashicons-trash"></span>
							</li>`
					);

					return $control;
				},
				render: function() {
					var $target = self.$target,
						bgColorControls = self.controls.bgColor,
						targetColors = bgColorControls.getTargetColors( $target ),
						$controls = $(
							`<div class="bg-color-control">
							'<ul class="ui-sortable"></ul>'
							</div>`
						);

					targetColors.forEach( ( color, index ) => {
						$controls.find( 'ul' ).append( bgColorControls.renderColorControl( color, index ) );
					} );

					return $controls.get( 0 ).outerHTML;
				}
			},
			bgGradient: {
				render: () => {
					return '<div class="bg-gradient-control"></div>';
				},
				mount: ($section) => {
					
				}
			},
			bgImage: {
				render: () => {
					return 'background-image';
				},
			},
			bgBlending: {
				render: function() {
					return 'background-image';
				}
			}
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Background.init();
	self = BOLDGRID.EDITOR.CONTROLS.Background;

	if ( ! self.loadLegacyControl() ) {
		delete BOLDGRID.EDITOR.CONTROLS.Background;
	}
} )( jQuery );
