var $ = window.jQuery;
var self;

import 'imports-loader?this=>window!wowjs';

class Public {

	/**
	 * Setup the class.
	 *
	 * @since 1.7.0
	 */
	init() {
		$( () => {
			self = this;
			this.setupParallax();
			this.initWowJs();
			this.setupHoverBoxes();
			this.detectFillColors();
			this.addColLg();
			this.setupFullWidthRows();
		} );

		return this;
	}

	/**
	 * Add col-lg to columns that do not have it.
	 *
	 * @since 1.18.0
	 */
	addColLg() {
		$( 'div[class^="col-"]' ).each( function() {
			var $this = $( this ),
				classes = $this.attr( 'class' ),
				mdSize = classes.match( /col-md-([\d]+)/i ),
				lgSize = classes.match( /col-lg-([\d]+)/i );

			if ( mdSize && ! lgSize ) {
				$this.addClass( `col-lg-${mdSize[1]}` );
			}

		} );
	}

	/**
	 * Moves background color from $row to $fwrContainer.
	 *
	 * @since 1.19.0
	 *
	 * @param {object} $row Row jQuery object.
	 * @param {object} $fwrContainer Full width row container jQuery object.
	 */
	setFwrContainerRow( $row, $fwrContainer ) {
		var rowBgColor = $row.css( 'background-color' ),
			fwrUuid   = 'fwr-' + Math.floor( Math.random() * 999 + 1 ).toString(),
			$style    = $( `<style id="${fwrUuid}-inline-css"></style>` ),
			rowBgImg = $row.css( 'background-image' ),
			rowBgSize = $row.css( 'background-size' ) ? $row.css( 'background-size' ) : '',
			rowBgPos = $row.css( 'background-position' ) ? $row.css( 'background-position' ) : '',
			rowCss   = '';

			$row.attr( 'class' ).split( ' ' ).forEach( ( className ) => {
				var matches = /color([\d]+|neutral)-background-color/i.exec( className );

				if ( matches && 2 === matches.length ) {
					$fwrContainer.addClass( className );
				}
			} );

			$row.addClass( fwrUuid );
			$fwrContainer.addClass( fwrUuid );

			rowCss += '@media only screen and (min-width: 1200px) {';

		if ( rowBgColor && rowBgImg && 'none' !== rowBgImg ) {
			rowCss += `body[data-container=max-full-width] .fwr-container.${fwrUuid} {
				background-color: ${rowBgColor};
				background-image: ${rowBgImg};
				background-size: ${rowBgSize};
				background-position: ${rowBgPos};
			}
			body[data-container=max-full-width] .row.full-width-row {
				background-image: unset !important;
				background-color: unset !important;
				z-index: 1;
			}`;
		} else if ( rowBgColor ) {
			rowCss += `body[data-container=max-full-width] .fwr-container.${fwrUuid} {
				background-color: ${rowBgColor};
			}
			body[data-container=max-full-width] .row.full-width-row {
				background-color: unset !important;
			}`;
		} else if ( rowBgImg && 'none' !== rowBgImg ) {
			rowCss += `body[data-container=max-full-width] .fwr-container.${fwrUuid} {
				background-image: ${rowBgImg};
				background-size: ${rowBgSize};
				background-position: ${rowBgPos};
			}
			body[data-container=max-full-width] .row.full-width-row {
				background-image: unset !important;
			}`;
		}
		rowCss += '}';

		$style.html( rowCss );
		$( 'head' ).append( $style );
	}

