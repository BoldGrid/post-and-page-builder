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
		this.rowSlider = {
			name: 'premium-content-slider',
			title: 'Content Sliders',
			type: 'design',
			icon: '<span class="dashicons dashicons-images-alt"></span>',
			insertType: 'popup',
			priority: 90,
			onClick: () =>
				window.open(
					BoldgridEditor.plugin_configs.urls.premium_key +
						'?source=plugin-add-component-content-slider',
					'_blank'
				)
		};

		this.sectionSlider = {
			name: 'premium-section-slider',
			title: 'Section Sliders',
			type: 'design',
			icon: '<span class="dashicons dashicons-slides"></span>',
			insertType: 'popup',
			priority: 90,
			onClick: () =>
				window.open(
					BoldgridEditor.plugin_configs.urls.premium_key +
						'?source=plugin-add-component-section-slider',
					'_blank'
				)
		};

		this.postList = {
			name: 'premium-post-list',
			title: 'Post Snippet',
			type: 'widget',
			icon: '<span class="dashicons dashicons-admin-post"></span>',
			insertType: 'popup',
			priority: 95,
			onClick: () =>
				window.open(
					BoldgridEditor.plugin_configs.urls.premium_key + '?source=plugin-add-component-post-list',
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
		BG.$window.on( 'boldgrid_editor_loaded', () => {
			BG.Service.component.register( this.config );
			BG.Service.component.register( this.rowSlider );
			BG.Service.component.register( this.sectionSlider );
			BG.Service.component.register( this.postList );
		} );
	}
}
