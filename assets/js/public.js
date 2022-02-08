var $ = window.jQuery;

import 'imports-loader?this=>window!wowjs';

class Public {

	/**
	 * Setup the class.
	 *
	 * @since 1.7.0
	 */
	init() {
		$( () => {
			this.setupParallax();
			this.initWowJs();
			this.setupHoverBoxes();
		} );

		return this;
	}

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
				hoverBgPos    = hoverBgPos ? hoverBgPos : '50';

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
			}
			css += '}';
		} );
		$( 'head' ).append( `<style id="bg-hoverboxes-css">${css}</style>` );
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
