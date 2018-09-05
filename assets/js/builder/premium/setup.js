import { Component } from './component';

class Setup {

	/**
	 * Run all actions for non premium use upgrade opportunities.
	 *
	 * @since 1.0.0
	 */
	init() {
		if ( ! BoldgridEditor.plugin_configs.premium.is_premium ) {
			new Component().init();
		}
	}
}
new Setup().init();
