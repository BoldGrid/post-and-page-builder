let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Component {
	constructor() {
		this.config = {
			name: 'blockquote',
			title: 'Blockquote',
			type: 'design',
			onInsert: 'prependColumn',
			icon: '<span class="dashicons dashicons-editor-quote"></span>',
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
			<blockquote class="bg-blockquote border">
				"Targeting best in class and possibly build ROI. Funneling user
				stories so that as an end result, we create a better customer experience."
			</blockquote>
		`;
	}
}
new Component().init();
