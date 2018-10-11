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
		} );

		return this;
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
