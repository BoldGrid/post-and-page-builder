var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import errorTemplate from './error.html';
import controlTemplate from './control.html';

export class Control {
	constructor() {
		this.errorTemplate = _.template( errorTemplate );
		this.controlTemplate = _.template( controlTemplate );
	}

	/**
	 * Instantiate the class.
	 *
	 * @since 1.8.0
	 */
	init() {
		_.each( BoldgridEditor.plugin_configs.component_controls.components, component => {
			BG.$window.on( 'boldgrid_editor_loaded', () => {
				component.js_control.callback = () => {
					send_to_editor( this.getSample( component ) );
				};
				BG.Service.component.register( component.js_control );
			} );

			this.register( component );
		} );
	}

	/**
	 * Register a shortcode with MCE views.
	 *
	 * @since 1.8.0
	 */
	register( component ) {
		let self = this;

		let fail = mce => {
			mce.render(
				this.errorTemplate( {
					name: component.js_control.title
				} )
			);
		};

		wp.mce.views.register( component.shortcode, {

			/*
			 * Make an API call to get the widget.
			 */
			initialize: function() {
				self
					.getContent( component )
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
				let $template = $(
					self.controlTemplate( {
						component: component
					} )
				);

				BG.Panel.clear();
				BG.Panel.$element.find( '.panel-body' ).html( $template );
				BG.Menu.$element.targetData[component.name] = $( BG.mce.selection.getNode() );

				BG.Panel.open( {
					name: component.name,
					panel: {
						title: `Customize ${component.js_control.title}`,
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
							'blockAlignment',
							'device-visibility',
							'customClasses'
						]
					}
				} );

				BG.Panel.showFooter();
				BG.Panel.enterCustomization();
				BG.Panel.customizeOpenEvent();
			}
		} );
	}

	/**
	 * Get the content for the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component configuration.
	 */
	getContent( component ) {
		return $.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 10000,
			data: {
				/*eslint-disable */
				action: 'boldgrid_component_' + component.name,
				boldgrid_editor_gridblock_save: BoldgridEditor.nonce_gridblock_save
				/*eslint-enable */
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
	getSample( component ) {
		return `[${component.shortcode} title="Sample"]`;
	}
}

new Control().init();
