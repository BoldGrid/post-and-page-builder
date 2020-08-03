window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

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

		iconClasses: 'genericon genericon-picture',

		selectors: [ '.boldgrid-section', '.row', '[class*="col-md-"]' ],

		availableEffects: [ 'background-parallax', 'background-fixed' ],

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
				}
			]
		},

		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		panel: {
			title: 'Background',
			height: '625px',
			width: '325px',
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
		 * When the user clicks Add Image open the media library.
		 *
		 * @since 1.2.7
		 */
		_setupAddImage: function() {
			BG.Panel.$element.on( 'click', '.background-design .add-image-controls', function() {

				// If the media frame already exists, reopen it.
				if ( self.uploadFrame ) {
					self.uploadFrame.open();
					return;
				}

				// Create a new media frame.
				self.uploadFrame = wp.media( {
					title: 'Select Background Image',
					library: { type: 'image' },
					button: {
						text: 'Use this media'
					},

					// Set to true to allow multiple files to be selected.
					multiple: false
				} );

				// When an image is selected in the media frame.
				self.uploadFrame.on( 'select', function() {

					// Get media attachment details from the frame state.
					var attachment = self.uploadFrame
						.state()
						.get( 'selection' )
						.first()
						.toJSON();

					// Set As current selection and apply to background.
					self.setImageBackground( attachment.url );
					self.setImageSelection( 'image' );
				} );

				// Finally, open the modal on click.
				self.uploadFrame.open();
			} );
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
			self._setupBackgroundClick();
			self._setupFilterClick();
			self._setupCustomizeLeave();
			self._setupBackgroundSize();
			self._setupBackgroundColor();
			self._setupGradientColor();
			self._setupOverlayColor();
			self._setupOverlayReset();
			self._setupScrollEffects();
			self._setupGradientDirection();
			self._setupCustomization();
			self._setupAddImage();
		},

		/**
		 * Bind Event: Change background section color.
		 *
		 * @since 1.2.7
		 */
		_setupBackgroundColor: function() {
			var panel = BG.Panel;

			panel.$element.on(
				'change',
				'.background-design [name="section-background-color"]',
				function() {
					var $this = $( this ),
						$target = self.getTarget(),
						value = $this.val(),
						type = $this.attr( 'data-type' ),
						$currentSelection = BG.Panel.$element.find( '.current-selection' ),
						selectionType = $currentSelection.attr( 'data-type' );

					self.removeColorClasses( $target );
					BG.Controls.addStyle( $target, 'background-color', '' );

					// If currently selected is a gradient.
					if ( 'pattern' !== selectionType ) {
						BG.Controls.addStyle( $target, 'background-image', '' );
						$target.removeAttr( 'data-bg-color-1' );
						$target.removeAttr( 'data-bg-color-2' );
						$target.removeAttr( 'data-bg-direction' );
					}
					if ( 'pattern' !== selectionType ) {
						BG.Panel.$element.find( '.presets .selected' ).removeClass( 'selected' );
					}

					if ( 'class' === type ) {
						$target
							.addClass( 'bg-background-color' )
							.addClass( BG.CONTROLS.Color.getColorClass( 'background-color', value ) )
							.addClass( BG.CONTROLS.Color.getColorClass( 'text-contrast', value ) );
					} else {
						BG.Controls.addStyle( $target, 'background-color', value );
					}

					self.setImageSelection( selectionType, $target.css( 'background' ) );
				}
			);
		},

		/**
		 * Bind Event: Set the default color for overlay.
		 *
		 * @since 1.2.7
		 */
		_setupOverlayReset: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.background-design .overlay-color .default-color', function( e ) {
				var $this = $( this ),
					$target = self.getTarget();

				e.preventDefault();

				$this
					.closest( '.color-controls' )
					.find( 'label' )
					.css( 'background-color', 'rgba(255,255,255,.5)' );

				$target.removeAttr( 'data-bg-overlaycolor' );
				self.updateBackgroundImage();
			} );
		},

		/**
		 * Bind Event: Change overlay color.
		 *
		 * @since 1.2.7
		 */
		_setupOverlayColor: function() {
			var panel = BG.Panel;

			panel.$element.on( 'change', '.background-design [name="overlay-color"]', function() {
				var $this = $( this ),
					type = $this.attr( 'data-type' ),
					value = $this.val(),
					$target = self.getTarget();

				if ( 'class' === type ) {
					value = BoldgridEditor.colors.defaults[value - 1];
				}

				$target.attr( 'data-bg-overlaycolor', value );

				self.updateBackgroundImage();
			} );
		},

		/**
		 * Update background image on page.
		 *
		 * @since 1.2.7
		 */
		updateBackgroundImage: function() {
			var $target = self.getTarget(),
				overlay = $target.attr( 'data-bg-overlaycolor' ),
				image = $target.attr( 'data-image-url' );

			if ( overlay && image ) {
				BG.Controls.addStyle(
					$target,
					'background-image',
					self.getOverlayImage( overlay ) + ', url("' + image + '")'
				);
			} else if ( image ) {
				BG.Controls.addStyle( $target, 'background-image', 'url("' + image + '")' );
			}
		},

		/**
		 * Create gradient overlay string.
		 *
		 * @since 1.2.7
		 * @param string color.
		 * @return string color.
		 */
		getOverlayImage: function( color ) {
			return 'linear-gradient(to left, ' + color + ', ' + color + ')';
		},

		/**
		 * Bind Event: Changing Gradient Color.
		 *
		 * @since 1.2.7
		 */
		_setupGradientColor: function() {
			var panel = BG.Panel;

			panel.$element.on( 'change', '.background-design [name^="gradient-color"]', function() {
				var $this = $( this ),
					$target = self.getTarget(),
					value = $this.val(),
					name = $this.attr( 'name' ),
					type = $this.attr( 'data-type' );

				if ( 'class' === type ) {
					value = BoldgridEditor.colors.defaults[value - 1];
				}

				if ( 'gradient-color-1' === name ) {
					$target.attr( 'data-bg-color-1', value );
				} else {
					$target.attr( 'data-bg-color-2', value );
				}

				BG.Controls.addStyle( $target, 'background-image', self.createGradientCss( $target ) );
			} );
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

			panel.$element.on(
				'click',
				'.current-selection .settings .panel-button.remove-background',
				function( e ) {
					e.preventDefault();
					self._removeImage();
				}
			);
		},

		/**
		 * Button to remove an image.
		 *
		 * @since 1.12.0
		 */
		_removeImage() {
			const $target = self.getTarget();
			self.removeColorClasses( $target );
			BG.Controls.addStyle( $target, 'background', '' );
			$target.removeAttr( 'data-image-url' );

			BG.Panel.$element.find( '.presets .selected' ).removeClass( 'selected' );

			// Reset Gradient attributes.
			$target
				.removeAttr( 'data-bg-color-1' )
				.removeAttr( 'data-image-url' )
				.removeAttr( 'data-bg-color-2' )
				.removeAttr( 'data-bg-overlaycolor' )
				.removeAttr( 'data-bg-direction' );

			self.setImageSelection( 'color' );
		},

		/**
		 * Bind Event: Input scroll effect changing.
		 *
		 * @since 1.2.7
		 */
		_setupScrollEffects: function() {
			var panel = BG.Panel;

			panel.$element.on( 'change', '.background-design input[name="scroll-effects"]', function() {
				var $this = $( this ),
					$target = self.getTarget();

				if ( 'none' === $this.val() ) {
					$target.removeClass( self.availableEffects.join( ' ' ) );
				} else {
					$target.removeClass( self.availableEffects.join( ' ' ) );
					$target.addClass( $this.val() );
				}
			} );
		},

		/**
		 * Bind Event: Input gradient direction changing.
		 *
		 * @since 1.2.7
		 */
		_setupGradientDirection: function() {
			var panel = BG.Panel;

			panel.$element.on( 'change', '.background-design input[name="bg-direction"]', function() {
				var $this = $( this ),
					$target = self.getTarget();

				$target.attr( 'data-bg-direction', $this.val() );
				BG.Controls.addStyle( $target, 'background-image', self.createGradientCss( $target ) );
			} );
		},

		/**
		 * Create the css needed for a linear gradient.
		 *
		 * @since 1.2.7
		 * @param jQuery $element.
		 */
		createGradientCss: function( $element ) {
			return (
				'linear-gradient(' +
				$element.attr( 'data-bg-direction' ) +
				',' +
				$element.attr( 'data-bg-color-1' ) +
				',' +
				$element.attr( 'data-bg-color-2' ) +
				')'
			);
		},

		/**
		 * Setup background size control.
		 *
		 * @since 1.2.7
		 */
		_setupBackgroundSize: function() {
			var panel = BG.Panel;

			panel.$element.on( 'change', '.background-design input[name="background-size"]', function() {
				var $this = $( this ),
					$target = self.getTarget();

				if ( 'tiled' === $this.val() ) {
					BG.Controls.addStyle( $target, 'background-size', 'auto auto' );
					BG.Controls.addStyle( $target, 'background-repeat', 'repeat' );
				} else if ( 'cover' === $this.val() ) {
					BG.Controls.addStyle( $target, 'background-size', 'cover' );
					BG.Controls.addStyle( $target, 'background-repeat', '' );
				}
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
				self.preselectBackground();
				panel.scrollToSelected();
				BG.Service.customize.navigation.disable();
			} );
		},

		/**
		 * Bind Event: When the user clicks on a filter.
		 *
		 * @since 1.2.7
		 */
		_setupFilterClick: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.background-design .filter', function( e ) {
				e.preventDefault();

				let $this = $( this ),
					type = $this.data( 'type' ),
					label = $this.data( 'label' ),
					$currentSelection = panel.$element.find( '.current-selection' ),
					$presetsBackgroundColor = panel.$element.find( '.presets .background-color.section' );

				panel.$element.find( '.filter' ).removeClass( 'selected' );
				$this.addClass( 'selected' );

				panel.$element.find( '.presets .selection' ).hide();
				$.each( type, function() {
					panel.$element.find( '.presets .selection[data-type="' + this + '"]' ).show();
				} );

				panel.$element.find( '.presets .title > *' ).text( label );
				panel.$element.find( '.presets' ).attr( 'data-filter', type );
				$currentSelection.attr( 'data-filter', type );

				if ( type.length && -1 !== type.indexOf( 'image' ) ) {
					$presetsBackgroundColor.hide();
				} else {
					$presetsBackgroundColor.show();
				}

				panel.scrollToSelected();
			} );
		},

		/**
		 * Remove all color classes.
		 *
		 * @since 1.2.7
		 * @param jQuery $target.
		 */
		removeColorClasses: function( $target ) {
			$target.removeClass( 'bg-background-color' );
			$target.removeClass( BG.CONTROLS.Color.backgroundColorClasses.join( ' ' ) );
			$target.removeClass( BG.CONTROLS.Color.textContrastClasses.join( ' ' ) );
		},

		/**
		 * Bind Event: When the user clicks on a design.
		 *
		 * @since 1.2.7
		 */
		_setupBackgroundClick: function() {
			var panel = BG.Panel;

			panel.$element.on( 'click', '.background-design .presets .selection', function() {
				var $this = $( this ),
					$target = self.getTarget(),
					imageUrl = $this.attr( 'data-image-url' ),
					imageSrc = $this.css( 'background-image' ),
					background = $this.css( 'background' );

				if ( $this.hasClass( 'selected' ) ) {
					self.removeColorClasses( $target );
					BG.Controls.addStyle( $target, 'background', '' );
					$target.removeAttr( 'data-image-url' );
					$this.removeClass( 'selected' );
					self.preselectBackground( true );

					return;
				}

				panel.$element.find( '.presets .selected' ).removeClass( 'selected' );
				$this.addClass( 'selected' );

				// Reset Gradient attributes.
				$target
					.removeAttr( 'data-bg-color-1' )
					.removeAttr( 'data-image-url' )
					.removeAttr( 'data-bg-color-2' )
					.removeAttr( 'data-bg-direction' );

				if ( 'pattern' !== $this.data( 'type' ) ) {
					self.removeColorClasses( $target );
				}

				if ( 'image' === $this.data( 'type' ) ) {
					self.setImageBackground( imageUrl );
				} else if ( 'color' === $this.data( 'type' ) ) {
					$target.addClass( $this.data( 'class' ) );
					$target.addClass(
						BG.CONTROLS.Color.getColorClass( 'text-contrast', $this.data( 'class' ).replace( /\D/g, '' ) )
					);
					$target.addClass( 'bg-background-color' );
					BG.Controls.addStyle( $target, 'background-image', '' );
					self.setDefaultBackgroundColors();
				} else if ( 'pattern' === $this.data( 'type' ) ) {
					BG.Controls.addStyle( $target, 'background-size', 'auto auto' );
					BG.Controls.addStyle( $target, 'background-repeat', 'repeat' );
					BG.Controls.addStyle( $target, 'background-image', imageSrc );
				} else if ( 'gradients' === $this.data( 'type' ) ) {
					BG.Controls.addStyle( $target, 'background-image', imageSrc );
					$target
						.attr( 'data-bg-color-1', $this.data( 'color1' ) )
						.attr( 'data-bg-color-2', $this.data( 'color2' ) )
						.attr( 'data-bg-direction', $this.data( 'direction' ) );
				} else {
					BG.Controls.addStyle( $target, 'background-image', imageSrc );
				}

				self.setImageSelection( $this.data( 'type' ), background );
			} );
		},

		/**
		 * Activate a filter.
		 *
		 * @since 1.2.7
		 * @param string type.
		 */
		activateFilter: function( type ) {
			var backgroundImageProp,
				filterFound = false,
				$target = self.getTarget();

			BG.Panel.$element.find( '.current-selection .filter' ).each( function() {
				var $this = $( this ),
					filterTypes = $this.data( 'type' );

				if ( type && -1 !== filterTypes.indexOf( type ) ) {
					$this.click();
					filterFound = true;
					return false;
				}
			} );

			if ( ! filterFound && ! type ) {
				backgroundImageProp = $target.css( 'background-image' );
				if ( backgroundImageProp && 'none' !== backgroundImageProp ) {

					// Image filter selection hack, trouble selecting array data type.
					BG.Panel.$element.find( '.filter[data-type]:first-of-type' ).click();
					filterFound = true;
				}
			}

			if ( false === filterFound ) {
				BG.Panel.$element.find( '.filter[data-default="1"]' ).click();
			}
		},

		/**
		 * Set Image selection.
		 *
		 * @since 1.2.7
		 * @param string type.
		 * @param string prop.
		 */
		setImageSelection: function( type, prop ) {
			var $currentSelection = BG.Panel.$element.find( '.current-selection' ),
				$target = self.getTarget();

			$currentSelection.css( 'background', '' );

			if ( 'color' === type ) {
				$currentSelection.css( 'background-color', prop );
			} else {
				$currentSelection.css( 'background-color', $target.css( 'background-color' ) );

				// $target[0].style['background-image'] used instead of jQuery.css because of comaptbility issue with FF.
				$currentSelection.css( 'background-image', $target[0].style['background-image'] );
			}

			$currentSelection.attr( 'data-type', type );
		},

		/**
		 * Set Image background.
		 *
		 * @since 1.2.7
		 * @param string url.
		 */
		setImageBackground: function( url ) {
			var $target = self.getTarget();

			$target.attr( 'data-image-url', url );

			BG.Controls.addStyle( $target, 'background', '' );
			self.updateBackgroundImage();
			BG.Controls.addStyle( $target, 'background-size', 'cover' );
			BG.Controls.addStyle( $target, 'background-position', '50% 50%' );
		},

		/**
		 * Init all sliders.
		 *
		 * @since 1.2.7
		 */
		_initSliders: function() {
			self._initVerticleSlider();
		},

		/**
		 * Init Vertical position slider.
		 *
		 * @since 1.2.7
		 */
		_initVerticleSlider: function() {
			var $target = self.getTarget(),
				defaultPosY = $target.css( 'background-position-y' ),
				defaultPosX = $target.css( 'background-position-x' );

			defaultPosY = defaultPosY ? parseInt( defaultPosY ) : 50;
			defaultPosX = defaultPosX ? parseInt( defaultPosX ) : 50;

			BG.Panel.$element
				.find( '.background-design .vertical-position .slider' )
				.slider( {
					min: 0,
					max: 100,
					value: defaultPosY,
					range: 'max',
					slide: function( event, ui ) {
						if ( $target.css( 'background-image' ) ) {
							BG.Controls.addStyle(
								$target,
								'background-position',
								defaultPosX + '%' + ' ' + ui.value + '%'
							);
						}
					}
				} )
				.siblings( '.value' )
				.html( defaultPosY );
		},

		/**
		 * Open the customization view.
		 *
		 * @since 1.2.7
		 */
		openCustomization: function() {
			BG.Panel.$element.find( '.preset-wrapper' ).hide();
			BG.Panel.$element.find( '.background-design .customize' ).show();
			BG.Panel.$element
				.find( '.preset-wrapper' )
				.attr( 'data-type', BG.Panel.$element.find( '.current-selection' ).attr( 'data-type' ) );
			self._initSliders();
			self.selectDefaults();
			BG.Panel.enterCustomization();
			BG.Panel.customizeOpenEvent();

			BG.Panel.createScrollbar( '.customize', {
				height: self.panel.height
			} );
		},

		/**
		 * Set all defaults.
		 *
		 * @since 1.2.7
		 */
		selectDefaults: function() {
			self.setScrollEffect();
			self.setSize();
			self.setDefaultDirection();
			self.setDefaultBackgroundColors();
			self.setDefaultOverlayColor();
		},

		/**
		 * Set default overlay color.
		 *
		 * @since 1.2.7
		 */
		setDefaultOverlayColor: function() {
			var $target = self.getTarget(),
				$overlayColorSection = BG.Panel.$element.find( '.overlay-color' ),
				overlayColor = $target.attr( 'data-bg-overlaycolor' );

			if ( overlayColor ) {
				$overlayColorSection
					.find( 'input' )
					.val( overlayColor )
					.attr( 'value', overlayColor );
			}
		},

		/**
		 * Set default background size.
		 *
		 * @since 1.2.7
		 */
		setSize: function() {
			var $input = BG.Panel.$element.find( 'input[name="background-size"]' ),
				$target = self.getTarget();

			if ( -1 === $target.css( 'background-size' ).indexOf( 'cover' ) ) {
				$input.filter( '[value="tiled"]' ).prop( 'checked', true );
			}
		},

		/**
		 * Set default scroll direction.
		 *
		 * @since 1.2.7
		 */
		setScrollEffect: function() {
			var $target = self.getTarget();

			$.each( self.availableEffects, function() {
				if ( $target.hasClass( this ) ) {
					BG.Panel.$element
						.find( 'input[name="scroll-effects"][value="' + this + '"]' )
						.prop( 'checked', true );
					return false;
				}
			} );
		},

		/**
		 * Set graadient direction.
		 *
		 * @since 1.2.7
		 */
		setDefaultDirection: function() {
			var $target = self.getTarget(),
				direction = $target.attr( 'data-bg-direction' );

			if ( self.backgroundIsGradient( $target.css( 'background-image' ) ) && direction ) {
				BG.Panel.$element
					.find( 'input[name="bg-direction"][value="' + direction + '"]' )
					.prop( 'checked', true );
			}
		},

		/**
		 * Set default background colors.
		 *
		 * @since 1.2.7
		 */
		setDefaultBackgroundColors: function() {
			var bgColor,
				$bgControlColor,
				$target = self.getTarget();

			if ( self.backgroundIsGradient( $target.css( 'background-image' ) ) ) {
				BG.Panel.$element
					.find( 'input[name="gradient-color-1"]' )
					.val( $target.attr( 'data-bg-color-1' ) )
					.attr( 'value', $target.attr( 'data-bg-color-1' ) );
				BG.Panel.$element
					.find( 'input[name="gradient-color-2"]' )
					.val( $target.attr( 'data-bg-color-2' ) )
					.attr( 'value', $target.attr( 'data-bg-color-2' ) );
			} else {
				bgColor = BG.CONTROLS.Color.findAncestorColor( $target, 'background-color' );
				$bgControlColor = BG.Panel.$element.find( 'input[name="section-background-color"]' );
				$bgControlColor.prev( 'label' ).css( 'background-color', bgColor );
				$bgControlColor.val( bgColor ).attr( 'value', bgColor );
			}
		},

		/**
		 * Get a random gradient direction.
		 *
		 * @since 1.2.7
		 * @return string.
		 */
		randomGradientDirection: function() {
			var directions = [ 'to left', 'to bottom' ];

			return directions[Math.floor( Math.random() * directions.length )];
		},

		/**
		 * Create JSON of gradients. Not used at runtime.
		 *
		 * @since 1.2.7
		 */
		_createGradients: function() {
			var gradientData = [];

			$.each( BoldgridEditor.sample_backgrounds.default_gradients, function() {
				var color1 = this.colors[0],
					color2 = this.colors[1],
					direction = self.randomGradientDirection();

				gradientData.push( {
					color1: color1,
					color2: color2,
					direction: direction,
					css: 'linear-gradient(' + direction + ',' + color1 + ',' + color2 + ')'
				} );
			} );

			console.log( JSON.stringify( gradientData ) );
		},

		/**
		 * Create gradients based on the users palettes.
		 *
		 * @since 1.2.7
		 */
		setPaletteGradients: function() {
			var combos = [];
			if ( BoldgridEditor.colors.defaults && BoldgridEditor.colors.defaults.length ) {
				$.each( [ 0, 1 ], function() {
					var color1, color2, direction;
					color1 =
						BoldgridEditor.colors.defaults[
							Math.floor( Math.random() * BoldgridEditor.colors.defaults.length )
						];
					color2 =
						BoldgridEditor.colors.defaults[
							Math.floor( Math.random() * BoldgridEditor.colors.defaults.length )
						];
					if ( color1 !== color2 ) {
						direction = self.randomGradientDirection();
						combos.push( {
							color1: color1,
							color2: color2,
							direction: direction,
							css: 'linear-gradient(' + direction + ',' + color1 + ',' + color2 + ')'
						} );
					}
				} );
			}

			$.each( combos, function() {
				BoldgridEditor.sample_backgrounds.gradients.unshift( this );
			} );
		},

		/**
		 * Is the given url a gradient.
		 *
		 * @since 1.2.7
		 * @param string backgroundUrl.
		 * @return boolean.
		 */
		backgroundIsGradient: function( backgroundUrl ) {
			return -1 !== backgroundUrl.indexOf( 'linear-gradient' ) && -1 === backgroundUrl.indexOf( 'url' );
		},

		/**
		 * Preselect the background being used when opening the panel.
		 *
		 * @since 1.2.7
		 */
		preselectBackground: function( keepFilter ) {
			var type = 'color',
				$target = self.getTarget(),
				backgroundColor = $target.css( 'background-color' ),
				backgroundUrl = $target.css( 'background-image' ),
				$currentSelection = BG.Panel.$element.find( '.current-selection' ),
				hasGradient = self.backgroundIsGradient( backgroundUrl ),
				matchFound = false;

			//@TODO: update the preview screen when pressing back from the customize section.

			// Set the background color, and background image of the current section to the preview.
			self.setImageSelection( 'image' );
			$currentSelection.css( 'background-color', backgroundColor );

			BG.Panel.$element.find( '.selection' ).each( function() {
				var $this = $( this ),
					selectionType = $this.data( 'type' ),
					dataClass = $this.data( 'class' );

				switch ( selectionType ) {
					case 'color':
						if (
							dataClass &&
							$target.hasClass( dataClass ) &&
							'none' === $target.css( 'background-image' )
						) {
							$this.addClass( 'selected' );
							type = selectionType;
							matchFound = true;
							self.activateFilter( type );
							return false;
						}
						break;
					case 'image':
						if ( $this.attr( 'data-image-url' ) === $target.attr( 'data-image-url' ) ) {

							//Found a match.
							$this.addClass( 'selected' );
							type = selectionType;
							matchFound = true;
							self.activateFilter( type );
							return false;
						}
						break;
					case 'gradients':
					case 'pattern':
						if ( $this.css( 'background-image' ) === backgroundUrl ) {

							//Found a match.
							$this.addClass( 'selected' );
							type = selectionType;
							matchFound = true;
							self.activateFilter( type );
							return false;
						}
						break;
				}
			} );

			if ( ! matchFound ) {
				if ( hasGradient ) {
					type = 'gradients';
				} else if ( 'none' !== backgroundUrl ) {
					type = 'image';
				}

				if ( ! keepFilter ) {
					self.activateFilter( type );
				}
			}

			$currentSelection.attr( 'data-type', type );
		},

		/**
		 * Find out what type of element we're controlling the background of.
		 *
		 * @since 1.8.0
		 */
		setElementType: function() {
			self.elementType = this.checkElementType( self.$target );
			BG.Panel.$element.find( '.customize-navigation' ).attr( 'data-element-type', self.elementType );
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
				template = wp.template( 'boldgrid-editor-background' );

			self.$target = $target;

			BoldgridEditor.sample_backgrounds.color = BG.CONTROLS.Color.getPaletteBackgroundColors();

			// Remove all content from the panel.
			panel.clear();

			self.setPaletteGradients();
			panel.$element.find( '.panel-body' ).html(
				template( {
					images: BoldgridEditor.sample_backgrounds,
					imageData: BoldgridEditor.builder_config.background_images
				} )
			);

			self.preselectBackground();
			self.setDefaultBackgroundColors();
			self.setElementType();

			// Open Panel.
			panel.open( self );
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Background.init();
	self = BOLDGRID.EDITOR.CONTROLS.Background;
} )( jQuery );
