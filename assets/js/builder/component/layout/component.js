let $ = jQuery,
	BG = BOLDGRID.EDITOR;

import uiTemplate from './ui.html';

export class Component {
	constructor() {
		this.config = {
			name: 'layout',
			title: 'Layout',
			type: 'structure',
			icon: '<span class="dashicons dashicons-layout"></span>',
			callback: () => this.openPanel()
		};

		this.uiTemplate = _.template( uiTemplate );

		this.layouts = [
			{
				screenshot: './remote-url.png',
				html: require( './design-1/template.html' )
			},
			{
				screenshot: './remote-url.png',
				html: require( './design-1/template.html' )
			}
		];
	}

	/**
	 * Initiate the class binding all handlers.
	 *
	 * @since 1.8.0
	 */
	init() {
		BG.$window.on( 'boldgrid_editor_loaded', () => BG.Service.component.register( this.config ) );
	}

	createUI() {
		this.$ui = this.uiTemplate( {
			layouts: this.layouts
		} );

		return this.$ui;
	}

	openPanel() {
		let $control = this.createUI();

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( {
			panel: {
				title: 'Insert Layout',
				height: '640px',
				width: '450px'
			}
		} );
	}
}
new Component().init();
