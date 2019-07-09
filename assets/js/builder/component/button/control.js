window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Button = {
		name: 'button',

		priority: 80,

		tooltip: 'Button Design',

		iconClasses: 'fa fa-cog',

		selectors: [ '.btn', 'a.button', 'a.button-secondary', 'a.button-primary' ],

		defaultColorClasses: [
			{
				color: '#eee',
				number: 0
			},
			{
				color: '#229ffd',
				number: 1
			},
			{
				color: '#ff414f',
				number: 2
			},
			{
				color: '#a5de37',
				number: 3
			},
			{
				color: '#feae1b',
				number: 4
			},
			{
				color: '#7b72e9',
				number: 5
			}
		],

		classes: [
			{ name: 'btn btn-3d btn-rounded' },
			{ name: 'btn btn-3d btn-pill' },
			{ name: 'btn btn-3d' },

			{ name: 'btn btn-raised btn-rounded' },
			{ name: 'btn btn-raised btn-pill' },
			{ name: 'btn btn-raised btn-small-caps' },

			{ name: 'btn btn-rounded btn-small-caps' },
			{ name: 'btn btn-pill' },
			{ name: 'btn' },

			{ name: 'btn btn-longshadow btn-rounded' },
			{ name: 'btn btn-longshadow btn-small-caps btn-pill' },
			{ name: 'btn btn-longshadow btn-uppercase' },

			{ name: 'btn btn-glow btn-rounded' },
			{ name: 'btn btn-glow btn-pill btn-uppercase' },
			{ name: 'btn btn-glow' },

			{ name: 'btn btn-block btn-rounded' },
			{ name: 'btn btn-block btn-pill' },
			{ name: 'btn btn-block btn-small-caps' }
		],

		sizeClasses: [
			'btn-tiny',
			'btn-small',

			// Normal.
			'',
			'btn-large',
			'btn-jumbo',
			'btn-giant'
		],

		init: function() {
			if ( BoldgridEditor.components.buttons ) {
				BOLDGRID.EDITOR.Controls.registerControl( this );
			}
		},

		/**
		 * Panel Settings.
		 *
		 * @since 1.2.7
		 */
		panel: {
			title: 'Button Design',
			height: '550px',
			width: '325px',
			includeFooter: true,
			customizeLeaveCallback: true,
			customizeCallback: true,
			customizeSupport: [
				'margin',
				'padding',
				'border',
				'box-shadow',
				'animation',
				'customClasses',
				'device-visibility'
			]
		},

		/**
		 * Setup Init.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			self.applyColors();
			self._setupPresetClick();
			self._setupColorClick();
			self._setupCustomizeOpen();
			self.removeSizeClasses();
			self.registerComponent();
		},

		/**
		 * Register the componet in the Add Components panel.
		 *
		 * @since 1.8.0
		 */
		registerComponent() {
			let config = {
				name: 'button',
				title: 'Button',
				type: 'design',
				icon: require( './icon.svg' ),
				onInsert: 'prependColumn',
				getDragElement: () => $( this.getTemplate() )
			};

			BG.Service.component.register( config );
		},

		/**
		 * Remove large size classes from the used components.
		 *
		 * @since 1.5
		 */
		removeSizeClasses: function() {
			var usedComponents = BoldgridEditor.builder_config.components_used.button;

			_.each( usedComponents, function( value, index ) {
				value.classes = value.classes.replace( /btn-(giant|jumbo)/g, '' );
				usedComponents[index] = value;
			} );

			// Eliminate duplicates
			usedComponents = _.uniq( usedComponents, false, function( comp ) {
				return comp.classes;
			} );

			// Only allow 20 button designs.
			BoldgridEditor.builder_config.components_used.button = usedComponents.slice( 0, 20 );
		},

		/**
		 * Bind Event: When customization opens.
		 *
		 * @since 1.2.7
		 */
		_setupCustomizeOpen: function() {
			var panel = BOLDGRID.EDITOR.Panel;

			panel.$element.on( 'bg-customize-open', function() {
				if ( panel.currentControl === self ) {
					self.sizeSlider.init();
					BG.Menu.getTarget( self ).removeClass( 'bg-control-element' );
				}
			} );
			panel.$element.on( 'bg-customize-exit', function() {
				if ( panel.currentControl === self ) {
					self.preselect();
					BG.Panel.scrollToSelected();
					self.toggleFooter();
				}
			} );
		},

		/**
		 * Remove all color classes from a button.
		 *
		 * @since 1.2.7
		 */
		removeColorClasses: function() {
			var $el = BG.Menu.getTarget( self );

			$el.removeClass( 'btn-neutral-color' );

			// Remove all classes that begin with btn-color.
			$el.removeClass( function( index, css ) {
				return ( css.match( /(^|\s)btn-color\S+/g ) || [] ).join( ' ' );
			} );
		},

		/**
		 * Bind Event: When a user clicks on button color.
		 *
		 * @since 1.2.7
		 */
		_setupColorClick: function() {
			BG.Panel.$element.on(
				'click',
				'.customize .button-color-controls .panel-selection',
				function() {
					var $this = $( this ),
						$target = BG.Menu.getTarget( self );

					self.removeColorClasses();
					$this.siblings().removeClass( 'selected' );
					$this.addClass( 'selected' );
					$target.addClass( 'btn-color-' + $this.attr( 'data-preset' ) );
				}
			);
		},

		/**
		 * Bind Event: When a user clicks on a preset panel selection.
		 *
		 * @since 1.2.7
		 */
		_setupPresetClick: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.button-design .presets .panel-selection', function() {
				var $this = $( this ),
					preset = $this.data( 'preset' ),
					$target = BG.Menu.getTarget( self );

				BG.Controls.addStyle( $target, 'border', '' );
				BG.Controls.addStyle( $target, 'box-shadow', '' );
				panel.clearSelected();
				$this.addClass( 'selected' );

				// Apply changes to editor.
				$target.attr( 'class', '' );
				$target.addClass( preset );
				self.toggleFooter();
			} );
		},

		/**
		 * Get a sample button.
		 *
		 * @since 1.8.0
		 */
		getTemplate: function() {
			let classes = BoldgridEditor.is_boldgrid_theme ? 'button-primary' : 'btn btn-color-1';
			return `<p><a class="${classes}" href="#">Button</a></p>`;
		},

		/**
		 * When the user clicks on menu, open panel.
		 *
		 * @since 1.2.7
		 */
		onMenuClick: function() {
			self.rewriteInvalidTarget();
			self.openPanel();
		},

		/**
		 * If this panel is panel is opened with a target parent, rewrite to the selector child.
		 *
		 * @since 1.8.0
		 */
		rewriteInvalidTarget: function() {
			let $target = BG.Menu.getTarget( self ),
				selectors = self.selectors.join( ',' );

			if ( ! $target.is( selectors ) ) {
				$target = $target.find( selectors ).first();
				BG.Controls.$menu.targetData[self.name] = $target;
			}
		},

		/**
		 * When the user clicks on an image, if the panel is open, set panel content.
		 *
		 * @since 1.2.7
		 */
		elementClick: function() {
			if ( BOLDGRID.EDITOR.Panel.isOpenControl( this ) ) {
				self.openPanel();
			}
		},

		/**
		 * Apply coilor to the buttons.
		 *
		 * @since 1.2.7
		 */
		applyColors: function() {
			var currentIndex,
				maxIndex = 5,
				minIndex = 0;

			// BG Themes.
			if ( BoldgridEditor.colors.defaults.length ) {
				maxIndex = BoldgridEditor.colors.defaults.length;
				minIndex = 1;
			}

			currentIndex = minIndex;

			$.each( self.classes, function( count ) {
				if ( maxIndex < currentIndex ) {
					currentIndex = minIndex;
				}

				// Adds Default color, which has no class.
				if ( 0 !== currentIndex ) {
					this.name += ' btn-color-' + currentIndex;
				}

				if ( 0 === ( count + 1 ) % 4 ) {
					currentIndex++;
				}
			} );
		},

		/**
		 * Init size slider.
		 *
		 * @since 1.2.7
		 */
		sizeSlider: {
			getDefault: function() {
				var defaultIndex = 2,
					$el = BG.Menu.getCurrentTarget();

				$.each( self.sizeClasses, function( index ) {
					if ( $el.hasClass( this ) ) {
						defaultIndex = index;
						return false;
					}
				} );

				return defaultIndex;
			},
			init: function() {
				var defaultSize = this.getDefault() + 1,
					$el = BG.Menu.getCurrentTarget();

				BG.Panel.$element.find( '.section.button-size-control .value' ).html( defaultSize );
				BG.Panel.$element.find( '.section.button-size-control .slider' ).slider( {
					min: 1,
					max: 6,
					value: defaultSize,
					range: 'max',
					slide: function( event, ui ) {

						//Remove Classes
						$el.removeClass( self.sizeClasses.join( ' ' ) );
						if ( ui.value ) {
							$el.addClass( self.sizeClasses[ui.value - 1] );
						}
					}
				} );
			}
		},

		/**
		 * Get colors for buttons.
		 *
		 * @since 1.2.7
		 */
		getColorsMarkup: function() {
			var colors = self.defaultColorClasses;

			if (
				( BoldgridEditor.features.button_colors && ! BoldgridEditor.is_boldgrid_theme ) ||
				BG.Controls.hasThemeFeature( 'button-lib' )
			) {
				colors = BG.CONTROLS.Color.getColorsFormatted();
			}

			return BG.CONTROLS.Color.colorTemplate( {
				colors: colors,
				customColors: []
			} );
		},

		/**
		 * Select the currently focused button.
		 * Must match all class names.
		 *
		 * @since 1.2.7
		 */
		preselect: function() {
			var $target = BG.Menu.getTarget( self ),
				classes = BG.Util.getClassesLike( $target, 'btn' );

			// Exclude Size Classes.
			classes = $( '<div>' )
				.addClass( classes.join( ' ' ) )
				.removeClass( 'bg-control-element ' + self.sizeClasses.join( ' ' ) )
				.attr( 'class' );

			if ( $target.hasClass( 'button-primary' ) ) {
				classes = 'button-primary';
			} else if ( $target.hasClass( 'button-secondary' ) ) {
				classes = 'button-secondary';
			}

			BG.Panel.clearSelected();
			BG.Panel.$element.find( '[data-preset="' + classes + '"]:first' ).addClass( 'selected' );
		},

		/**
		 * Control the display of the customize option in the panel footer.
		 *
		 * @since 1.2.7
		 */
		toggleFooter: function() {
			var $target = BG.Menu.getTarget( self );

			if ( $target.hasClass( 'btn' ) ) {
				BG.Panel.showFooter();
			} else {
				BG.Panel.hideFooter();
			}
		},

		/**
		 * Add buttons that exist on the page to list of used components. This will populate "My Designs".
		 *
		 * @since 1.2.7
		 */
		_updateMyDesigns: function() {
			self.usedComponents = BoldgridEditor.builder_config.components_used.button.slice( 0 );

			BG.Controls.$container.$body.find( '.btn' ).each( function() {
				var $this = $( this ),
					$clone = $this.clone().removeClass( 'bg-control-element ' + self.sizeClasses.join( ' ' ) ),
					classes = $clone.attr( 'class' ),
					savedComponents = self.usedComponents,
					savedIndex = _.findIndex( savedComponents, function( item ) {
						return item.classes === classes;
					} );

				if ( -1 === savedIndex ) {
					savedComponents.push( {
						style: $clone.attr( 'style' ),
						classes: classes
					} );
				}
			} );
		},

		/**
		 * Open the panel for this control.
		 *
		 * @since 1.2.7
		 */
		openPanel: function() {
			var panel = BG.Panel,
				template = wp.template( 'boldgrid-editor-button' );

			self._updateMyDesigns();

			// Remove all content from the panel.
			panel.clear();

			// Set markup for panel.
			panel.$element.find( '.panel-body' ).html(
				template( {
					text: 'Button',
					presets: self.classes,
					myPresets: self.usedComponents,
					colors: self.getColorsMarkup()
				} )
			);

			self.preselect();

			// Open Panel.
			panel.open( self );

			self.toggleFooter();

			panel.$element.removeClass( 'ui-widget-content' );
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Button.init();
	self = BOLDGRID.EDITOR.CONTROLS.Button;
} )( jQuery );
