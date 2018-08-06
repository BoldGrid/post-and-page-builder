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

		this.sections = [
			{ name: 'structure', title: 'Layout & Formatting' },
			{ name: 'design', title: 'Design' },
			{ name: 'media', title: 'Media' },
			{ name: 'widget', title: 'Widgets' }
		];

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
		if ( this.$ui ) {
			return this.$ui;
		}

		this.$ui = $(
			_.template( panelTemplate )( {
				sections: this.sections,
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

		return this.$ui;
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

		this.setupAccordion( $context );
	}

	/**
	 * Bind the click event for the accordion headings.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $context Element.
	 */
	setupAccordion( $context ) {
		$context.find( '.component-heading' ).on( 'click', e => {
			let $target = $( e.currentTarget );
			$target
				.next( '.bg-component-list' )
				.stop()
				.slideToggle( 'fast', () => {
					$target.toggleClass( 'collapsed', ! $target.next( '.bg-component-list' ).is( ':visible' ) );
				} );
		} );
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
