import './style.scss';
import { Banner } from '../../view/banner';
import { DefaultEditor } from '../../forms/default-editor';

export class Page {
	constructor() {
		this.banner = new Banner();
		this.defaultEditor = new DefaultEditor();

		this.$page = $( '.bgppb-page--settings .bg-content' );
		this.title = 'Post and Page Builder Settings';
		this.description = 'Configuration options for the BoldGrid Post and Page Builder';
	}

	/**
	 * Init the page events.
	 *
	 * @since 1.9.0
	 */
	init() {
		this.setPageHTML();
		this.updateUnsplashHotlinks();
	}

	/**
	 * Update the Unsplash hotlinks.
	 *
	 * @since 1.21.4
	 */
	updateUnsplashHotlinks() {
		var $button = this.$page.find( '.button-secondary.update-unsplash-hotlinks' );
		$button.on( 'click', function( event ) {
			event.preventDefault();
			$.ajax( {
				url: ajaxurl,
				type: 'POST',
				data: {
					nonce: $button.data( 'nonce' ),
					action: 'update_unsplash_hotlinks'
				},
				success: function( response ) {
					if ( response.success ) {
						console.log( response );
						$button.text( 'Updated' );
					}
				}
			} );
		} );
	}

	/**
	 * Set the page HTML.
	 *
	 * @since 1.9.0
	 */
	setPageHTML() {
		this.$page.find( 'bgppb-settings-view' ).replaceWith( `
			${this.banner.getHTML( this.title, this.description ) }
			<div class="bgppb-page__body">
				${BoldgridEditor.cards.premium}
				${BoldgridEditor.cards.editor}
				${BoldgridEditor.cards.utilities}
			</div>
		` );

		this.$page.find( '#bgppb_preferred_editor .bglib-card-footer' ).html( this.defaultEditor.getForm() );
	}
}
