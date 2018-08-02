var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import errorTemplate from './error.html';
import controlTemplate from './control.html';

export class Instance {
	constructor( component ) {
		this.component = component;
		this.insertedNode = false;
		this.errorTemplate = _.template( errorTemplate );
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

	setup() {
		this.component.js_control.callback = () => {
			this.insertedNode = true;
			send_to_editor( this.getShortcode() );
		};

		BG.Service.component.register( this.component.js_control );
	}

	/**
	 * Register a shortcode with MCE views.
	 *
	 * @since 1.8.0
	 */
	register() {
		let self = this;

		let fail = mce => {
			mce.render(
				this.errorTemplate( {
					name: this.component.js_control.title
				} )
			);
		};

		wp.mce.views.register( this.component.shortcode, {

			/*
			 * Make an API call to get the widget.
			 */
			initialize: function() {
				self
					.getContent( this.shortcode.attrs.named )
					.done( response => {
						if ( response && response.content ) {
							this.render( response.content );
						} else {
							fail( this );
						}
					} )
					.fail( () => fail( this ) );
			},

			edit: function( text, update ) {
				self.openPanel( update );
			},

			bindNode: function( editor, node ) {
				if ( self.insertedNode ) {
					wp.mce.views.edit( editor, node );
					self.insertedNode = false;
				}
			},

			remove: function( editor, node ) {

				// @TODO thi isnt firing figure out why.

				let $node = $( node ),
					$draggable = $node.parent( '[data-imhwpb-draggable="true"]' );

				this.remove( editor, node );

				if ( $draggable.length ) {
					$draggable.remove();
				}
			}
		} );
	}

	/**
	 * Get a sample shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @return {string} Shortcode.
	 */
	getShortcode() {
		return `<div class="boldgrid-shortcode" data-imhwpb-draggable="true">[${
			this.component.shortcode
		}]</div>`;
	}

	/**
	 * Get the content for the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component configuration.
	 */
	getContent( attrs ) {
		return $.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 10000,
			data: {
				/*eslint-disable */
				action: 'boldgrid_component_' + this.component.name,
				boldgrid_editor_gridblock_save: BoldgridEditor.nonce_gridblock_save,
				attrs: attrs
				/*eslint-enable */
			}
		} );
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

			let $values = BG.Panel.$element.find( '[data-control-name="design"] form' ).serialize();
			update( `[${this.component.shortcode} attr="${$values}"]` );
		} );
	}

	/**
	 * Open the customization panel for a component config.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configuration.
	 * @param  {function} update Update the shortcode method.
	 */
	openPanel( update ) {
		let $template = $(
			this.controlTemplate( {
				component: this.component
			} )
		);

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $template );
		BG.Menu.$element.targetData[this.component.name] = this.findTarget();

		// @todo move this into an ajax call.
		this._bindFormInputs( update );

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
	 * Update target.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} Editting target
	 */
	findTarget() {
		let $wpView = $( BG.mce.selection.getNode() ),
			$dragWrap = $wpView.parent( '[data-imhwpb-draggable="true"]' );

		if ( ! $dragWrap.length ) {
			$dragWrap = $wpView.wrap( '<div class="boldgrid-shortcode" data-imhwpb-draggable="true">' );
		}

		return $dragWrap;
	}
}
