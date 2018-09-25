var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import controlTemplate from './control.html';
import { Placeholder } from '../../drag/placeholder.js';

export class Instance {
	constructor( component ) {
		this.component = component;
		this.insertedNode = false;
		this.controlTemplate = _.template( controlTemplate );

		this.panelConfig = {
			height: '650px',
			width: '450px',
			customizeCallback: true,
			customizeSupport: [
				'margin',
				'padding',
				'border',
				'box-shadow',
				'border-radius',
				'animation',
				'background-color',
				'device-visibility',
				'customClasses'
			]
		};
	}

	/**
	 * Setup a single shortcode component.
	 *
	 * @since 1.8.0
	 */
	setup() {

		// When the user clicks the add button.
		this.component.js_control.onClick = () => {
			BG.Panel.showLoading();

			this.insertedNode = true;
			let $sampleElement = $( '<p></p>' );

			BG.Controls.$container
				.find( '[class*="col-md-"]' )
				.first()
				.prepend( $sampleElement );

			BG.Service.component.scrollToElement( $sampleElement, 200 );
			BOLDGRID.EDITOR.mce.selection.select( $sampleElement[0] );
			BOLDGRID.EDITOR.mce.selection.setContent( this.getShortcode() );
			BOLDGRID.EDITOR.mce.undoManager.add();
		};

		// Get the drag element.
		this.component.js_control.getDragElement = () => {
			let $placeholder = $( new Placeholder().getPlaceholderHtml() );
			$placeholder.attr( 'data-imhwpb-draggable', true );
			$placeholder.css( { padding: '30px' } );
			return $placeholder;
		};

		// When the shortcode is dropped.
		this.component.js_control.onDragDrop = ( component, $target ) => {
			this.insertedNode = true;
			BOLDGRID.EDITOR.mce.selection.select( $target[0] );
			BOLDGRID.EDITOR.mce.selection.setContent( this.getShortcode() );
		};

		BG.Service.component.register( this.component.js_control );
	}

	/**
	 * Get a sample shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @return {string} Shortcode.
	 */
	getShortcode() {
		return `
			<div class="boldgrid-shortcode" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
		`;
	}

	/**
	 * Get the content for the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  {string} type      Type of widget data.
	 * @param  {object} component Component configuration.
	 */
	getShortcodeData( type, attrs ) {
		let action = 'boldgrid_component_' + this.component.name;
		if ( 'form' === type ) {
			action = action + '_form';
		}

		let data = attrs ? JSON.parse( decodeURIComponent( attrs ) ) : {};

		/* eslint-disable */
		data.action = action;
		data.post_id = BoldgridEditor.post_id;
		data.boldgrid_editor_gridblock_save = BoldgridEditor.nonce_gridblock_save;
		/* eslint-enable */

		return $.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 10000,
			data: data
		} );
	}

	/**
	 * Update target.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} Editting target
	 */
	findTarget() {
		let $wpView = $( BG.mce.selection.getNode() ),
			$dragWrap = $wpView.parent( '[data-imhwpb-draggable="true"]' );

		return $dragWrap;
	}

	/**
	 * Open the customization panel for a component config.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} viewInstance MCE view object.
	 * @param  {object} component Component Configuration.
	 * @param  {function} update Update the shortcode method.
	 */
	openPanel( viewInstance, update ) {
		let $template = $(
			this.controlTemplate( {
				component: this.component
			} )
		);

		// AJAX the form. This will preset values.
		this._loadForm( $template, viewInstance, update );

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $template );
		BG.Menu.$element.targetData[this.component.name] = this.findTarget();

		let panelConfig = _.extend( this.panelConfig, {
			title: `Customize ${this.component.js_control.title}`
		} );

		BG.Panel.open( {
			name: this.component.name,
			panel: panelConfig
		} );

		BG.Panel.enterCustomization();
		BG.Panel.customizeOpenEvent();
	}

	/**
	 * Load the customization form into the template
	 *
	 * @since 1.8.0
	 *
	 * @param {object} viewInstance MCE view object.
	 */
	_loadForm( $template, viewInstance, update ) {
		let fail = () => {
			$template
				.find( 'form' )
				.replaceWith( '<p style="color:red">Unable to Load Form. Please refresh and try again.</p>' );
		};

		let $widgetsInput = $template.find( '.widget-inputs' );

		this.getShortcodeData( 'form', viewInstance.shortcode.attrs.named.opts )
			.done( response => {
				if ( response && response.content ) {
					$widgetsInput.html( response.content );
					this._bindFormInputs( update );
				} else {
					fail();
				}
			} )
			.fail( () => fail() );
	}

	/**
	 * When the form is submitted uodate the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configuration.
	 * @param  {function} update Update the shortcode method.
	 */
	_bindFormInputs( update ) {
		BG.Panel.$element.find( '[data-control-name="design"] form' ).submit( e => {
			e.preventDefault();
			let data = {},
				$form = $( e.target );

			_.each( $form.serializeArray(), val => {
				data[val.name] = val.value;
			} );

			$form.find( 'input:checkbox' ).each( ( index, el ) => {
				data[el.name] = el.checked ? 1 : 0;
			} );

			let values = encodeURIComponent( JSON.stringify( data ) );
			update( `[boldgrid_component type="${this.component.name}" opts="${values}"]` );
		} );
	}
}
