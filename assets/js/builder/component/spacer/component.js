let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.sampleTemplate = wp.template( 'boldgrid-editor-empty-section' );

		this.config = {
			name: 'spacer',
			title: 'New Section',
			type: 'structure',
			icon: require( './icon.svg' ),
			insertType: 'insert',
			onClick: () => this.onClick(),
			getDragElement: () => $( this.sampleTemplate() )
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
	onClick() {
		var $container = BG.Controls.$container,
			$newSection = this.config.getDragElement();
		$container.$body.prepend( $newSection );

		BG.Service.component.scrollToElement( $newSection, 200 );
		BG.Service.popover.section.transistionSection( $newSection );
	}
}
new Component().init();
