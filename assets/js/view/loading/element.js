import './style.scss';
import loadingGraphic from '../../../../assets/image/boldgrid-logo.svg';

export class Element {

	/**
	 * Show the loading element.
	 *
	 * @since 1.9.0
	 */
	show() {
		this._getElement().show();
	}

	/**
	 * Hide the loading element.
	 *
	 * @since 1.9.0
	 */
	hide() {
		this._getElement().hide();
	}

	/**
	 * Get the loading element.
	 *
	 * @since 1.9.0
	 *
	 * @return {$} Loading Element.
	 */
	_getElement() {
		if ( ! this.$element ) {
			this.$element = $( this._getHTML() );
			$( 'body' ).append( this.$element );
		}

		return this.$element;
	}

	/**
	 * Get the HTML needed for the loading graphic.
	 *
	 * @since 1.9.0
	 *
	 * @return {string} Page markup.
	 */
	_getHTML() {
		return `
			<div class="bgppb-page-loading">
				<span class="bgppb-page-loading__logo">${loadingGraphic}</span>
				<span class="bgppb-page-loading__spinner"></span>
			</div>
		`;
	}
}
