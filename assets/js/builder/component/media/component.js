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
				insertType: 'popup',
				frameState: 'insert',
				icon: '<span class="dashicons dashicons-format-image"></span>'
			},
			{
				name: 'gallery',
				title: 'Gallery',
				type: 'media',
				insertType: 'popup',
				frameState: 'gallery',
				icon: '<span class="dashicons dashicons-format-gallery"></span>'
			},
			{
				name: 'video',
				title: 'Video',
				type: 'media',
				insertType: 'popup',
				frameState: 'video-playlist',
				icon: '<span class="dashicons dashicons-format-video"></span>'
			},
			{
				name: 'audio',
				title: 'Audio',
				type: 'media',
				insertType: 'popup',
				frameState: 'playlist',
				icon: '<span class="dashicons dashicons-format-audio"></span>'
			},
			{
				name: 'embed',
				title: 'Embed',
				type: 'media',
				insertType: 'popup',
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
				component.onClick = () => {
					BG.Panel.closePanel();
					wp.media.editor.open();
					wp.media.frame.setState( component.frameState );
				};

				BG.Service.component.register( component );
			} );
		} );
	}
}
new Component().init();
