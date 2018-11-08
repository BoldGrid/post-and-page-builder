import { Editor as SettingEditor } from '../../settings/editor';

$( () => {
	var __ = wp.i18n.__;
	var el = wp.element.createElement;
	var PluginSidebarMoreMenuItem = wp.editPost.PluginSidebarMoreMenuItem;
	var registerPlugin = wp.plugins.registerPlugin;

	registerPlugin( 'bgppb-classic', {
		icon: '',
		render: () => {
			return el(
				PluginSidebarMoreMenuItem,
				{},
				el(
					'span',
					{ onClick: () => new SettingEditor().changeType( 'bgppb' ) },
					__( 'Classic Editor' )
				),
			);
		}
	} );

	registerPlugin( 'bgppb-open', {
		icon: 'edit',
		render: () => {
			return el(
				PluginSidebarMoreMenuItem,
				{},
				el(
					'span',
					{ onClick: () => new SettingEditor().changeType( 'bgppb' ) },
					__( 'Post and Page Builder' )
				),
			);
		}
	} );

} );
