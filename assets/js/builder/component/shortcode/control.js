import errorTemplate from '../widget/error.html';

export class Control {
	constructor() {
		this.componentShortcodes = {};

		this.defaultShortcodes = [
			'boldgrid_component',
			'wp_caption',
			'caption',
			'gallery',
			'playlist',
			'audio',
			'video',
			'embed'
		];

		this.errorTemplate = _.template( errorTemplate );
	}

	/**
	 * Setup all components.
	 *
	 * @since 1.8.0
	 */
	init() {
		this.register();
	}

	/**
	 * Register the standard mce boldgrid component view.
	 *
	 * @since 1.11.0
	 */
	register() {
		let self = this;
		let shortcodes = BoldgridEditor.shortcodes.filter( val => {
			return ! this.defaultShortcodes.includes( val );
		} );

		for ( let shortcode of shortcodes ) {
			wp.mce.views.register( shortcode, {
				initialize: function() {
					self
						.getShortcodeData( shortcode, this.text )
						.done( response => {
							this.render( response.content || '<p></p>' );
						} )
						.fail( () => {
							self.errorTemplate( { name: shortcode } );
						} );
				},
				edit: () => {
					alert(
						'This shortcode does not support editing through the Post and Page Builder. Try editing in text mode.'
					);
				}
			} );
		}
	}

	/**
	 * Get the content for the shortcode.
	 *
	 * @since 1.11.0
	 *
	 * @param  {string} shortcodeName Shortcode tag.
	 * @param  {string} text          Shortcode.
	 */
	getShortcodeData( shortcodeName, text ) {
		let action = 'boldgrid_shortcode_' + shortcodeName;
		let data = {};

		/* eslint-disable */
		data.action = action;
		data.post_id = BoldgridEditor.post_id;
		data.boldgrid_editor_gridblock_save = BoldgridEditor.nonce_gridblock_save;
		data.text = text;
		/* eslint-enable */

		return $.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 20000,
			data: data
		} );
	}
}

new Control().init();
