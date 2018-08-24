let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'block',
			title: 'Block',
			type: 'structure',
			insertType: 'popup',
			icon: require( './icon.svg' ),
			onClick: () => {
				BG.Panel.closePanel();
				BG.CONTROLS.Section.enableSectionDrag();
			}
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
