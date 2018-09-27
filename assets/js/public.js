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

			let wowJs = new window.WOW( {
				live: false,
				mobile: false
			} );

			// Disable on mobile.
			if ( 768 <= $( window ).width() ) {
				wowJs.init();
			}
		} );
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

new Public().init();
