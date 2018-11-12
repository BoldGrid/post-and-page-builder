var __ = wp.i18n.__;
var el = wp.element.createElement;
var registerPlugin = wp.plugins.registerPlugin;

import { EditorSelect } from '../../forms/editor-select';

export class Page {

	init() {
		$( () => this._onload() );
	}

	/**
	 * On load of the editor.
	 *
	 * @since 1.9.0
	 */
	_onload() {
		this.registerPlugin( {
			pluginName: 'bgppb-classic',
			type: 'classic',
			label: 'Classic Editor'
		} );

		this.registerPlugin( {
			pluginName: 'bgppb',
			type: 'bgppb',
			label: 'Post and Page Builder'
		} );
	}

	/**
	 * Add a new item to the gutenberg menu.
	 *
	 * @since 1.9.0
	 *
	 * @param  {object} configs Configurations.
	 */
	registerPlugin( configs ) {
		registerPlugin( configs.pluginName, {
			icon: '',
			render: () => {
				return el(
					wp.editPost.PluginSidebarMoreMenuItem,
					{},
					el(
						'span',
						{ onClick: () => new EditorSelect().changeType( configs.type ) },
						__( configs.label )
					),
				);
			}
		} );
	}
}
