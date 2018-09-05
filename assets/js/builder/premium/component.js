let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'premium',
			title: 'Premium Designs',
			type: 'design',
			icon: require( '../../../image/bg-logo.svg' ),
			insertType: 'popup',
			priority: 5,
			onClick: () =>
				window.open(
					BoldgridEditor.plugin_configs.urls.premium_key + '?source=plugin-add-component',
					'_blank'
				)
		};
	}

	/**
	 * Add a Premium Upgrade component.
	 *
	 * @since 1.0.0
	 */
	init() {
		BG.$window.on( 'boldgrid_editor_loaded', () => BG.Service.component.register( this.config ) );
	}
}
