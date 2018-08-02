let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'layout',
			title: 'Layout',
			type: 'structure',
			icon: '<span class="dashicons dashicons-layout"></span>',
			callback: () => {}
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
