var BG = BOLDGRID.EDITOR,
	$ = jQuery;

import { Instance as ShortcodeIntance } from './instance';

export class Control {

	/**
	 * Setup all components.
	 *
	 * @since 1.8.0
	 */
	init() {
		_.each( BoldgridEditor.plugin_configs.component_controls.components, component => {
			let shortcode = new ShortcodeIntance( component );

			BG.$window.on( 'boldgrid_editor_loaded', () => {
				shortcode.setup();
			} );

			shortcode.register();
		} );
	}
}

new Control().init();
