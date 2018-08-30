let $ = jQuery,
	BG = BOLDGRID.EDITOR;

import uiTemplate from './ui.html';
import './style.scss';

export class Component {
	constructor() {
		this.config = {
			name: 'layout',
			title: 'Layout',
			type: 'structure',
			insertType: 'popup',
			icon: '<span class="dashicons dashicons-layout"></span>',
			onClick: () => this.openPanel()
		};

		this.uiTemplate = _.template( uiTemplate );

		this.layouts = [
			{
				name: 'design-10',
				icon: require( './design-10/icon.svg' ),
				html: require( './design-10/template.html' )
			},
			{
				name: 'design-1',
				icon: require( './design-1/icon.svg' ),
				html: require( './design-1/template.html' )
			},
			{
				name: 'design-2',
				icon: require( './design-2/icon.svg' ),
				html: require( './design-2/template.html' )
			},
			{
				name: 'design-3',
				icon: require( './design-3/icon.svg' ),
				html: require( './design-3/template.html' )
			},
			{
				name: 'design-4',
				icon: require( './design-4/icon.svg' ),
				html: require( './design-4/template.html' )
			},
			{
				name: 'design-6',
				icon: require( './design-6/icon.svg' ),
				html: require( './design-6/template.html' )
			},
			{
				name: 'design-7',
				icon: require( './design-7/icon.svg' ),
				html: require( './design-7/template.html' )
			},
			{
				name: 'design-5',
				icon: require( './design-5/icon.svg' ),
				html: require( './design-5/template.html' )
			},
			{
				name: 'design-8',
				icon: require( './design-8/icon.svg' ),
				html: require( './design-8/template.html' )
			},
			{
				name: 'design-9',
				icon: require( './design-9/icon.svg' ),
				html: require( './design-9/template.html' )
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

	/**
	 * Open the controls panel.
	 *
	 * @since 1.8.0
	 */
	openPanel() {
		let $control = this._createUI();

		this._bindHandlers();
		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );

		BG.Panel.open( {
			panel: {
				title: 'Insert Layout',
				height: '640px',
				width: '340px'
			}
		} );
	}

	/**
	 * Create UI.
	 *
	 * @since
	 * @return {[type]} [description]
	 */
	_createUI() {
		if ( this.$ui ) {
			return this.$ui;
		}

		this.$ui = $(
			this.uiTemplate( {
				layouts: this.layouts
			} )
		);

		return this.$ui;
	}

	/**
	 * Bind all event handlers.
	 *
	 * @since 1.8.0
	 */
	_bindHandlers() {
		this._setupBack();
		this._setupInsert();
	}

	/**
	 * When the user clicks on the back button return them to add components.
	 *
	 * @since 1.8.0
	 */
	_setupBack() {
		this.$ui.find( '.back' ).on( 'click', e => {
			e.preventDefault();
			BG.Panel.clear();
			BG.Controls.get( 'add' ).openPanel();
		} );
	}

	/**
	 * When the user clicks on a layout, replace the or insert the layout to the top of the page.
	 *
	 * @since 1.8.0
	 */
	_setupInsert() {
		this.$ui.find( '.bg-layout' ).on( 'click', e => {
			const $target = $( e.currentTarget ),
				layoutName = $target.data( 'layout' );

			let layout = _.find( this.layouts, val => val.name === layoutName ),
				$element = $( layout.html );

			BG.Controls.$container.$body.prepend( $element );
			BG.Service.component.scrollToElement( $element, 200 );
			BG.Service.popover.section.transistionSection( $element );
		} );
	}
}
