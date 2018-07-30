var $ = jQuery;

import { StyleUpdater } from '@boldgrid/controls';
import { WebFont } from '@boldgrid/controls';

export class Updater extends StyleUpdater {
	init() {
		this.$input = $( '#boldgrid-control-styles' );

		this.loadSavedConfig( BoldgridEditor.control_styles.configuration || [] );
		this.setup();
		this.updateInput();
		this.updateFontsUrl();

		// Override inline styles functions from controls lib.
		window.BOLDGRID.CONTROLS.addStyles = BOLDGRID.EDITOR.Controls.addStyles;
		window.BOLDGRID.CONTROLS.addStyle = BOLDGRID.EDITOR.Controls.addStyle;

		return this;
	}

	/**
	 * Update the fonts URL.
	 *
	 * @since 1.8.0
	 */
	updateFontsUrl() {
		new WebFont( { $scope: BOLDGRID.EDITOR.Controls.$container } ).updateFontLink();
	}

	/**
	 * Update the input used to store styles state.
	 *
	 * @since 1.6
	 */
	updateInput() {
		this.$input.val( JSON.stringify( this.stylesState ) );
		this.updateCachedCss();
	}

	/**
	 * Update the cache of stylesheet css.
	 *
	 * @since 1.6
	 */
	updateCachedCss() {
		this.cachedCss = this.getStylesheetCss();
	}

	/**
	 * Get a copy of the cached css.
	 *
	 * This is used in processes that are call repeatidly without built in storage between itterations (render gridblocks).
	 * @todo this should be in the base class and done transparently.
	 *
	 * @since 1.6
	 *
	 * @return string.
	 */
	getCachedCss() {
		if ( ! this.cachedCss ) {
			this.cachedCss = this.getStylesheetCss();
		}

		return this.cachedCss;
	}
}

export { Updater as default };
