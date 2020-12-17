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
			var before = '<div class="row"><div class="col-md-12 col-sm-12 col-xs-12">',
				after = '</div></div>';

			BG.Panel.showLoading();

			this.insertedNode = true;
			let $sampleElement = $( '<p></p>' );

			/*
			 * If this is a Menu widget, then we need to insert the sampleElement into the current
			 * selection, rather than the first available column.
			 */
			if (
				'wp_boldgrid_component_menu' === this.component.name ||
				'wp_boldgrid_component_page_title' === this.component.name ||
				'wp_boldgrid_component_site_title' === this.component.name ||
				'wp_boldgrid_component_logo' === this.component.name ||
				'wp_boldgrid_component_site_description' === this.component.name
			) {
				if ( $( BOLDGRID.EDITOR.mce.selection.getSel().anchorNode ).parents( '.boldgrid-section' ).length ) {
					$( BOLDGRID.EDITOR.mce.selection.getSel().anchorNode ).prepend( $sampleElement );
				} else {
					BG.Controls.$container
					.find( '[class*="boldgrid-section"]' )
					.first()
					.find( '[class*="container"]' )
					.prepend( $sampleElement );
				}
			} else {
				BG.Controls.$container
					.find( '[class*="col-md-"]' )
					.first()
					.prepend( $sampleElement );
			}

			BG.Service.component.scrollToElement( $sampleElement, 200 );

			let $currentNestedColumn = $( $sampleElement[0] ).closest( '.row [class*="col-md-"]' );

			if ( ! $currentNestedColumn.length ) {
				BOLDGRID.EDITOR.mce.selection.select( $sampleElement[0] );
				BOLDGRID.EDITOR.mce.selection.setContent( before + this.getShortcode() + after );
			} else {
				BOLDGRID.EDITOR.mce.selection.select( $sampleElement[0] );
				BOLDGRID.EDITOR.mce.selection.setContent( this.getShortcode() );
			}

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
			var before = '<div class="row"><div class="col-md-12 col-sm-12 col-xs-12">',
				after = '</div></div>';
			this.insertedNode = true;

			let $currentNestedColumn = $( $target[0] ).closest( '.row [class*="col-md-"]' );

			if ( ! $currentNestedColumn.length ) {
				BOLDGRID.EDITOR.mce.selection.select( $target[0] );
				BOLDGRID.EDITOR.mce.selection.setContent( before + this.getShortcode() + after );
			} else {
				BOLDGRID.EDITOR.mce.selection.select( $target[0] );
				BOLDGRID.EDITOR.mce.selection.setContent( this.getShortcode() );
			}
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

		/*
		 * Menu component shortcodes need to have the boldgrid-component-menu added
		 * to ensure proper styling, and detection when validating that menu locations
		 * have been set properly
		 */
		if ( 'wp_boldgrid_component_menu' === this.component.name ) {
			return `
			<div class="boldgrid-component-menu boldgrid-shortcode standard-menu-enabled header-top" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
			`;
		}

		if ( 'wp_boldgrid_component_logo' === this.component.name ) {
			return `
			<div class="boldgrid-component-logo boldgrid-shortcode" data-imhwpb-draggable="true" style="margin:15px 0px">
				[boldgrid_component type="${this.component.name}"]
			</div>
			`;
		}

		if ( 'wp_boldgrid_component_site_title' === this.component.name ) {
			return `
			<div class="boldgrid-shortcode bgc-heading bgc-site-title" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
			`;
		}

		if ( 'wp_boldgrid_component_site_description' === this.component.name ) {
			return `
			<div class="boldgrid-shortcode bgc-heading bgc-tagline" data-imhwpb-draggable="true">
				[boldgrid_component type="${this.component.name}"]
			</div>
			`;
		}

		/*
		 * Adding the bgc-heading class to heading widgets ensures that when they use the
		 * default font-family in PPB, that they inherit the default heading font, not body font.
		 */
		if ( 'wp_boldgrid_component_page_title' === this.component.name ) {
			return `
			<div class="boldgrid-shortcode bgc-heading bgc-page-title" data-imhwpb-draggable="true">
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

		this.maybeShowOptions();
		this.switchLogoSelector( this.$form );
		this.$form.find( 'button.bgc_register_location' ).on( 'click', e => this.registerMenuLocation( e ) );
		this.$form.find( 'button.bgc_goto_customizer' ).on( 'click', e => this.goToCustomizer( e ) );
		this.$form.find( 'button.bgc_return_to_editor' ).on( 'click', e => this.returnToEditor( e ) );
		this.$form.find( 'a.bgc_goto_customizer' ).on( 'click', e => this.goToCustomizer( e ) );
		this.$form.find( 'a.bgc_goto_menu_assignment' ).on( 'click', e => this.goToMenuAssigmnet( e ) );
		this.$form
			.find( '.bgc.logo_switch input' )
			.on( 'change', () => this.switchLogoSelector( this.$form ) );

		if (
			this.$form.find( '#widget-boldgrid_component_menu--bgc_menu_location' ).val() &&
			! this.isAlphaNumeric(
				this.$form.find( '#widget-boldgrid_component_menu--bgc_menu_location' ).val()
			)
		) {
			this.$form.find( 'button.bgc_register_location' ).prop( 'disabled', true );
			this.$form.find( 'p.invalid_characters' ).show();
		}

		this.$form.find( 'input.bgc_menu_location' ).on( 'keyup', e => this.validateLocationId( e ) );

		this.$form.on( 'change', () => debounced() );
		this.$form.on( 'input:not( .bgc_menu_location )', () => debounced() );

		this.$form.on( 'submit', e => {
			e.preventDefault();
			this._updateShortcode();
		} );
	}

	/**
	 * Validate Location Id
	 *
	 * This is used to disable the register menu locations option
	 * if the location id does not alphanumeric.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} event Event Object.
	 */
	validateLocationId( event ) {
		var $input = $( event.currentTarget );
		if ( this.isAlphaNumeric( $input.val() ) ) {
			this.$form.find( 'button.bgc_register_location' ).prop( 'disabled', false );
			this.$form.find( 'p.invalid_characters' ).hide();
		} else {
			this.$form.find( 'button.bgc_register_location' ).prop( 'disabled', true );
			this.$form.find( 'p.invalid_characters' ).show();
		}
	}

	/**
	 * Is AlphaNumeric
	 *
	 * Determines if the given value is alphanumeric or not.
	 *
	 * @since 1.14.0
	 *
	 * @param {string} value
	 *
	 * @return {boolean} True if alphanumeric, False if not.
	 */
	isAlphaNumeric( value ) {
		return /^[a-z\s0-9][a-z\s0-9]*$/i.test( value );
	}

	/**
	 * Return to Editor
	 *
	 * This is used to return the user to the editor when clicking a button in the
	 * panel. While this seems redundant due to the big X in the corner, certain people
	 * felt that it was necessary to make the user journey more fluid for the Navigation Menu
	 * component.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} event Event object.
	 */
	returnToEditor( event ) {
		event.preventDefault();
		BG.Panel.closePanel();
	}

	/**
	 * Switch Logo Selector
	 *
	 * This is used to change the form to display the image upload
	 * controls for either the site logo, or alternative logo based
	 * on the user's choice.
	 *
	 * @since 1.14.0
	 *
	 * @param {object} $form jQuery object.
	 */
	switchLogoSelector( $form ) {
		var $siteLogoDiv = $form.find( '.bgc.site_logo_selection' ),
			$altLogoDiv = $form.find( '.bgc.alt_logo_selection' ),
			switchVal = $form.find( '.bgc.logo_switch input:checked' ).val();

		if ( 'site_logo' === switchVal ) {
			$siteLogoDiv.show();
			$altLogoDiv.hide();
		} else {
			$siteLogoDiv.hide();
			$altLogoDiv.show();
		}
	}

	/**
	 * Open FOnt Control.
	 *
	 * This is meant to open the font control when the user clicks on a button
	 * in the Customization panel.
	 *
	 * #TODO: This is currently not working properly so it has been removed from the form.
	 *        When the user adds a component, and is open to the initial customizer panel,
	 *        The font control is not enabled, and then it causes an error when the button
	 *        is clicked in the panel. Need to find out why.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} e Event Object.
	 */
	openFontControl( e ) {
		e.preventDefault();
		$( '.boldgrid-instance-menu li[data-action=menu-font]' ).trigger( 'click' );
	}

	/**
	 * Maybe Show Options
	 *
	 * This conditionally shows or hides controls on the Navigation Menu
	 * Customization panel, based on whether or not the menuLocationId has
	 * been entered, to help prevent users from overlooking the importance
	 * of entering and registering the menu location.
	 *
	 * @since 1.14.0
	 */
	maybeShowOptions() {
		let $optionsToShow = this.$form.find( '.bgc_menu_container' ),
			menuLocationId = this.$form.find( 'input.bgc_menu_location_id' ).val(),
			menuId = this.$form.find( 'input.bgc_menu' ).val();
		if ( menuLocationId ) {
			$optionsToShow.show();
		} else {
			$optionsToShow.hide();
		}

		if ( menuLocationId && menuId ) {
			$( '.bgc_menu_warning' ).hide();
		}
	}

	/** Go To Menu Assignment
	 *
	 * This is used to save the current template, and then
	 * redirect the user to the WordPress Menu Assignment page.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} event Event
	*/
	goToMenuAssigmnet( event ) {
		var gotoUrl = '/wp-admin/nav-menus.php?action=locations';
		$( 'form#post' ).append( '<input type="hidden" name="go-to-menu-assignment" value="' + gotoUrl + '">' );
		$( '#publish' ).trigger( 'click' );
	}

	/**
	 * Go To Customizer.
	 *
	 * This is used to save the current template, and then
	 * redirect the user to the WordPress customizer panel
	 * that cooresponds to the nav menu location.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} event Event
	 */
	goToCustomizer( event ) {
		let win,
			title,
			id,
			returnUrl,
			$button = $( event.currentTarget ),
			$customizeUrl = $button[0].dataset.customize,
			$formContainer = $button.parents( '.widget-inputs' ),
			$locationIdInput = $formContainer.find( 'input.bgc_menu_location_id' ),
			$locationId = $locationIdInput.val(),
			gotoUrl = $customizeUrl + '?autofocus[panel]=bgtfw_menu_location_' + $locationId;

		if ( $button[0].dataset.section && 'headings' === $button[0].dataset.section ) {
			gotoUrl = $customizeUrl + '?autofocus[section]=headings_typography';
		}

		if ( $button[0].dataset.section && 'site_title' === $button[0].dataset.section ) {
			gotoUrl = $customizeUrl + '?autofocus[section]=bgtfw_site_title';
		}

		if ( $button[0].dataset.section && 'tagline' === $button[0].dataset.section ) {
			gotoUrl = $customizeUrl + '?autofocus[section]=bgtfw_tagline';
		}

		title = wp.autosave.getPostData().post_title;
		id = wp.autosave.getPostData().post_id;
		returnUrl = '"/wp-admin/post.php?post=' + id + '&action=edit"';

		if ( ! title ) {
			alert( 'You Must Enter a Title First.' );
			return;
		}

		event.preventDefault();

		gotoUrl = gotoUrl + '&return=' + encodeURIComponent( returnUrl );

		$( 'form#post' ).append( '<input type="hidden" name="go-to-customizer" value="' + gotoUrl + '">' );
		$( '#publish' ).trigger( 'click' );
	}

	/**
	 * Register Menu Location
	 *
	 * This is used to send an AJAX call to the
	 * crio_premium_register_menu_locations admin_ajax
	 * action. This action registers the menu location in
	 * Crio Pro's options, as well as adds it to the BGTFW configs.
	 *
	 * @since 1.14.0
	 *
	 * @param {Event} event Event.
	 */
	registerMenuLocation( event ) {
		let $button = $( event.currentTarget ),
			$locationInput = $button.parent().siblings( 'input.bgc_menu_location' ),
			$spinner = $button.siblings( 'span.spinner' ),
			$nonce = $button.siblings( 'span.register_menu_nonce' ),
			locationId,
			$locationIdInput = $button.siblings( 'input' ),
			instance = this;
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
						instance.maybeShowOptions();
						instance.$form.trigger( 'submit' );
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
	 * @since 1.14.0
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
