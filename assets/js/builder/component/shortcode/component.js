import errorTemplate from '../widget/error.html';
import formTemplate from './form.html';

export class Component {
	constructor() {
		this.$currentNode;
		this.componentShortcodes = {};

		this.defaultShortcodes = [
			'boldgrid_component',
			'wp_caption',
			'caption',
			'gallery',
			'playlist',
			'audio',
			'video',
			'embed'
		];

		this.panel = {
			title: 'Edit Shortcode',
			height: '350px',
			width: '325px',
			icon: 'dashicons dashicons-editor-code'
		};

		this.errorTemplate = _.template( errorTemplate );
	}

	/**
	 * Setup all components.
	 *
	 * @since 1.8.0
	 */
	init() {

		// Wait & let other mce views register first.
		setTimeout( () => this.register() );
	}

	/**
	 * Register the standard mce boldgrid component view.
	 *
	 * @since 1.11.0
	 */
	register() {
		let self = this;
		let shortcodes = BoldgridEditor.shortcodes.filter( val => {
			return ! this.defaultShortcodes.includes( val ) && ! wp.mce.views.get( val );
		} );

		for ( let shortcode of shortcodes ) {
			wp.mce.views.register( shortcode, {
				initialize: function() {
					self
						.getShortcodeData( shortcode, this.text )
						.done( response => {
							this.render( response.content || '<p></p>' );
						} )
						.fail( () => {
							self.errorTemplate( { name: shortcode } );
						} );
				},
				edit: function( text, update ) {
					self.$currentNode = $( BG.mce.selection.getNode() );
					self.openPanel( text, update );
				}
			} );
		}
	}

	/**
	 * Get the content for the shortcode.
	 *
	 * @since 1.11.0
	 *
	 * @param  {string} shortcodeName Shortcode tag.
	 * @param  {string} text          Shortcode.
	 */
	getShortcodeData( shortcodeName, text ) {
		let action = 'boldgrid_shortcode_' + shortcodeName;
		let data = {};

		/* eslint-disable */
		data.action = action;
		data.post_id = BoldgridEditor.post_id;
		data.boldgrid_editor_gridblock_save = BoldgridEditor.nonce_gridblock_save;
		data.text = text;
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
	 * Setup event listeners for close button.
	 *
	 * @since 1.12.0
	 *
	 * @param {$} $form HTML template in panel.
	 */
	_setupClose( $form ) {
		$form.find( '.close' ).on( 'click', () => BG.Panel.closePanel() );
	}

	/**
	 * Setup event listeners for update button.
	 *
	 * @since 1.12.0
	 *
	 * @param {$} $form HTML template in panel.
	 * @param {function} updater Update function for shortcode.
	 */
	_setupUpdate( $form, updater ) {
		$form.find( '.update' ).on( 'click', () => {
			let val = $form.find( '[name="shortcode"]' ).val();
			updater( val, true );
		} );
	}

	/**
	 * Return the current target.
	 *
	 * @since 2.12.0
	 */
	getTarget() {
		return this.$currentNode;
	}

	/**
	 * Open the shortcode editor.
	 *
	 * @since 1.12.0
	 *
	 * @param {string} shortcode SHortcode value.
	 * @param {function} updater Update function for shortcode.
	 */
	openPanel( shortcode, updater ) {
		var $panel = BG.Panel.$element;

		// Create Markup.
		let $form = $( formTemplate );
		$panel.find( '.panel-body' ).html( $form );
		$form.find( '[name="shortcode"]' ).val( shortcode );

		// Bind form buttons.
		this._setupClose( $form );
		this._setupUpdate( $form, updater );

		BG.Panel.open( this );
	}
}

new Component().init();
