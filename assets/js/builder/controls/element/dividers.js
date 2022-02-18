window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.SectionDividers = {
		name: 'dividers',

		tooltip: 'Shape Dividers',

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

		iconClasses: 'fa fa-columns',

		selectors: [ '.boldgrid-section' ],

		dividers: BoldgridEditor.divider_shapes,

		defaults: {
			width: '1',
			dividerWidth: '100',
			height: '150',
			fillColor: '#fff',
			flipSvg: false
		},

		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		panel: {
			title: 'Section Dividers',
			height: '625px',
			width: '450px',
			scrollTarget: '.divider-shapes',
			sizeOffset: -300
		},

		detectFillColors: function() {
			var $body = $( BOLDGRID.EDITOR.mce.iframeElement )
					.contents()
					.find( 'body' ),
				$dividers = $body.find( '.boldgrid-section-divider' );

			$dividers.each( function() {
				var $this = $( this ),
					position = $this.attr( 'data-position' ),
					$sibling = self.getSibling( $this, position ),
					color;

				if ( 0 !== $sibling.length ) {
					color = self.getElementBg( $sibling );
				} else {
					color = self.getElementBg( $body );
				}

				color = false === color ? self.getElementBg( $body ) : color;

				$this.find( '.boldgrid-shape-fill' ).each( function() {
					var style = $( this ).attr( 'style' ),
						matches = style.match( /(.*)(fill:\s\S*;)(.*)/ );

					if ( matches && 4 === matches.length ) {
						$( this ).attr( 'style', `${matches[1]}fill: ${color};${matches[3]}` );
					}
				} );
			} );
		},

		getColorFromPalette: function( color ) {
			var paletteColors = BoldgridEditor.colors,
				isPaletteColor = false,
				isNeutralColor;

			isNeutralColor = BOLDGRID.COLOR_PALETTE.Modify.compareColors( color, paletteColors.neutral );

			if ( false !== isNeutralColor ) {
				return 'var( --color-neutral )';
			}

			paletteColors.defaults.forEach( function( paletteColor, index ) {
				var isMatch = BOLDGRID.COLOR_PALETTE.Modify.compareColors( color, paletteColor );
				if ( isMatch ) {
					isPaletteColor = `var(--color-${index + 1} )`;
				}
			} );

			return false !== isPaletteColor ? isPaletteColor : color;
		},

		getElementBg: function( $element ) {
			var color,
				colorClass = $element.attr( 'class' ).match( /(color\S*)-background-color/ ),
				isGridBlock = $element.hasClass( 'dynamic-gridblock' ),
				isBoldgridTheme = BoldgridEditor.is_boldgrid_theme;

			if ( isGridBlock && colorClass && 0 !== colorClass.length && '' === isBoldgridTheme ) {
				color = 'neutral' === color ? color : parseInt( colorClass[1].replace( 'color', '' ) ) - 1;
				color =
					'neutral' === color ?
						BoldgridEditor.colors.neutral :
						BoldgridEditor.colors.defaults[color];
			} else if ( colorClass && 0 !== colorClass.length ) {
				color = colorClass[1];
				color =
					'color-neutral' === color ?
						`var(--${color})` :
						`var(--${color.replace( 'color', 'color-' )})`;
			} else {
				color = $element.css( 'background-color' );
			}

			return self.isTransparent( color ) ? false : color;
		},

		getSibling: function( $divider, position ) {
			var $boldgridSection = $divider.is( '.boldgrid-section' ) ? $divider : $divider.parent(),
				$sibling = $boldgridSection.prev( '.boldgrid-section' ),
				siteMarkup = BOLDGRID.EDITOR.STYLE.Remote.siteMarkup,
				footerMarkup = siteMarkup.split( '<footer id="colophon"' ),
				$header = $( siteMarkup ).find( '#masthead' ),
				$footer,
				hasBgColor;

			if ( 'bottom' === position ) {
				$sibling = $boldgridSection.next( '.boldgrid-section' );
			}

			if ( footerMarkup && 0 !== footerMarkup.length ) {
				footerMarkup = footerMarkup[1].split( '</footer>' )[0];
			}

			$footer = $( `<footer id="colophon" ${footerMarkup}</footer>` );

			if ( 0 === $sibling.length && 'top' === position ) {
				hasBgColor = false;
				hasBgColor = $header
					.find( '.boldgrid-section' )
					.last()
					.css( 'background-color' );
				hasBgColor = self.isTransparent( hasBgColor ) ? false : hasBgColor;
				$sibling = false !== hasBgColor ? $header.find( '.boldgrid-section' ).last() : $header;
			} else if ( 0 === $sibling.length && 'bottom' === position ) {
				hasBgColor = false;
				hasBgColor = $footer
					.find( '.boldgrid-section' )
					.first()
					.css( 'background-color' );
				hasBgColor = self.isTransparent( hasBgColor ) ? false : hasBgColor;
				$sibling = false !== hasBgColor ? $footer.find( '.boldgrid-section' ).first() : $footer;
			}

			return $sibling;
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
			self.open( '.boldgrid-section' );
		},

		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.8.0
		 *
		 * @param  {string} selector Selector.
		 */
		open: function( selector ) {
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
		 * Setup Init.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			self.$menuItem = BG.Menu.$element.find( '[data-action="menu-section-dividers"]' );

			BOLDGRID.EDITOR.STYLE.Remote.getStyles( BoldgridEditor.site_url );
			$( window ).on( 'boldgrid_page_html', function() {
				self.detectFillColors();
			} );
			self._setupMenuReactivate();
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
				template = wp.template( 'boldgrid-editor-section-dividers' );

			self.$target = $target;

			// Remove all content from the panel.
			panel.clear();
			panel.$element.find( '.panel-body' ).html( template( self.getTemplateVariables() ) );

			self._setupFilters();
			self._setupChangeShape();
			self._setupFlipChange();
			self._initSliders();

			// Open Panel.
			panel.open( self );
		},

		/**
		 * Init all sliders.
		 *
		 * @since 1.2.7
		 */
		_initSliders: function() {
			self._initSlider( 'top' );
			self._initSlider( 'bottom' );
		},

		/**
		 * Init Vertical position slider.
		 *
		 * @since 1.2.7
		 */
		_initSlider: function( position ) {
			var $target = self.getTarget(),
				$divider = $target.find( `.section-divider-${position}` ),
				$dividerSvg = $divider.find( 'svg' ),
				defaultHeight = $divider.css( 'height' ),
				defaultWidth;

			if ( 0 !== $dividerSvg.length ) {
				defaultWidth = $dividerSvg.find( 'path' ).attr( 'data-scaleX' );
			}

			defaultWidth = defaultWidth ? parseInt( defaultWidth ) : parseInt( self.defaults.width );
			defaultHeight = defaultHeight ? parseInt( defaultHeight ) : parseInt( self.defaults.height );

			BG.Panel.$element
				.find( `.section-divider-design .${position}-divider-width .slider` )
				.slider( {
					min: 1,
					max: 50,
					step: 1,
					value: defaultWidth,
					range: 'max',
					slide: function( event, ui ) {
						$divider = $target.find( `.section-divider-${position}` );
						$dividerSvg = $divider.find( 'svg' );
						if ( 0 !== $dividerSvg.length ) {
							$dividerSvg.find( 'path' ).attr( 'data-scaleX', ui.value );
							$dividerSvg
								.find( 'path' )
								.attr(
									'style',
									`${self.getFillStyle( position )}transform: scaleX(${
										ui.value
									});transform-origin:center;`
								);
						}
					}
				} )
				.siblings( '.value' )
				.html( defaultWidth );

			BG.Panel.$element
				.find( `.section-divider-design .${position}-divider-height .slider` )
				.slider( {
					min: 50,
					max: 500,
					value: defaultHeight,
					range: 'max',
					step: 5,
					slide: function( event, ui ) {
						$divider = $target.find( `.section-divider-${position}` );
						$dividerSvg = $divider.find( 'svg' );
						if ( 0 !== $dividerSvg.length ) {
							$dividerSvg.css( 'height', ui.value + 'px' );
							$divider.css( 'height', ui.value + 'px' );
						}
					}
				} )
				.siblings( '.value' )
				.html( defaultHeight );
		},

		_setupFilters: function() {
			var panel = BG.Panel,
				$filters = panel.$element.find( '.section-divider-design .filter' ),
				$sectionDiv = panel.$element.find( '.section-divider-design' );

			panel.$element.on( 'click', '.section-divider-design .filter', function( e ) {
				var $this = $( this ),
					dataFilter = $this.attr( 'data-filter' );

				e.preventDefault();

				$filters.removeClass( 'selected' );
				$this.addClass( 'selected' );
				$sectionDiv.attr( 'data-filter', dataFilter );
			} );
		},

		_setupFlipChange: function() {
			var panel = BG.Panel,
				$target = self.getTarget();

			$target.find( '.boldgrid-section-divider' ).each( function() {
				var $this = $( this ),
					$svg = $this.find( 'svg' ),
					position = $this.hasClass( 'section-divider-top' ) ? 'top' : 'bottom',
					flip = $this.attr( 'data-flip' );

				if ( 'yes' === flip ) {
					panel.$element
						.find( `select[name=section-divider-${position}-flip]` )
						.val( 'yes' )
						.change();
				} else {
					panel.$element
						.find( `select[name=section-divider-${position}-flip]` )
						.val( 'no' )
						.change();
				}
			} );

			panel.$element.on( 'change', '.section-divider-design select.flip-select', function() {
				var $this = $( this ),
					$target = self.getTarget(),
					flip = $this.val(),
					position = $this.attr( 'data-type' ),
					$svg = $target.find( `.section-divider-${position} svg` );

				if ( 'yes' === flip ) {
					$svg.css( 'transform', 'rotate(180deg)' );
					$target.find( `.section-divider-${position}` ).attr( 'data-flip', 'yes' );
				} else {
					$svg.css( 'transform', 'rotate(0deg)' );
					$target.find( `.section-divider-${position}` ).attr( 'data-flip', 'no' );
				}
			} );
		},

		_setupChangeShape: function() {
			var panel = BG.Panel,
				$target = self.getTarget();

			$target.find( '.boldgrid-section-divider' ).each( function() {
				var $this = $( this ),
					panel = BG.Panel,
					position = $this.attr( 'data-position' ),
					shape = $this.attr( 'data-shape' ),
					$shapeInputs = panel.$element.find( `.divider-shape input[data-type=${position}]` );

				$shapeInputs.each( function() {
					var $this = $( this );

					if ( $this.val() === shape ) {
						$this.prop( 'checked', true );
					}
				} );
			} );

			panel.$element.on( 'click', '.divider-shape input', function() {
				var $this = $( this ),
					$target = self.getTarget(),
					divider = $this.val(),
					position = $this.attr( 'data-type' );

				if ( divider && 'none' === divider ) {
					$target.find( `.section-divider-${position}` ).remove();
				} else if ( divider ) {
					self.getDividerMarkup( divider, position, $target );
				}
			} );
		},

		getDividerStyle: function( position ) {
			var width = self.defaults.dividerWidth,
				height = self.getHeight( position );

			return `width: 100%; height: ${height}; overflow: hidden;`;
		},

		getSvgStyle: function( position ) {
			var height = self.getHeight( position ),
				flip = self.getFlip( position );

			return `width: 100%; height: ${height}; display: block; position: relative;${flip}`;
		},

		getFillStyle: function( position ) {
			var $target = self.getTarget(),
				$sibling = self.getSibling( $target, position ),
				$body = $target.parents( 'body' ),
				color = self.defaults.fillColor;

			if ( $sibling.length ) {
				color = self.getElementBg( $sibling );
			} else {
				color = self.getElementBg( $body );
			}

			color = false === color ? self.getElementBg( $body ) : color;

			return `fill: ${color};`;
		},

		isTransparent: function( color ) {
			if ( 'string' === typeof color && color.includes( 'rgba' ) ) {
				color = color
					.replace( 'rgba(', '' )
					.replace( ')', '' )
					.split( ',' );
				return 4 === color.length && 0 === parseInt( color[3] ) ? true : false;
			} else if ( 'string' === typeof color && color.includes( '#' ) ) {
				color = color.replace( '#', '' );
				return 8 === color.length && '00' === color.slice( -2 ) ? true : false;
			} else if ( 'string' === typeof color && color.includes( 'color' ) ) {
				return false;
			} else if ( 'string' === typeof color && color.includes( 'rgb' ) ) {
				return false;
			}

			return true;
		},

		getFlip: function( position ) {
			var panel = BG.Panel,
				flip = self.defaults.flipSvg;

			if ( panel.$element.find( `select[name=section-divider-${position}-flip]` ).length ) {
				flip = panel.$element.find( `select[name=section-divider-${position}-flip]` ).val();
			}

			return 'yes' === flip ? 'transform: rotate(180deg);' : '';
		},

		getWidth: function( position ) {
			var panel = BG.Panel,
				width = self.defaults.width;

			if ( panel.$element.find( `.${position}-divider-width .slider` ).length ) {
				width = panel.$element.find( `.${position}-divider-width .slider` ).slider( 'option', 'value' );
			}

			return width;
		},

		getHeight: function( position ) {
			var panel = BG.Panel,
				height = self.defaults.height;

			if ( panel.$element.find( `.${position}-divider-height .slider` ).length ) {
				height = panel.$element
					.find( `.${position}-divider-height .slider` )
					.slider( 'option', 'value' );
			}

			return height + 'px';
		},

		getDividerMarkup: function( divider, position, $target ) {
			var url = self.getDividerUrl( divider ),
				style = self.getDividerStyle( position );

			self.getInlineSvg(
				url,
				$target,
				position,
				`<div data-shape="${divider}" data-position="${
					position
				}" class="boldgrid-section-divider section-divider-${position} section-divider-${
					divider
				}" style="${style}">`,
				'</div>'
			);
		},

		getInlineSvg: function( url, $target, position, openingTag, closingTag ) {
			jQuery.get(
				url,
				function( data ) {

					// Get the SVG tag, ignore the rest
					var $svg = jQuery( data ).find( 'svg' );

					// Add replaced image's ID to the new SVG
					if ( 'undefined' !== typeof imgID ) {
						$svg = $svg.attr( 'id', imgID );
					}

					// Add replaced image's classes to the new SVG
					if ( 'undefined' !== typeof imgClass ) {
						$svg = $svg.attr( 'class', imgClass + ' replaced-svg' );
					}

					// Remove any invalid XML tags as per http://validator.w3.org
					$svg = $svg.removeAttr( 'xmlns:a' );

					$svg.attr( 'style', self.getSvgStyle( position ) );

					$svg
						.find( 'path' )
						.attr(
							'style',
							`transform-origin: center; transform: scaleX(${self.getWidth( position )});`
						);

					$svg.find( 'path' ).attr( 'data-scaleX', 1 );

					$svg
						.find( '.boldgrid-shape-fill' )
						.attr(
							'style',
							`${self.getFillStyle( position )}transform: scaleX(${self.getWidth(
								position
							)}); transform-origin:center`
						);

					if ( 0 !== self.getTarget().find( `.section-divider-${position}` ).length ) {
						self
							.getTarget()
							.find( `.section-divider-${position}` )
							.remove();
					}

					if ( 'top' === position ) {
						self.getTarget().prepend( openingTag + $svg[0].outerHTML + closingTag );
					} else {
						self.getTarget().append( openingTag + $svg[0].outerHTML + closingTag );
					}
				},
				'xml'
			);
		},

		getTemplateVariables: function() {
			var variables = {
				states: {},
				dividers: []
			};

			_.each( self.dividers, function( divider ) {
				variables.dividers.push( {
					value: divider.value,
					title: self.getDividerTitle( divider.value ),
					url: self.getDividerUrl( divider.value )
				} );
			} );

			return variables;
		},

		getDividerUrl: function( divider ) {
			return self.dividers[divider].url;
		},

		getDividerTitle: function( divider ) {
			return self.dividers[divider].title;
		}
	};

	BOLDGRID.EDITOR.CONTROLS.SectionDividers.init();
	self = BOLDGRID.EDITOR.CONTROLS.SectionDividers;
} )( jQuery );
