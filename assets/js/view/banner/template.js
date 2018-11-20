import './style.scss';

export class Template {

	/**
	 * Get the HTML for a Page Banner
	 *
	 * @since 1.9.0
	 *
	 * @param  {string} pageTitle   Page Title.
	 * @param  {string} description Description of page.
	 * @return {string}             Banner HTML.
	 */
	getHTML( pageTitle, description ) {
		let $el = $( `
			<div class="bgppb-banner">
				<div class="bgppb-banner__branding">
					<img src="https://ps.w.org/post-and-page-builder/assets/icon-128x128.png">
					<div class="version">Version: ${BoldgridEditor.pluginVersion}</div>
				</div>
				<div class="bgppb-banner__title">
					<h1>${pageTitle}</h1>
					<p>${description}</p>
				</div>
			</div>
		` );

		this.applyBackgroundColor( $el, 2 );

		return $el[0].outerHTML;
	}

	/**
	 * Set the background for the page banner.
	 *
	 * @since 1.9.0
	 *
	 * @param  {$} $el           Jquery Element.
	 * @param  {integer} colorNum Number of color.
	 */
	applyBackgroundColor( $el, colorNum ) {
		if ( BoldgridEditor.adminColors ) {
			$el.css( 'cssText', `
				background-color: ${BoldgridEditor.adminColors.colors[ colorNum ]};
				color: ${BoldgridEditor.adminColors.icon_colors.current};
			` );
		}
	}
}
