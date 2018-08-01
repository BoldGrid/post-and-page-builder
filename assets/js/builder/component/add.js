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

		this.components = [

			// Structure & Layout.
			{
				name: 'block',
				title: 'Block',
				type: 'structure',
				icon: require( './icons/block.svg' )
			},
			{
				name: 'layout',
				title: 'Layout',
				type: 'structure',
				icon: '<span class="dashicons dashicons-layout"></span>'
			},
			{
				name: 'spacer',
				title: 'Spacer',
				type: 'structure',
				icon: require( './icons/space.svg' )
			},

			// Design.
			{
				name: 'button',
				title: 'Button',
				type: 'design',
				icon: require( './icons/buttons.svg' )
			},
			{
				name: 'list',
				title: 'List',
				type: 'design',
				icon: require( './icons/list.svg' )
			},
			{
				name: 'blockquote',
				title: 'Blockquote',
				type: 'design',
				icon: '<span class="dashicons dashicons-editor-quote"></span>'
			},
			{
				name: 'hr',
				title: 'Divider',
				type: 'design',
				icon: require( './icons/divider.svg' )
			},
			{
				name: 'custom-html',
				title: 'HTML',
				type: 'design',
				icon: '<span class="dashicons dashicons-media-code"></span>'
			},

			// Media.
			{
				name: 'image',
				title: 'Image',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-image"></span>'
			},
			{
				name: 'audio',
				title: 'Audio',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-audio"></span>'
			},
			{
				name: 'video',
				title: 'Video',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-video"></span>'
			},
			{
				name: 'map',
				title: 'Map',
				type: 'media',
				icon: '<span class="dashicons dashicons-location-alt"></span>'
			}
		];
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
