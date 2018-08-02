let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {

		// Listing states: wp.media.frame.setState( 'add-media' ).states.models
		this.config = [
			{
				name: 'image',
				title: 'Image',
				type: 'media',
				frameState: 'insert',
				icon: '<span class="dashicons dashicons-format-image"></span>'
			},
			{
				name: 'gallery',
				title: 'Gallery',
				type: 'media',
				frameState: 'gallery',
				icon: '<span class="dashicons dashicons-format-gallery"></span>'
			},
			{
				name: 'video',
				title: 'Video',
				type: 'media',
				frameState: 'video-playlist',
				icon: '<span class="dashicons dashicons-format-video"></span>'
			},
			{
				name: 'audio',
				title: 'Audio',
				type: 'media',
				frameState: 'playlist',
				icon: '<span class="dashicons dashicons-format-audio"></span>'
			},
			{
				name: 'embed',
				title: 'Embed',
				type: 'media',
				frameState: 'embed',
				icon: '<span class="dashicons dashicons-admin-media"></span>'
			}
		];
	}

	/**
	 * Initiate the class binding all handlers.
	 *
	 * @since 1.8.0
	 */
	init() {
		BG.$window.on( 'boldgrid_editor_loaded', () => {
			_.each( this.config, component => {
				component.callback = () => {
					wp.media.editor.open();
					wp.media.frame.setState( component.frameState );
				};

				BG.Service.component.register( component );
			} );
		} );
	}
}
new Component().init();
