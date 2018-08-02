let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'spacer',
			title: 'Spacer',
			type: 'structure',
			icon: require( './icon.svg' ),
			callback: this.callback
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

	/**
	 * When the component is added. What should we do?
	 *
	 * @since 1.8.0
	 */
	callback() {
		alert( 'test' );
	}
}
new Component().init();