	/**
	 * Moves background from $col to $fwrContainer.
	 *
	 * @since 1.18.0
	 *
	 * @param {object} $col Column jQuery object.
	 * @param {object} $fwrContainer Full width row container jQuery object.
	 */
	setFwrContainerCols( $col, $fwrContainer ) {
		var colBgColor = $col.css( 'background-color' ),
			fwrUuid   = 'fwr-' + Math.floor( Math.random() * 999 + 1 ).toString(),
			$style    = $( `<style id="${fwrUuid}-inline-css"></style>` ),
			colBgImg = $col.css( 'background-image' ),
			colBgSize = $col.css( 'background-size' ) ? $col.css( 'background-size' ) : '',
			colBgPos = $col.css( 'background-position' ) ? $col.css( 'background-position' ) : '',
			colCss   = '',
			colorClass = '';

		$col.attr( 'class' ).split( ' ' ).forEach( ( className ) => {
			var matches = /col-([\w]+-[\d]+)/i.exec( className );
			if ( matches && 2 === matches.length ) {
				$fwrContainer.addClass( 'fwr-' + matches[1] );
			}

			matches = /color([\d]+|neutral)-background-color/i.exec( className );
			if ( matches && 2 === matches.length ) {
				$fwrContainer.addClass( className );
			}
		} );

		$col.addClass( fwrUuid );
		$fwrContainer.addClass( fwrUuid );

		colCss += '@media only screen and (min-width: 1200px) {';

		if ( colBgColor && colBgImg && 'none' !== colBgImg ) {
			colCss += `body[data-container=max-full-width] .fwr-container div.${fwrUuid} {
				background-color: ${colBgColor};
				background-image: ${colBgImg};
				background-size: ${colBgSize};
				background-position: ${colBgPos};
			}
			body[data-container=max-full-width] .row.full-width-row > div.${fwrUuid}:not( .fwr-container ) {
				background-image: unset !important;
				background-color: unset !important;
				z-index: 1;
			}`;
		} else if ( colBgColor ) {
			colCss += `body[data-container=max-full-width] .fwr-container div.${fwrUuid} {
				background-color: ${colBgColor};
			}
			body[data-container=max-full-width] .row.full-width-row > div.${fwrUuid}:not( .fwr-container ) {
				background-color: unset !important;
			}`;
		} else if ( colBgImg && 'none' !== colBgImg ) {
			colCss += `body[data-container=max-full-width] .fwr-container div.${fwrUuid} {
				background-image: ${colBgImg};
				background-size: ${colBgSize};
				background-position: ${colBgPos};
			}
			body[data-container=max-full-width] .row.full-width-row > div.${fwrUuid}:not( .fwr-container ) {
				background-image: unset !important;
			}`;
		}
		colCss += '}';

		$style.html( colCss );
		$( 'head' ).append( $style );
	}

	/**
	 * Setup Full Width Rows.
	 *
	 * @since 1.18.0
	 */
	setupFullWidthRows() {
		$( '.row.full-width-row' ).each( ( index, el ) => {
			var $this     = $( el ),
				$firstCol = $this.children( 'div[class^="col-"]' ).first(),
				$lastCol  = $this.children( 'div[class^="col-"]' ).last();

			$this.append( '<div class="fwr-container"><div class="fwr-left-container"></div><div class="fwr-right-container"></div></div>' );

			this.setFwrContainerCols( $firstCol, $this.find( '.fwr-left-container' ) );
			this.setFwrContainerCols( $lastCol, $this.find( '.fwr-right-container' ) );
			this.setFwrContainerRow( $this, $this.find( '.fwr-container' ) );
			this.setZIndexes( $this.find( '.fwr-left-container' ), $this.find( '.fwr-right-container' ) );

		} );
	}

	/**
	 * Set Z Indexes of first and last column.
	 *
	 * @since 1.18.0
	 *
	 * @param {object} $firstCol First Column jQuery object.
	 * @param {object} $lastCol Last Column jQuery object.
	 */
	setZIndexes( $firstCol, $lastCol ) {
		var firstColWidth = $firstCol.outerWidth(),
			lastColWidth  = $lastCol.outerWidth();

		if ( firstColWidth > lastColWidth ) {
			$lastCol.css( 'z-index', 1 );
		} else {
			$firstCol.css( 'z-index', 1 );
		}
	}

	/**
	 * Setup frontend Hover Box effects.
	 *
	 * @since 1.17.0
	 */
	setupHoverBoxes() {
		var $hoverBoxes = $( '.has-hover-bg' ),
			css         = '';

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
				hoverBgSize = 'background-size: cover  !important; background-repeat: "unset  !important";';
			} else {
				hoverBgSize = 'background-size: auto auto  !important; background-repeat: repeat  !important;';
			}

			css += `.${hoverBoxClass}:hover {`;

			if ( hoverOverlay && hoverBgUrl ) {
				css += `background-image: linear-gradient(to left, ${hoverOverlay}, ${hoverOverlay} ), url('${hoverBgUrl}') !important;`;
				css += `background-position: 50% ${hoverBgPos}% !important;`;
				css += hoverBgSize;
			} else if ( hoverBgUrl ) {
				css += `background-image: url('${hoverBgUrl}') !important;`;
				css += `background-position: 50% ${hoverBgPos}% !important;`;
				css += hoverBgSize;
			} else if ( hoverBgColor ) {
				css += `background-color: ${hoverBgColor} !important;`;
				css += 'background-image: none !important; }';
			}
			css += '}';

