window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

// Import Semver.
import { gte as semverGte } from 'semver';

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

		panelSections: [
			{
				name: 'background-color',
				controlId: 'bgColor'
			},
			{
				name: 'background-image',
				controlId: 'bgImage'
			},
			{
				name: 'background-blending',
				controlId: 'bgBlending'
			},
			{
				name: 'unknown',
				controlId: 'bgUnknown'
			}
		],

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
			scrollTarget: '.presets',
			customizeSupport: [
				'margin',
				'padding',
				'border',
				'width',
				'box-shadow',
				'animation',
				'border-radius',
				'blockAlignment',
				'device-visibility',
				'customClasses'
			],
			sizeOffset: -230
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
				themeIsGte = semverGte( BoldgridEditor.theme_version, minCrioVersion );

			if ( isCrio && themeIsGte ) {
				loadControl = true;
			}

			console.log( {
				loadControl,
				isCrio,
				themeIsGte,
				minCrioVersion
			} );

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
		 * Open the editor panel for a given selector and stor element as target.
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
			self._setupCustomizeLeave();
			self._setupCustomization();
		},

		/**
		 * Bind Event: Clicking Settings.
		 *
		 * @since 1.2.7
		 */
		_setupCustomization: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.current-selection .settings .panel-button.customizer', function(
				e
			) {
				e.preventDefault();
				self.openCustomization();
			} );
		},

		/**
		 * Bind Event: When the user leaves customization.
		 *
		 * @since 1.2.7
		 */
		_setupCustomizeLeave: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.background-design .back .panel-button', function( e ) {
				e.preventDefault();

				panel.$element.find( '.preset-wrapper' ).show();
				panel.$element.find( '.background-design .customize' ).hide();
				panel.initScroll();
				panel.scrollToSelected();
				BG.Service.customize.navigation.disable();
			} );
		},

		/**
		 * Open the customization view.
		 *
		 * @since 1.2.7
		 */
		openCustomization: function() {
			var dataType = BG.Panel.$element.find( '.current-selection' ).attr( 'data-type' );

			BG.Panel.$element.find( '.preset-wrapper' ).hide();
			BG.Panel.$element.find( '.background-design .customize' ).show();
			BG.Panel.$element.find( '.preset-wrapper' ).attr( 'data-type', dataType );
			BG.Panel.enterCustomization();
			BG.Panel.customizeOpenEvent();

			BG.Panel.createScrollbar( '.customize', {
				height: self.panel.height
			} );
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
				template = wp.template( 'boldgrid-editor-background' ),
				navItems = self.getNavItems();

			self.$target = $target;

			self.initPanelSections();

			console.log( { panelSections: self.panelSections } );

			// Remove all content from the panel.
			panel.clear();

			panel.$element.find( '.panel-body' ).html(
				template( {
					navItems: navItems,
					panelSections: self.panelSections
				} )
			);

			self.setElementType();

			self.bindNavItems();

			panel.$element.find( '.ui-sortable' ).sortable( {
				handle: '.dashicons-move'
			} );

			// Open Panel.
			panel.open( self );
		},

		initPanelSections: function() {
			for ( let i = self.panelSections.length - 1; 0 <= i; i-- ) {
				let section = self.panelSections[i],
					control = self.controls.get( section.controlId );

				if ( control ) {
					self.panelSections[i].control = self.controls.get( section.controlId );
					self.panelSections[i].content = self.controls.get( section.controlId ).render();
				} else {
					self.panelSections.splice( i, 1 );
				}
			}
		},

		bindNavItems() {
			var panel = BG.Panel,
				$navItems = panel.$element.find( '.background-nav-item' ),
				$panelSections = panel.$element.find( '.background-panel-section' );

			$navItems.removeClass( 'active' );
			$panelSections.removeClass( 'active' );

			$navItems.first().addClass( 'active' );
			$panelSections
				.filter( `[data-nav-target="${$navItems.first().attr( 'data-nav-target' )}"]` )
				.addClass( 'active' );

			$navItems.on( 'click', function() {
				var $clickedItem = $( this );
				$navItems.removeClass( 'active' );
				$clickedItem.addClass( 'active' );

				$panelSections.removeClass( 'active' );
				$panelSections
					.filter( `[data-nav-target="${$clickedItem.attr( 'data-nav-target' )}"]` )
					.addClass( 'active' );
			} );
		},

		getNavItems: function() {
			return [
				{
					target: 'background-color',
					label: 'Background Color',
					icon: 'color-picker'
				},
				{
					target: 'background-image',
					label: 'Background Image',
					icon: 'format-image'
				},
				{
					target: 'background-blending',
					label: 'Background Blending',
					icon: 'image-filter'
				}
			];
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

					console.log( 'color w/ no spaces: ' + normalizedColor );

					normalizedColor = normalizedColor.replace( /var\(--color-(\d|neutral)\)/g, '$1' );

					console.log( 'color after replace: ' + normalizedColor );

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

					console.log( { colorArray, color, alpha, position, index } );

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

					console.log( { targetColors: targetColors, $controls } );

					return $controls.get( 0 ).outerHTML;
				}
			},
			bgImage: {
				render: function() {
					return 'background-image';
				}
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
