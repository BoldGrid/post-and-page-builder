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

		this.defaults = {
			type: 'design',
			insertType: 'drag',
			onClick: component => this.sendToEditor( component ),
			onDragDrop: ( component, $el ) => this.openCustomization( component, $el )
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
		if ( this.$ui ) {
			return this.$ui;
		}

		// Alphabetical order.
		this.components = _.sortBy( this.components, val => val.title );

		this.$ui = $(
			_.template( panelTemplate )( {
				sections: BoldgridEditor.plugin_configs.component_controls.types,
				components: this.components,
				printComponent: function( type, component ) {
					if ( type === component.type ) {
						return `
						<label ${'drag' === component.insertType ? 'draggable="true"' : ''} data-name="${component.name}"
							data-insert-type="${component.insertType}">
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
			$context.find( `[data-name="${component.name}"] .insert-component` ).on( 'click', e => {
				BG.Panel.closePanel();
				component.onClick( component );
			} );

			// Drag and drop.
			$context.find( `[data-name="${component.name}"]` ).on( 'dragstart', event => {
				BG.Service.popover.selection = {
					name: 'content',
					component: component,
					$target: component.getDragElement()
				};

				BG.Controls.$container.drag_handlers.start( event );
			} );
		}

		// When the elemnt is inserted.
		BG.Controls.$container.on( 'drop', event => {
			let component = BG.Service.popover.selection.component;
			if ( component ) {
				BG.Panel.closePanel();
				component.onDragDrop( component, BG.Service.popover.selection.$target );
			}
		} );

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

		if ( component.onInsert ) {
			component.onInsert( $html[0].outerHTML );
		} else {
			send_to_editor( $html[0].outerHTML );
		}

		$inserted = BG.Controls.$container.find( '.bg-inserted-component' ).last();
		$inserted.removeClass( 'bg-inserted-component' );

		this.openCustomization( component, $inserted );
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
		BG.Controls.$menu.targetData[component.name] = $inserted;
		$inserted.click();
		BG.Controls.get( component.name ).onMenuClick();
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

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( this );

		this._bindHandlers();
	}
}
