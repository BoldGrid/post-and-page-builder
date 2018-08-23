let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'list',
			title: 'List',
			type: 'design',
			icon: require( './icon.svg' ),
			onInsert: 'prependColumn',
			getDragElement: () => $( this.getTemplate() )
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
	 * Insert a Blockquote.
	 *
	 * @since 1.8.0
	 *
	 * @return {string} Sample Blockqoute.
	 */
	getTemplate() {
		return `
			<ul>
				<li>Item 1</li>
				<li>Item 2</li>
				<li>Item 3</li>
				<li>Item 4</li>
			</ul>
		`;
	}
}
new Component().init();
