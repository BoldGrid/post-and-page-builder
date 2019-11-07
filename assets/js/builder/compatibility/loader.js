export default class Loader {
	init() {
		if ( 'twentytwenty' === BoldgridEditor.current_theme ) {
			this.twentyTwentyStyles();
		}
	}

	/**
	 * On the twentytwenty theme, replace all the id selectors with body selectors. This will more closely
	 * replicate the front end.
	 *
	 * @since 2.12.0
	 */
	twentyTwentyStyles() {
		const document = BOLDGRID.EDITOR.Controls.$container[0];
		for ( let stylesheet of document.styleSheets ) {
			if ( stylesheet.href && stylesheet.href.match( /twentytwenty.*editor-style-classic/ ) ) {
				for ( let i in stylesheet.cssRules || {} ) {
					if ( 'object' === typeof stylesheet.cssRules[i] && stylesheet.insertRule ) {
						stylesheet.insertRule(
							stylesheet.cssRules[i].cssText.replace( /body#tinymce.wp-editor.content/g, 'body' ),
							i
						);

						stylesheet.deleteRule( parseInt( i ) + 1 );
					}
				}
			}
		}
	}
}