			css  += '@media (hover: none) {';
			css += `.${hoverBoxClass} { background-image: url('${hoverBgUrl}') !important; } }`;
		} );
		$( 'head' ).append( `<style id="bg-hoverboxes-css">${css}</style>` );
	}

	/**
	 * Detect fill colors for shape dividers.
	 *
	 * @since 1.17.0
	 */
	detectFillColors() {
		var $body     = $( 'body' ),
			$dividers = $( '.boldgrid-section-divider' );

		$dividers.each( function() {
			var $this    = $( this ),
				position = $this.attr( 'data-position' ),
				$sibling = self.getSibling( $this, position ),
				color;

				if ( 0 !== $sibling.length ) {
					color = self.getElementBg( $sibling );
				} else if ( 'Astra' === BoldgridEditorPublic.theme ) {
					color = self.getElementBg( $( 'article' ) );
				} else {
					color = self.getElementBg( $body );
				}

				if ( 'Astra' === BoldgridEditorPublic.theme ) {
					color = false === color ? self.getElementBg( $( 'article' ) ) : color;
				}
				color = false === color ? self.getElementBg( $body ) : color;

				$this.find( '.boldgrid-shape-fill' ).each( function() {
					var style   = $( this ).attr( 'style' ),
						matches = style.match( /(.*)(fill:\s\S*;)(.*)/ );

					if ( matches && 4 === matches.length ) {
						$( this ).attr( 'style', `${matches[ 1 ]}fill: ${color};${matches[ 3 ]}` );
					}
				} );
		} );
	}

	/**
	 * Determine the correct sibling element
	 *
	 * @since 1.17.0
	 *
	 * @param {Object} $divider Divider object.
	 * @param {string} position position of divider
	 * @returns {Object} Sibling object.
	 */
	getSibling( $divider, position ) {
		var $boldgridSection = $divider.is( '.boldgrid-section' ) ? $divider : $divider.parent(),
			$sibling         = 'top' === position ? $boldgridSection.prev( '.boldgrid-section' ) : $boldgridSection.next( '.boldgrid-section' ),
			$header          = $( '#masthead' ),
			$footer          = $( 'footer#colophon' ),
			hasBgColor;

		if ( 'bottom' === position && $boldgridSection.parent().is( '#masthead' ) ) {
			$sibling = $( '#content' ).find( '.boldgrid-section' ).first();
		} else if ( 'top' === position && $boldgridSection.parent().is( '.bgtfw-footer' ) ) {
			$sibling = $( '#content' ).find( '.boldgrid-section' ).last();
		} else if ( 0 === $sibling.length && 'top' === position ) {
			hasBgColor = false;
			hasBgColor = $header.find( '.boldgrid-section' ).last().css( 'background-color' );
			hasBgColor = self.isTransparent( hasBgColor ) ? false : hasBgColor;
			$sibling   = false !== hasBgColor ? $header.find( '.boldgrid-section' ) : $header;
		} else if ( 0 === $sibling.length && 'bottom' === position ) {
			hasBgColor = false;
			hasBgColor = $footer.find( '.boldgrid-section' ).first().css( 'background-color' );
			hasBgColor = self.isTransparent( hasBgColor ) ? false : hasBgColor;
			$sibling   = false !== hasBgColor ? $footer.find( '.boldgrid-section' ) : $footer;
		}

		return $sibling;
	}

	/**
	 * Determine if bg color is transparent.
	 *
	 * @since 1.17.0
	 *
	 * @param {string} color color to check.
	 */
	isTransparent( color ) {
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
	}

	/**
	 * Determine the background color of a sibling element.
	 *
	 * @since 1.17.0
	 *
	 * @param {Object} $element Sibling Element.
	 * @returns {string} Background color.
	 */
	getElementBg( $element ) {
		var color,
			colorClass      = $element.attr( 'class' ).match( /(color\S*)-background-color/ ),
			isGridBlock     = $element.hasClass( 'dynamic-gridblock' ),
			isBoldgridTheme = BoldgridEditorPublic.is_boldgrid_theme;

		if ( colorClass && 0 !== colorClass.length && ( isGridBlock || '' === isBoldgridTheme ) ) {
			color = 'neutral' === color ? color : parseInt( colorClass[1].replace( 'color', '' ) ) - 1;
			color = 'neutral' === color ? BoldgridEditorPublic.colors.neutral : BoldgridEditorPublic.colors.defaults[ color ];
		} else if ( colorClass && 0 !== colorClass.length ) {
			color = colorClass[1];
			color = 'color-neutral' === color ? `var(--${color})` : `var(--${color.replace( 'color', 'color-' ) })`;
		} else {
			color = $element.css( 'background-color' );
		}

		return self.isTransparent( color ) ? false : color;
	}

	/**
	 * Setup wow js.
	 *
	 * @since 1.8.0
	 */
	initWowJs() {
		this.wowJs = new window.WOW( {
			live: false,
			mobile: false
		} );

		// Disable on mobile.
		if ( 768 <= $( window ).width() ) {
			this.wowJs.init();
		}
	}

	/**
	 * Run Parallax settings.
	 *
	 * @since 1.7.0
	 */
	setupParallax() {
		let $parallaxBackgrounds = $( '.background-parallax' );

		if ( $parallaxBackgrounds.length ) {
			$parallaxBackgrounds
				.attr( 'data-stellar-background-ratio', '.3' );

			$( 'body' ).stellar( {
				horizontalScrolling: false
			} );
		}
	}
}


window.BOLDGRID = window.BOLDGRID || {};
window.BOLDGRID.PPB = new Public().init();

