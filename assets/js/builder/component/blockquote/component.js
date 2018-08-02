let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'blockquote',
			title: 'Blockquote',
			type: 'design',
			icon: '<span class="dashicons dashicons-editor-quote"></span>',
			callback: () => alert( 'fff' )
		};
	}

	/**
	 * Initiate the class binding all handlers.
	 *
	 * @since 1.8.0
	 */
	init() {
		BG.$window.on( 'boldgrid_editor_loaded', () => BG.Service.component.register( this.config ) );
	}
}
new Component().init();
