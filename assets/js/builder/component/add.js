import panelTemplate from './add.html';
import './add.scss';
import { Drag } from './drag.js';

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
			title: 'Add Block Component',
			height: '640px',
			width: '500px'
		};

		this.defaults = {
			type: 'design',
			insertType: 'drag',
			priority: 40,
			onClick: component => this.sendToEditor( component ),
			onDragDrop: ( component, $el ) => this.openCustomization( component, $el )
		};

		this.components = [];

		this.dragHandler = new Drag();
	}

	/**
	 * Instantiate this service.
	 *
	 * @return {Add} Class instance.
	 */
	init() {
		BOLDGRID.EDITOR.Controls.registerControl( this );

		this.dragHandler.bindBaseEvents();
		BG.Service.event.on( 'cleanup', $markup => this.removeShortcodeWrap( $markup ) );

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
		this.components.push( { ...this.defaults, ...config } );
	}

	/**
	 * Create the option UI.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} jQuery Control object.
	 */
	createUI() {
		let post_type = $( '#post_type' ).val();

		if ( 'crio_page_header' === post_type ) {

			// Remove 'Layout & Structuring' from crio_page_header post types.
			BoldgridEditor.plugin_configs.component_controls.types = [
				{
					name: 'header',
					title: 'Headers'
				},
				{
					name: 'design',
					title: 'Design'
				},
				{
					name: 'media',
					title: 'Media'
				},
				{
					name: 'widget',
					title: 'Widgets'
				}
			];
		} else {

			// Remove 'Headers' from non crio_page_header post types.
			BoldgridEditor.plugin_configs.component_controls.types = [
				{
					name: 'structure',
					title: 'Layout & Formatting'
				},
				{
					name: 'design',
					title: 'Design'
				},
				{
					name: 'media',
					title: 'Media'
				},
				{
					name: 'widget',
					title: 'Widgets'
				}
			];
		}

		if ( this.$ui ) {
			return this.$ui;
		}

		// Alphabetical order.
		this.components = _.sortBy( this.components, val => val.title );
		this.components = _.sortBy( this.components, val => val.priority );

		this.$ui = $(
			_.template( panelTemplate )( {
				sections: BoldgridEditor.plugin_configs.component_controls.types,
				components: this.components,
				printComponent: function( type, component ) {
					if ( type === component.type ) {
						return `
						<label ${'drag' === component.insertType ? 'draggable="true"' : ''} data-name="${component.name}"
							data-insert-type="${component.insertType}">
							<span class="grip"><span class="dashicons dashicons-move"></span></span>
							<span class="dashicons dashicons-external component-popup"></span>
							<span class="dashicons dashicons-plus-alt insert-component"></span>
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
			let selector = `
					[data-name="${component.name}"] .insert-component,
					[data-name="${component.name}"][data-insert-type="popup"]
				`;

			$context.find( selector ).on( 'click', e => {
				BG.Service.component.validateEditor();
				BG.Controls.$container.validate_markup();
				component.onClick( component );
			} );

			this.dragHandler.bindStart( component );
		}

		this.setupAccordion( $context );
	}

	/**
	 * Default process to occur when a component is clicked.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configs.
	 */
	sendToEditor( component ) {
		let $inserted,
			$html = component.getDragElement();

		$html.addClass( 'bg-inserted-component' );

		// Prepend the first column on the page with the new component.
		if ( 'prependColumn' === component.onInsert ) {
			this.prependContent( $html );

			this.scrollToElement( $html, 200 );
			BG.Service.popover.section.transistionSection( $html );

			// Call the function.
		} else if ( component.onInsert ) {
			component.onInsert( $html );

			// Insert the HTML.
		} else {
			send_to_editor( $html[0].outerHTML );
		}

		$inserted = BG.Controls.$container.find( '.bg-inserted-component' ).last();
		$inserted.removeClass( 'bg-inserted-component' );

		this.openCustomization( component, $inserted );
	}

	/**
	 * Add a jQuery element to the first column on the page.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $html Element.
	 */
	prependContent( $html ) {
		let currentNode = BG.mce.selection.getNode(),
			$currentNestedColumn = $( currentNode ).closest( '.row .row [class*="col-md-"]' ),
			$firstColumn = BG.Controls.$container.$body
				.find( '[class*="col-md-"]:not(.boldgrid-slider [class*="col-md-"])' )
				.first();

		if ( $currentNestedColumn.length ) {
			$firstColumn = $currentNestedColumn;
		}

		if ( $html.is( '.boldgrid-section, .boldgrid-section-wrap' ) ) {
			$firstColumn = BG.Controls.$container.$body;
		}

		if ( ! $firstColumn.length ) {
			let $newSection = $( `
				<div class="boldgrid-section">
					<div class="container">
						<div class="row">
							<div class="col-md-12 col-sm-12 col-xs-12">
							</div>
						</div>
					</div>
				</div>
			` );

			BG.Controls.$container.$body.prepend( $newSection );
			$firstColumn = $newSection.find( '[class*="col-md-"]' );
		}

		$firstColumn.prepend( $html );
	}

	/**
	 * Open the customization panel for a component.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configs.
	 * @param  {jQuery} $inserted Element to focus.
	 */
	openCustomization( component, $inserted ) {
		let control = BG.Controls.get( component.name );

		if ( control ) {
			BG.Controls.$menu.targetData[component.name] = $inserted;
			$inserted.click();
			control.onMenuClick();
		}
	}

	/**
	 * Scroll to an element on the iFrame.
	 *
	 * @since 1.2.7
	 */
	scrollToElement( $newSection, duration ) {
		$( 'html, body' ).animate(
			{
				scrollTop: $newSection.offset().top
			},
			duration
		);
	}

	/**
	 * Make sure that the editor is not in a state where we cannot add new elements.
	 *
	 * @since 1.8.0
	 */
	validateEditor() {
		this.removeShortcodeWrap( BG.Controls.$container.$body );

		if ( ! BG.Controls.$container.$body.html() ) {
			BG.Controls.$container.$body.prepend( '<p></p>' );
		}
	}

	/**
	 * Loop through all boldgrid shortcodes, if any are empty, remove them.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $context A selection to search within.
	 */
	removeShortcodeWrap( $context ) {
		$context.find( '.boldgrid-shortcode' ).each( ( i, el ) => {
			let $el = $( el );
			if ( IMHWPB.Editor.instance.mce_element_is_empty( $el ) ) {
				$el.remove();
			}
		} );
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
		this.openPanel();
	}

	/**
	 * Open Panel.
	 *
	 * @since 1.8.0
	 */
	openPanel() {
		let $control = this.createUI();

		BG.Panel.resetPosition();

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( this );

		this._bindHandlers();
	}
}
