var __ = wp.i18n.__;
var el = wp.element.createElement;
var registerPlugin = wp.plugins.registerPlugin;

import { EditorSelect } from '../../forms/editor-select';
import { Loading } from '../loading';
import './style.scss';

export class Page {
	constructor() {
		this.editorSelect = new EditorSelect();
		this.loading = new Loading();
	}

	init() {
		$( () => this._onload() );
	}

	/**
	 * On load of the editor.
	 *
	 * @since 1.9.0
	 */
	_onload() {
		this._bindSidebarOpen();

		this.registerPlugin( {
			pluginName: 'bgppb',
			type: 'bgppb',
			label: 'Post and Page Builder',
			icon: el(
				'img',
				{
					src: BoldgridEditor.plugin_url + '/assets/image/boldgrid-logo.svg'
				}
			)
		} );

		this.registerPlugin( {
			pluginName: 'bgppb-classic',
			type: 'classic',
			label: 'Classic Editor',
			icon: 'edit'
		} );

		this.editorSelect.setEditorOverrideInput( $( 'form.metabox-base-form' ) );
	}

	/**
	 * When the sidebar changes, check if it's one of our plugins..
	 *
	 * @since 1.9.0
	 */
	_bindSidebarOpen() {
		wp.data.subscribe( ( e ) => {
			let post = wp.data.select( 'core/edit-post' ),
				isBgppb = post.isPluginSidebarOpened( 'bgppb' ),
				isClassic = post.isPluginSidebarOpened( 'bgppb-classic' );

			if ( isBgppb ) {
				this.editorSelect.changeType( 'bgppb' );
			} else if ( isClassic ) {
				this.editorSelect.changeType( 'classic' );
			}
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
			icon: configs.icon || '',
			render: () => {
				return el(
					wp.editPost.PluginSidebarMoreMenuItem,
					{
						target: configs.pluginName
					},
					__( configs.label )
				);
			}
		} );
	}
}
