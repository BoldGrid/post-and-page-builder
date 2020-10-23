var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import controlTemplate from './control.html';
import { Placeholder } from '../../drag/placeholder.js';

export class Instance {
	constructor( component ) {
		this.component = component;
		this.insertedNode = false;
		this.controlTemplate = _.template( controlTemplate );

		/*
		 * The following conditionals were added for 1.14.0 to
		 * provide different functionality for different widgets.
		 * For Menu widgets, we want to restrict use of PPB functionality,
		 * and send the user to the customizer. For Heading widgets
		 * we want to provide all the possible functionality available
		 * within PPB.
		 */
		if ( 'wp_boldgrid_component_menu' === component.name ) {
			this.panelConfig = {
				height: '650px',
				width: '450px',
				customizeCallback: true,
				customizeSupport: []
			};
		} else if (
			'wp_boldgrid_component_page_title' === component.name ||
			'wp_boldgrid_component_site_title' === component.name ||
			'wp_boldgrid_component_site_description' === component.name
		) {
			this.panelConfig = {
				height: '775px',
				width: '450px',
				customizeCallback: true,
				customizeSupport: [
					'fontSize',
					'fontColor',
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
		} else {
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
		var headingWidgetNames = [
			'wp_boldgrid_component_page_title',
			'wp_boldgrid_component_site_title',
			'wp_boldgrid_component_site_description'
		];

		/*
		 * Menu component shortcodes need to have the boldgrid-component-menu added
		 * to ensure proper styling, and detection when validating that menu locations
		 * have been set properly
		 */
		if ( 'wp_boldgrid_component_menu' === this.component.name ) {
			return `
			<div class="boldgrid-component-menu boldgrid-shortcode" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
			`;
		}

		/*
		 * Adding the bgc-heading class to heading widgets ensures that when they use the
		 * default font-family in PPB, that they inherit the default heading font, not body font.
		 */
		if ( headingWidgetNames.includes( this.component.name ) ) {
			return `
			<div class="boldgrid-shortcode bgc-heading" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
		`;
		}
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
			timeout: 20000,
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
	 * Show the loading graphic.
	 *
	 * @since 1.8.0
	 */
	initLoading() {
		this.updating = true;
		BG.Panel.showLoading();
	}

	/**
	 * Hide the loading graphic.
	 *
	 * @since 1.8.0
	 */
	stopLoading() {
		if ( this.updating ) {
			this.updating = false;
			BG.Panel.hideLoading();
		}
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

		this.viewInstance = viewInstance;
		this.update = update;
		this.$form = $template.find( '[data-control-name="design"] form' );

		// AJAX the form. This will preset values.
		this._loadForm( $template );

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
	 */
	_loadForm( $template ) {
		let fail = () => {
			$template
				.find( 'form' )
				.replaceWith( '<p style="color:red">Unable to Load Form. Please refresh and try again.</p>' );
		};

		let $widgetsInput = $template.find( '.widget-inputs' );

		this.getShortcodeData( 'form', this.viewInstance.shortcode.attrs.named.opts )
			.done( response => {
				if ( response && response.content ) {
					$widgetsInput.html( response.content );
					this._bindFormInputs();
				} else {
					fail();
				}
			} )
			.fail( () => fail() );
	}

	/**
	 * Update the shortcode
	 *
	 * @since 1.8.0
	 */
	_updateShortcode() {
		let data = {};

		if ( this.updating ) {
			return;
		}

		this.initLoading();

		_.each( this.$form.serializeArray(), val => {
			data[val.name] = val.value;
		} );

		this.$form.find( 'input:checkbox' ).each( ( index, el ) => {
			data[el.name] = el.checked ? 1 : 0;
		} );

		let values = encodeURIComponent( JSON.stringify( data ) );
		this.panelEdit = true;
		this.update( `[boldgrid_component type="${this.component.name}" opts="${values}"]` );
	}

	/**
	 * When the form is submitted uodate the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configuration.
	 * @param  {function} update Update the shortcode method.
	 */
	_bindFormInputs() {
		let debounced = _.debounce( () => {
			this._updateShortcode();
		}, 1500 );

		this.$form.find( 'button.bgc_register_location' ).on( 'click', e => this.registerMenuLocation( e ) );

		this.$form.on( 'change', () => debounced() );
		this.$form.on( 'input', () => debounced() );

		this.$form.on( 'submit', e => {
			e.preventDefault();
			this._updateShortcode();
		} );
	}

	registerMenuLocation( event ) {
		let $button = $( event.currentTarget ),
			$locationInput = $button.parent().siblings( 'input.bgc_menu_location' ),
			$spinner = $button.siblings( 'span.spinner' ),
			$nonce = $button.siblings( 'span.register_menu_nonce' ),
			locationId,
			$locationIdInput = $button.siblings( 'input' );
		if ( $locationInput.val() ) {
			$button.attr( 'disabled', true );
			$spinner.toggleClass( 'is-active' );
			locationId = this.getUniqueId( $locationInput.val() );
			$.post( ajaxurl, {
				action: 'crio_premium_register_menu_location',
				location_name: $locationInput.val(),
				location_id: locationId,
				nonce: $nonce.text(),
				template_id: $( '#post_ID' ).val()
			} )
				.done( function( data ) {
					if ( data.registered ) {
						$button.html( 'Menu Location Registered' );
						$locationInput.attr( 'disabled' );
						$locationIdInput.val( data.locationId );
					} else {
						$button.attr( 'disabled', false );
					}
				} )
				.fail( function( data ) {
					$button.attr( 'disabled', false );
				} )
				.always( function( data ) {
					$spinner.toggleClass( 'is-active' );
				} );
		}
	}

	/**
	 * get Unique Id
	 *
	 * @since 1.1.0
	 *
	 * @param {string} locationName
	 *
	 * @return {string} Unique Id
	 */
	getUniqueId( locationName ) {
		locationName = locationName.toLowerCase();
		locationName = locationName.replace( /\s/g, '-' );
		locationName = locationName.replace( /_/g, '-' );
		locationName = locationName + '_' + Math.floor( Math.random() * 999 + 1 ).toString();

		return locationName;
	}
}
