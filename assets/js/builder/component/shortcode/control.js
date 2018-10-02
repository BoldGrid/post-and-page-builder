var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import { Instance as ShortcodeIntance } from './instance';
import errorTemplate from './error.html';

export class Control {
	constructor() {
		this.componentShortcodes = {};
		this.errorTemplate = _.template( errorTemplate );
	}

	/**
	 * Setup all components.
	 *
	 * @since 1.8.0
	 */
	init() {
		_.each( BoldgridEditor.plugin_configs.component_controls.components, component => {
			let shortcode = new ShortcodeIntance( component );
			this.componentShortcodes[component.name] = shortcode;

			BG.$window.on( 'boldgrid_editor_loaded', () => {
				shortcode.setup();
			} );
		} );

		this.register();
	}

	/**
	 * Given an MCE view instance, find component class.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} mceView   MCE view instance.
	 * @return {ShortcodeIntance} Shortcode instance.
	 */
	getComponentInstance( mceViewInstance ) {
		let type = mceViewInstance.shortcode.attrs.named.type;
		return this.componentShortcodes[type];
	}

	/**
	 * Register the standard mce boldgrid component view.
	 *
	 * @since 1.8.0
	 */
	register() {
		let self = this;

		let fail = ( mce, componentInstance ) => {
			let name = 'BoldGrid Component';
			if ( componentInstance ) {
				name = componentInstance.component.js_control.title;
				componentInstance.stopLoading();
			}

			mce.render( self.errorTemplate( { name: name } ) );
		};

		wp.mce.views.register( 'boldgrid_component', {

			/*
			 * Make an API call to get the widget.
			 */
			initialize: function() {
				let componentInstance = self.getComponentInstance( this );

				if ( ! componentInstance ) {
					fail( this );
					return;
				}

				componentInstance
					.getShortcodeData( 'content', this.shortcode.attrs.named.opts )
					.done( response => {
						if ( response && response.content ) {
							this.render( response.content );
						} else {
							fail( this, componentInstance );
						}
					} )
					.fail( () => fail( this, componentInstance ) );
			},

			edit: function( text, update ) {
				let componentInstance = self.getComponentInstance( this );
				if ( componentInstance ) {
					componentInstance.openPanel( this, update );
				}
			},

			bindNode: function( editor, node ) {
				let componentInstance = self.getComponentInstance( this );
				if ( componentInstance && componentInstance.insertedNode ) {
					BG.mce.selection.select( node );
					wp.mce.views.edit( editor, node );
					self.getComponentInstance( this ).insertedNode = false;
				}

				if ( componentInstance ) {
					componentInstance.stopLoading();
				}

				BG.Service.event.emit( 'shortcodeUpdated', node );
			}
		} );
	}
}

new Control().init();
