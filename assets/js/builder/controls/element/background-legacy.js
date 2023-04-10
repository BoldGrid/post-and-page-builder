window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

// Import Semver.
import { lt as semverLt } from 'semver';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Background = {
		name: 'background-legacy',

		tooltip: 'Background Legacy',

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
			BOLDGRID.EDITOR.Controls.registerControl( this );
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
				maxCrioVersion = '2.20.0',
				isCrio = BoldgridEditor.is_crio,
				themeIsLt = semverLt( BoldgridEditor.theme_version, maxCrioVersion );

			if ( ! isCrio || themeIsLt ) {
				loadControl = true;
			}

			console.log( {
				loadControl,
				isCrio,
				themeIsLt,
				maxCrioVersion
			} );

			return loadControl;
		},

		/**
		 * Setup Hover Boxes.
		 *
		 * @since 1.17.0
		 */
		_setupHoverBoxes() {
			var css = '',
				$head = $( tinyMCE.activeEditor.iframeElement )
					.contents()
					.find( 'head' ),
				$body = $( tinyMCE.activeEditor.iframeElement )
					.contents()
					.find( 'body' ),
				$hoverBoxes = $body.find( '.has-hover-bg' );

			$hoverBoxes.each( ( index, hoverBox ) => {
				var $hoverBox = $( hoverBox ),
					hoverBoxClass = $hoverBox.attr( 'data-hover-bg-class' ),
					hoverBgUrl = $hoverBox.attr( 'data-hover-image-url' ),
					hoverOverlay = $hoverBox.attr( 'data-hover-bg-overlaycolor' ),
					hoverBgSize = $hoverBox.attr( 'data-hover-bg-size' ),
					hoverBgSize = hoverBgSize ? hoverBgSize : 'cover',
					hoverBgPos = $hoverBox.attr( 'data-hover-bg-position' ),
					hoverBgPos = hoverBgPos ? hoverBgPos : '50',
					hoverBgColor = $hoverBox.attr( 'data-hover-bg-color' );

				if ( 'cover' === hoverBgSize ) {
					hoverBgSize =
						'background-size: cover !important; background-repeat: "unset  !important";';
				} else {
					hoverBgSize =
						'background-size: auto auto !important; background-repeat: repeat  !important;';
				}

				if ( hoverOverlay && hoverBgUrl ) {
					css = `.${hoverBoxClass}:hover {`;
					css += `background-image: linear-gradient(to left, ${hoverOverlay}, ${
						hoverOverlay
					} ), url('${hoverBgUrl}') !important; }`;
					$head.append( `<style id="${hoverBoxClass}-image">${css}</style>` );

					css = `.${hoverBoxClass}:hover { background-position: 50% ${hoverBgPos}% !important; }`;
					$head.append( `<style id="${hoverBoxClass}-position">${css}</style>` );

					css = `.${hoverBoxClass}:hover { ${hoverBgSize} }`;
					$head.append( `<style id="${hoverBoxClass}-bg-size">${css}</style>` );
				} else if ( hoverBgUrl ) {
					css = `.${hoverBoxClass}:hover {`;
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
					let hoverCss = self.getOverlayImage( hoverOverlay ) + ', url("' + hoverBgUrl + '")';
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
		_setupAddImage: function( isHoverImage = false ) {
			var addMediaClass = isHoverImage ? '.add-hover-image-controls' : '.add-image-controls';
			BG.Panel.$element.on( 'click', '.background-design ' + addMediaClass, function() {
				self.isHoverImage = $( this ).hasClass( 'add-hover-image-controls' );

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

					var hoverImage = self.isHoverImage ? true : false;

					// Set As current selection and apply to background.
					self.setImageBackground( attachment.url, hoverImage );
					if ( hoverImage ) {
						self.setImageSelection( 'hover-image', attachment.url, hoverImage );
					} else {
						self.setImageSelection( 'image', attachment.url, hoverImage );
					}
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

			self._setupHoverBoxes();
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
			self._setupHoverImage();
			self._setupMobileVisibility();
		},

		/**
		 * Setup Hover Image.
		 *
		 * @since 1.17.0
		 */
		_setupHoverImage: function() {
			self._setupAddImage( true );
		},

		/**
		 * Adds hover styles to header.
		 *
		 * @since 1.17.0
		 *
		 * @param {string} styleId Style ID.
		 * @param {string} css Css to add
		 */
		_addHeadingStyle: function( styleId, css ) {
			var $target = self.getTarget(),
				$body = $target.parents( 'body' ),
				$head = $body.parent().find( 'head' );

			if ( $head.find( '#' + styleId ).length ) {
				$head.find( '#' + styleId ).remove();
			}

			$head.append( '<style id="' + styleId + '">' + css + '</style>' );
		},

		/**
		 * Adds Hover Effects
		 *
		 * @since 1.17.0
		 */
		_addHoverEffects: function() {
			var $target = self.getTarget(),
				$body = $target.parents( 'body' ),
				$hoverBgs = $body.find( '.has-hover-bg' ),
				css = '';

			$hoverBgs.each( function() {
				var hoverBgClassName = $( this ).attr( 'data-hover-bg-class' ),
					hoverBgUrl = $( this ).attr( 'data-hover-image-url' ),
					hoverOverlay = $( this ).attr( 'data-hover-bg-overlaycolor' ),
					hoverBgColor = $( this ).attr( 'data-hover-bg-color' );

				if ( hoverBgClassName && hoverBgUrl && hoverOverlay ) {
					let hoverCss = self.getOverlayImage( hoverOverlay ) + ', url("' + hoverBgUrl + '")';
					css = `.${hoverBgClassName}:hover {background-image: ${hoverCss} !important; }`;
					self._addHeadingStyle( hoverBgClassName + '-image', css );
				} else {
					css = `.${hoverBgClassName}:hover {background-image: url('${hoverBgUrl}') !important; }`;
					self._addHeadingStyle( hoverBgClassName + '-image', css );
				}

				css = `.${
					hoverBgClassName
				}:hover {background-size: cover !important; background-position: 50%, 50% !important;}`;
				self._addHeadingStyle( hoverBgClassName + '-bg-size', css );

				css = '@media screen and (max-width: 991px) {';
				if ( hoverBgClassName && hoverBgUrl && hoverOverlay ) {
					let hoverCss = self.getOverlayImage( hoverOverlay ) + ', url("' + hoverBgUrl + '")';
					css += `.${hoverBgClassName}.hover-mobile-bg {background-image: ${
						hoverCss
					} !important; }`;
					css += `.${hoverBgClassName}.hover-mobile-bg:hover {background-image: ${
						hoverCss
					} !important; }`;
				} else if ( hoverBgClassName && ! hoverBgUrl && hoverBgColor ) {
					css += `.${hoverBgClassName}.hover-mobile-bg {
						background-color: ${hoverBgColor} !important;
						background-image: none !important;
					}`;
				} else {
					css += `.${hoverBgClassName}.hover-mobile-bg { background-image: url('${
						hoverBgUrl
					}') !important; } }`;
				}
				self._addHeadingStyle( hoverBgClassName + '-mobile-image', css );
			} );
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
						selectionType = $currentSelection.attr( 'data-type' ),
						classFromColor = self.classFromColor( value ),
						alphaFromColor = self.alphaFromColor( value );

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
					} else if ( classFromColor ) {
						$target
							.addClass( 'bg-background-color' )
							.addClass( BG.CONTROLS.Color.getColorClass( 'background-color', classFromColor ) )
							.addClass( BG.CONTROLS.Color.getColorClass( 'text-contrast', classFromColor ) )
							.attr( 'data-alpha', alphaFromColor );

						self.paletteAddAlpha(
							$target,
							value,
							BG.CONTROLS.Color.getColorClass( 'background-color', classFromColor )
						);
					} else {
						BG.Controls.addStyle( $target, 'background-color', value );
					}
					self.setImageSelection( selectionType, $target.css( 'background' ) );
					BOLDGRID.EDITOR.CONTROLS.SectionDividers.detectFillColors();
				}
			);

			panel.$element.on(
				'change',
				'.background-design [name="section-hover-background-color"]',
				function() {
					var $this = $( this ),
						$target = self.getTarget(),
						value = $this.val(),
						type = $this.attr( 'data-type' ),
						hoverClass = $target.attr( 'data-hover-bg-class' ),
						isGridBlock = $target.hasClass( 'dynamic-gridblock' ),
						isCrio = BoldgridEditor.is_crio,
						css = '';

					if ( ! $target.hasClass( 'has-hover-bg' ) ) {
						$target.addClass( 'has-hover-bg' );
					}

					if ( ! hoverClass ) {
						hoverClass = 'hover-bg-' + Math.floor( Math.random() * 999 + 1 ).toString();
						$target.attr( 'data-hover-bg-class', hoverClass );
						$target.addClass( hoverClass );
					}

					if ( '' === value ) {
						$target.attr( 'data-hover-bg-color', 'unset' );
						css = `.${hoverClass}:hover {background-color: ${$target.attr(
							'data-hover-bg-color'
						)} !important;}`;
						self._addHeadingStyle( hoverClass + '-bg-color', css );
						$target
							.parents( 'html' )
							.find( 'head' )
							.find( hoverClass + '-bg-color' )
							.remove();

						if ( ! $target.attr( 'data-hover-image-url' ) ) {
							$target.removeAttr( 'data-hover-bg-class' );
							$target.removeClass( 'has-hover-bg' );
							$target.removeClass( hoverClass );
							self.setImageSelection( 'hover-color' );
							return;
						} else {
							self.setImageSelection( 'hover-image' );
							return;
						}
					}

					if ( 'class' === type && ( isGridBlock || ! isCrio ) ) {
						value = 'neutral' === value ? value : parseInt( value ) - 1;
						let color =
							'neutral' === value ?
								BoldgridEditor.colors.neutral :
								BoldgridEditor.colors.defaults[value];
						$target.attr( 'data-hover-bg-color', color );
					} else if ( 'class' === type ) {
						$target.attr( 'data-hover-bg-color', 'var(--color-' + value + ')' );
					} else {
						$target.attr( 'data-hover-bg-color', value );
					}

					css = `.${hoverClass}:hover {background-color: ${$target.attr(
						'data-hover-bg-color'
					)} !important;}`;
					self._addHeadingStyle( hoverClass + '-bg-color', css );

					if ( ! $target.attr( 'data-hover-image-url' ) ) {
						css = `.${hoverClass}:hover {background-image: none !important;}`;
						self._addHeadingStyle( hoverClass + '-image', css );
					}

					self.setImageSelection( 'hover-color' );
				}
			);
		},

		/**
		 * Add alpha component to background color palettes
		 *
		 * @param {jQuery Object} $target The target jQuery object
		 * @param {string} value          Background color value
		 * @param {string} bgColorClass   Background Color class
		 */
		paletteAddAlpha( $target, value, bgColorClass ) {
			var uuid = 'bg-alpha-' + Math.floor( Math.random() * 999 + 1 ).toString(),
				$head = $( tinyMCE.activeEditor.iframeElement )
					.contents()
					.find( 'head' ),
				css;

			if ( $target.attr( 'data-bg-uuid' ) ) {
				uuid = $target.attr( 'data-bg-uuid' );
			} else {
				$target.attr( 'data-bg-uuid', uuid );
				$target.addClass( uuid );
			}

			$head.find( '#' + uuid + '-inline-style' ).remove();

			css = `.${bgColorClass}.${uuid} {background-color: ${value} !important;}`;

			$head.append( '<style id="' + uuid + '-inline-style">' + css + '</style>' );
		},

		/**
		 * Obtains the alpha ( opacity ) value of an RGBA string.
		 *
		 * @param {string} color RGBA Color String.
		 * @returns {string} Alpha value of a color
		 */
		alphaFromColor: function( color ) {
			var alpha = 1;

			if ( color.includes( 'rgba' ) ) {
				alpha = color.replace( /rgba\(\d{1,3}\,\d{1,3}\,\d{1,3}\,(.*\))/, '$1' );
				alpha = alpha.replace( ')', '' );
			}

			return alpha;
		},

		/**
		 * Determine the color class, if any, that matches an RGB(A) String.
		 *
		 * @param {string} color RGB(A) color string
		 * @returns {string} The color class associated with this color string.
		 */
		classFromColor: function( color ) {
			var colors = BoldgridEditor.colors.defaults,
				neutralColor = BoldgridEditor.colors.neutral,
				colorClass = false;

			if ( color.includes( 'rgba' ) ) {
				color = color.replace( /(rgba\(\d{1,3}\,\d{1,3}\,\d{1,3})(.*\))/, '$1)' );
				color = color.replace( 'rgba', 'rgb' );
			} else if ( ! color.includes( 'rgb' ) ) {
				return colorClass;
			}

			color = color.replace( /\s/g, '' );

			for ( let key in colors ) {
				if ( colors[key].replace( /\s/g, '' ) === color ) {
					colorClass = parseInt( key ) + 1;
					break;
				}
			}

			if ( color === neutralColor ) {
				colorClass = 'neutral';
			}

			return colorClass;
		},

		/**
		 * Add color palette for overlays to the target.
		 *
		 * @param {object} $target      jQuery object of the target element.
		 * @param {string} value        The value of the color.
		 * @param {string} bgColorClass The color class string.
		 */
		paletteAddOverlayAlpha( $target, value, bgColorClass ) {
			var image = $target.attr( 'data-image-url' ),
				color = value;

			BG.Controls.addStyle(
				$target,
				'background-image',
				self.getOverlayImage( color ) + ', url("' + image + '")'
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
				$target.removeAttr( 'data-bg-overlaycolor-alpha' );
				$target.removeAttr( 'data-bg-overlaycolor-class' );

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
					$target = self.getTarget(),
					classFromColor = self.classFromColor( value ),
					alphaFromColor = self.alphaFromColor( value );

				if ( 'class' === type ) {
					value = BoldgridEditor.colors.defaults[value - 1];
					$target.attr( 'data-bg-overlaycolor', value );
				} else if ( classFromColor ) {
					$target.attr( 'data-bg-overlaycolor', value ),
						$target.attr( 'data-bg-overlaycolor-alpha', alphaFromColor );
					$target.attr( 'data-bg-overlaycolor-class', classFromColor );
					self.paletteAddOverlayAlpha(
						$target,
						value,
						BG.CONTROLS.Color.getColorClass( 'background-color', classFromColor )
					);
				} else {
					$target.attr( 'data-bg-overlaycolor', value );
				}

				self.updateBackgroundImage();
			} );

			panel.$element.on( 'change', '.background-design [name="hover-overlay-color"]', function() {
				var $this = $( this ),
					type = $this.attr( 'data-type' ),
					value = $this.val(),
					$target = self.getTarget();

				if ( 'class' === type ) {
					value = 'var(--color-' + value + ')';
				}

				$target.attr( 'data-hover-bg-overlaycolor', value );

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
				hoverOverlay = $target.attr( 'data-hover-bg-overlaycolor' ),
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

			self._addHoverEffects();
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

				if ( BoldgridEditor.is_crio ) {
					if ( 'class' === type && 'neutral' !== value ) {
						value = 'var( --color-' + value + ' )';
					} else if ( 'class' === type && 'neutral' === value ) {
						value = 'var( --color-neutral )';
					}
				} else if ( 'class' === type ) {
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
				'.current-selection:not( [data-type=hover-image] ) .settings .panel-button.remove-background',
				function( e ) {
					e.preventDefault();
					self._removeImage();
				}
			);
			panel.$element.on(
				'click',
				'.current-selection[data-type=hover-image] .settings .panel-button.remove-background',
				function( e ) {
					e.preventDefault();
					self._removeImage( e, 'hover-image' );
				}
			);
		},

		/**
		 * Button to remove an image.
		 *
		 * @since 1.12.0
		 */
		_removeImage( e, type ) {
			var $target = self.getTarget(),
				bgHoverClass = $target.attr( 'data-hover-bg-class' ),
				styleIdSuffixes = [ 'image', 'bg-size', 'mobile-image', 'position', 'bg-color' ];

			if ( 'hover-image' === type ) {

				// Remove Hover Styles from head.
				styleIdSuffixes.forEach( function( styleIdSuffix ) {
					$target
						.parents( 'html' )
						.find( 'head' )
						.find( `#${bgHoverClass}-${styleIdSuffix}` )
						.remove();
				} );

				// Remove Image and Overlay attributes.
				$target.removeAttr( 'data-hover-image-url' );
				$target.removeAttr( 'data-hover-bg-overlaycolor' );
				$target.removeAttr( 'data-hover-bg-position' );
				$target.removeAttr( 'data-hover-bg-size' );

				// Remove Hover Color Attributes.
				$target.removeAttr( 'data-hover-bg-color' );

				// Remove hover class and atribute.
				$target.removeAttr( 'data-hover-bg-class' );
				$target.removeClass( 'has-hover-bg' );
				$target.removeClass( bgHoverClass );

				BG.Panel.$element.find( '.add-hover-image-controls' ).removeAttr( 'style' );

				self.setImageSelection( 'hover-color' );
			} else {
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
			}
		},

		/**
		 * Setup mobile visibility controls
		 *
		 * @since 1.17.0
		 */
		_setupMobileVisibility: function() {
			var panel = BG.Panel;
			panel.$element.on(
				'change',
				'.background-design input[name="mobile-only-visibility"]',
				function() {
					var $this = $( this ),
						$target = self.getTarget(),
						classes = [ 'hover-mobile-bg' ];

					switch ( $this.val() ) {
						case 'hover':
							$target.removeClass( classes );
							$target.addClass( 'hover-mobile-bg' );
							break;
						default:
							$target.removeClass( classes );
							break;
					}
				}
			);
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

			panel.$element.on(
				'change',
				'.background-design input[name="hover-scroll-effects"]',
				function() {
					var $this = $( this ),
						$target = self.getTarget();

					if ( 'none' === $this.val() ) {
						$target.removeClass( self.availableHoverEffects.join( ' ' ) );
					} else {
						$target.removeClass( self.availableHoverEffects.join( ' ' ) );
						$target.addClass( $this.val() );
					}
				}
			);
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
		_setupBackgroundSize: function( isHoverImage ) {
			var panel = BG.Panel;

			panel.$element.on(
				'change',
				'.background-design input[name="hover-background-size"]',
				function() {
					var $this = $( this ),
						$target = self.getTarget(),
						hoverBgId = $target.attr( 'data-hover-bg-class' ),
						css = '';

					if ( 'tiled' === $this.val() ) {
						css =
							'.' +
							hoverBgId +
							':hover { background-size: auto auto  !important; background-repeat: repeat  !important; }';
						self._addHeadingStyle( hoverBgId + '-bg-size', css );
						$target.attr( 'data-hover-bg-size', 'tiled' );
					} else if ( 'cover' == $this.val() ) {
						css =
							'.' +
							hoverBgId +
							':hover { background-size: cover  !important; background-repeat: "unset  !important"; }';
						self._addHeadingStyle( hoverBgId + '-bg-size', css );
						$target.attr( 'data-hover-bg-size', 'cover' );
					}
				}
			);

			panel.$element.on( 'change', '.background-design input[name="background-size"]', function() {
				var $this = $( this ),
					$target = self.getTarget();

				if ( 'tiled' === $this.val() ) {
					BG.Controls.addStyle( $target, 'background-size', 'auto auto' );
					BG.Controls.addStyle( $target, 'background-repeat', 'repeat' );
				} else if ( 'cover' === $this.val() ) {
					BG.Controls.addStyle( $target, 'background-size', 'cover' );
					BG.Controls.addStyle( $target, 'background-repeat', 'unset' );
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
					$presetsBackgroundColor = panel.$element.find( '.presets .background-color.section' ),
					$target = self.getTarget(),
					bgColor = $target.css( 'background-color' );

				panel.$element.find( '.filter' ).removeClass( 'selected' );
				$this.addClass( 'selected' );

				panel.$element.find( '.presets .selection' ).hide();
				$.each( type, function() {
					panel.$element.find( '.presets .selection[data-type="' + this + '"]' ).show();
				} );

				panel.$element.find( '.presets .title > *' ).text( label );
				panel.$element.find( '.presets' ).attr( 'data-filter', type );
				$currentSelection.attr( 'data-filter', type );

				if ( type.length && type.includes( 'hover' ) ) {
					let selectionType = $target.attr( 'data-hover-image-url' ) ? 'hover-image' : 'hover-color';
					$currentSelection.attr( 'data-type', selectionType );
					self.setImageSelection( selectionType, bgColor );
				}

				if (
					type.length &&
					! type.includes( 'gradients' ) &&
					( type.includes( 'image' ) || type.includes( 'color' ) || type.includes( 'pattern' ) )
				) {
					let selectionType = $target.attr( 'data-image-url' ) ? 'image' : 'color';
					$currentSelection.attr( 'data-type', selectionType );
					self.setImageSelection( selectionType, bgColor );
				}

				if ( type.length && type.includes( 'gradients' ) ) {
					let selectionType = 'gradients';
					$currentSelection.attr( 'data-type', selectionType );
					self.setImageSelection( selectionType, $target.css( 'background-image' ) );
				}

				if (
					( type.length && -1 !== type.indexOf( 'image' ) ) ||
					( type.length && -1 !== type.indexOf( 'hover' ) )
				) {
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
					background = $this.css( 'background' ),
					bgUuid = $target.attr( 'data-bg-uuid' ),
					value;

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

				// Reset Alpha attributes.
				$target
					.removeAttr( 'data-bg-alpha' )
					.removeAttr( 'data-bg-uuid' )
					.removeClass( bgUuid );

				if ( 'pattern' !== $this.data( 'type' ) ) {
					self.removeColorClasses( $target );
				}

				if ( 'image' === $this.data( 'type' ) ) {
					self.setImageBackground( imageUrl );
				} else if ( 'color' === $this.data( 'type' ) ) {
					$target.addClass( $this.data( 'class' ) );
					value = $this.data( 'class' );
					value = value.includes( 'neutral' ) ? 'neutral' : value.replace( /\D/g, '' );
					$target.addClass( BG.CONTROLS.Color.getColorClass( 'text-contrast', value ) );
					$target.addClass( 'bg-background-color' );
					BG.Controls.addStyle( $target, 'background-image', '' );
					self.setDefaultBackgroundColors();
				} else if ( 'pattern' === $this.data( 'type' ) ) {
					BG.Controls.addStyle( $target, 'background-size', 'auto auto' );
					BG.Controls.addStyle( $target, 'background-repeat', 'repeat' );
					BG.Controls.addStyle( $target, 'background-image', imageSrc );
				} else if ( 'gradients' === $this.data( 'type' ) ) {
					$target
						.attr( 'data-bg-color-1', $this.data( 'color1' ) )
						.attr( 'data-bg-color-2', $this.data( 'color2' ) )
						.attr( 'data-bg-direction', $this.data( 'direction' ) );
					BG.Controls.addStyle( $target, 'background-image', self.createGradientCss( $target ) );
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
		setImageSelection: function( type, prop, isHoverImage ) {
			var $currentSelection = BG.Panel.$element.find( '.current-selection' ),
				$target = self.getTarget(),
				bgImageUrl = $target.attr( 'data-image-url' ),
				bgColor = $target.css( 'background-color' ),
				overlayColor = $target.attr( 'data-bg-overlaycolor' ),
				hoverOverlayColor = $target.attr( 'data-hover-bg-overlaycolor' ),
				hoverBgImageUrl = $target.attr( 'data-hover-image-url' ),
				hoverColor = $target.attr( 'data-hover-bg-color' );

			$currentSelection.css( 'background', '' );

			if ( 'color' === type ) {
				$currentSelection.css( 'background-color', prop );
			} else if ( 'hover-image' === type ) {
				$currentSelection.css( 'background-color', prop );
				if ( hoverBgImageUrl && hoverOverlayColor ) {
					$currentSelection.css(
						'background-image',
						`${self.getOverlayImage( hoverOverlayColor )}, url('${hoverBgImageUrl}')`
					);
				} else if ( hoverBgImageUrl ) {
					$currentSelection.css( 'background-image', `url('${hoverBgImageUrl}')` );
				} else if ( bgImageUrl ) {
					$currentSelection.css( 'background-image', `url('${bgImageUrl}')` );
				}
				self._setupHoverBoxes();
			} else if ( 'hover-color' === type ) {
				if ( hoverColor && ! hoverBgImageUrl ) {
					$currentSelection.css( 'background-color', hoverColor );
				} else if ( ! hoverColor && ! hoverBgImageUrl ) {
					$currentSelection.css( 'background-color', 'rgba(0,0,0,0)' );
				}
				self._setupHoverBoxes();
			} else if ( 'gradients' === type ) {
				$currentSelection.css( 'background-image', $target.css( 'background-image' ) );
			} else {
				$currentSelection.css( 'background-color', bgColor );
				if ( bgImageUrl && overlayColor ) {
					$currentSelection.css(
						'background-image',
						`${self.getOverlayImage( overlayColor )}, url('${bgImageUrl}')`
					);
				} else if ( bgImageUrl ) {
					$currentSelection.css( 'background-image', `url('${bgImageUrl}')` );
				}
			}

			$currentSelection.attr( 'data-type', type );
		},

		/**
		 * Set Image background.
		 *
		 * @since 1.2.7
		 * @param string url.
		 * @param isHoverImage Is Hover Image.
		 */
		setImageBackground: function( url, isHoverImage = false ) {
			var $target = self.getTarget(),
				hvrBgClass = $target.attr( 'data-hover-bg-class' );

			if ( isHoverImage && ! hvrBgClass ) {
				hvrBgClass = 'hover-bg-' + Math.floor( Math.random() * 999 + 1 ).toString();
				$target.addClass( hvrBgClass );
				$target.attr( 'data-hover-bg-class', hvrBgClass );
			}
			if ( isHoverImage ) {
				$target.attr( 'data-hover-image-url', url );
				$target.addClass( 'has-hover-bg' );
				self._addHoverEffects();
			} else {
				$target.attr( 'data-image-url', url );
				BG.Controls.addStyle( $target, 'background', '' );
				self.updateBackgroundImage();
				BG.Controls.addStyle( $target, 'background-size', 'cover' );
				BG.Controls.addStyle( $target, 'background-position', '50% 50%' );
			}
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

			BG.Panel.$element
				.find( '.background-design .hover-vertical-position .slider' )
				.slider( {
					min: 0,
					max: 100,
					value: $target.attr( 'data-hover-bg-position' ) ?
						$target.attr( 'data-hover-bg-position' ) :
						defaultPosY,
					range: 'max',
					slide: function( event, ui ) {
						if ( $target.attr( 'data-hover-bg-class' ) ) {
							self._addHeadingStyle(
								$target.attr( 'data-hover-bg-class' ) + '-position',
								`.${$target.attr( 'data-hover-bg-class' )}:hover {
									background-position: ${defaultPosX + '%'} ${ui.value}% !important;
								}`
							);
							$target.attr( 'data-hover-bg-position', ui.value );
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
			var dataType = BG.Panel.$element.find( '.current-selection' ).attr( 'data-type' );

			BG.Panel.$element.find( '.preset-wrapper' ).hide();
			BG.Panel.$element.find( '.background-design .customize' ).show();
			BG.Panel.$element.find( '.preset-wrapper' ).attr( 'data-type', dataType );
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
				$hoverOverlayColorSeciont = BG.Panel.$element.find( '.hover-overlay-color' ),
				hoverOverlayColor = $target.attr( 'data-hover-bg-overlaycolor' ),
				overlayColor = $target.attr( 'data-bg-overlaycolor' );

			if ( overlayColor ) {
				$overlayColorSection
					.find( 'input' )
					.val( overlayColor )
					.attr( 'value', overlayColor );
			}
			if ( hoverOverlayColor ) {
				$hoverOverlayColorSeciont
					.find( 'input' )
					.val( hoverOverlayColor )
					.attr( 'value', hoverOverlayColor );
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
				hoverColor,
				$bgControlColor,
				$hoverColorControl,
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

			if ( $target.attr( 'data-hover-bg-color' ) ) {
				hoverColor = $target.attr( 'data-hover-bg-color' );
				$hoverColorControl = BG.Panel.$element.find( 'input[name="section-hover-background-color"]' );
				$hoverColorControl.prev( 'label' ).css( 'background-color', hoverColor );
				$hoverColorControl.val( hoverColor ).attr( 'value', hoverColor );
				self._setupHoverBoxes();
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
					var color1, color2, pos1, pos2, direction;
					pos1 = Math.floor( Math.random() * BoldgridEditor.colors.defaults.length ) + 1;
					pos2 = Math.floor( Math.random() * BoldgridEditor.colors.defaults.length ) + 1;
					color1 = 'var( --color-' + pos1 + ' )';
					color2 = 'var( --color-' + pos2 + ' )';
					if ( ! BoldgridEditor.is_crio ) {
						color1 = BoldgridEditor.colors.defaults[pos1 - 1];
						color2 = BoldgridEditor.colors.defaults[pos2 - 1];
					}
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
				hoverBackgroundUrl = $target.attr( 'data-hover-image-url' ),
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
			self.panel.targetType = self.elementType;
		},

		/**
		 * Set element visibility.
		 *
		 * @since 1.17.0
		 */
		setElementVisibility() {
			var $target = self.getTarget(),
				visibility = $target.hasClass( 'hover-mobile-bg' ) ? 'hover' : 'default',
				$radios = BG.Panel.$element.find( '.mobile-only-visibility input' );

			$radios.each( function() {
				if ( $( this ).val() === visibility ) {
					$( this ).attr( 'checked', true );
				} else {
					$( this ).attr( 'checked', false );
				}
			} );
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
				template = wp.template( 'boldgrid-editor-background-legacy' );

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
			self.setElementVisibility();

			// Open Panel.
			panel.open( self );
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Background.init();
	self = BOLDGRID.EDITOR.CONTROLS.Background;
} )( jQuery );
