import panelTemplate from './add.html';
import './add.scss';
window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Add {
	constructor() {

		// Menu Configurations.
		this.name = 'add';
		this.$element = null;
		this.tooltip = 'Add Block Component';
		this.priority = 1;
		this.iconClasses = 'genericon genericon-plus add-element-trigger';
		this.selectors = [ 'html' ];

		// Panel Configurations.
		this.panel = {
			title: 'Block Components',
			height: '640px',
			width: '500px'
		};

		this.components = [];
	}

	/**
	 * Instantiate this service.
	 *
	 * @return {Add} Class instance.
	 */
	init() {
		BOLDGRID.EDITOR.Controls.registerControl( this );

		return this;
	}

	/**
	 * Add a new component to the list.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} config List of control.s
	 */
	register( config ) {
		this.components.push( config );
	}

	/**
	 * Create the option UI.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} jQuery Control object.
	 */
	createUI() {
		return $(
			_.template( panelTemplate )( {
				components: this.components,
				printComponent: function( type, component ) {
					if ( type === component.type ) {
						return `
						<label data-name="${component.name}">
							<span class="component-icon">${component.icon}</span>
							<span class="component-name">${component.title}</span>
						</label>`;
					}
				}
			} )
		);
	}

	/**
	 * Setup the handlers for all components.
	 *
	 * @since 1.8.0
	 */
	_bindHandlers() {
		let $context = BG.Panel.$element.find( '.bg-component' );
		for ( let component of this.components ) {
			$context.find( `[data-name="${component.name}"]` ).on( 'click', () => {
				BG.Panel.closePanel();
				component.callback();
			} );
		}
	}

	/**
	 * When the user clicks on the menu, open the panel.
	 *
	 * @since 1.8.0
	 */
	onMenuClick() {
		let $control = this.createUI();

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( this );

		this._bindHandlers();
	}
}
