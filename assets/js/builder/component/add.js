import panelTemplate from './add.html';
import './add.scss';
window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
let BG = BOLDGRID.EDITOR;

export class Add {
	constructor() {
		this.name = 'add';
		this.$element = null;
		this.tooltip = 'Add Block Component';
		this.priority = 1;
		this.iconClasses = 'genericon genericon-plus add-element-trigger';
		this.selectors = [ 'html' ];

		this.panel = {
			title: 'Block Components',
			height: '575px',
			width: '500px'
		};

		this.components = [

			// Structure & Layout.
			{
				name: 'block',
				title: 'Block',
				type: 'structure',
				icon: require( './icons/block.svg' )
			},
			{
				name: 'layout',
				title: 'Layout',
				type: 'structure',
				icon: '<span class="dashicons dashicons-layout"></span>'
			},
			{
				name: 'spacer',
				title: 'Spacer',
				type: 'structure',
				icon: require( './icons/space.svg' )
			},

			// Design.
			{
				name: 'button',
				title: 'Button',
				type: 'design',
				icon: require( './icons/button.svg' )
			},
			{
				name: 'list',
				title: 'List',
				type: 'design',
				icon: require( './icons/list.svg' )
			},
			{
				name: 'blockquote',
				title: 'Blockquote',
				type: 'design',
				icon: '<span class="dashicons dashicons-editor-quote"></span>'
			},
			{
				name: 'hr',
				title: 'Horizontal Rule',
				type: 'design',
				icon: require( './icons/hr.svg' )
			},

			// Media.
			{
				name: 'image',
				title: 'Image',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-image"></span>'
			},
			{
				name: 'audio',
				title: 'Audio',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-audio"></span>'
			},
			{
				name: 'map',
				title: 'Map',
				type: 'media',
				icon: '<span class="dashicons dashicons-location-alt"></span>'
			},
			{
				name: 'video',
				title: 'Video',
				type: 'media',
				icon: '<span class="dashicons dashicons-format-video"></span>'
			},

			// From widgets.
			{
				name: 'archives',
				title: 'Archives',
				type: 'widget',
				icon: '<span class="dashicons dashicons-archive"></span>'
			},
			{
				name: 'calander',
				title: 'Calander',
				type: 'widget',
				icon: '<span class="dashicons dashicons-calendar-alt"></span>'
			},
			{
				name: 'categories',
				title: 'Categories',
				type: 'widget',
				icon: '<span class="dashicons dashicons-category"></span>'
			},
			{
				name: 'custom-html',
				title: 'Custom HTML',
				type: 'widget',
				icon: '<span class="dashicons dashicons-media-code"></span>'
			},
			{
				name: 'menu',
				title: 'Menu',
				type: 'widget',
				icon: '<span class="dashicons dashicons-menu"></span>'
			},
			{
				name: 'meta',
				title: 'Meta',
				type: 'widget',
				icon: '<span class="dashicons dashicons-wordpress"></span>'
			},
			{
				name: 'pages',
				title: 'Pages',
				type: 'widget',
				icon: '<span class="dashicons dashicons-admin-page"></span>'
			},
			{
				name: 'posts',
				title: 'Recent Posts',
				type: 'widget',
				icon: '<span class="dashicons dashicons-admin-post"></span>'
			},
			{
				name: 'comments',
				title: 'Recent Comments',
				type: 'widget',
				icon: '<span class="dashicons dashicons-admin-comments"></span>'
			},
			{
				name: 'search',
				title: 'Search',
				type: 'widget',
				icon: '<span class="dashicons dashicons-search"></span>'
			},
			{
				name: 'rss',
				title: 'Rss',
				type: 'widget',
				icon: '<span class="dashicons dashicons-rss"></span>'
			},
			{
				name: 'tags',
				title: 'Tag Cloud',
				type: 'widget',
				icon: '<span class="dashicons dashicons-tagcloud"></span>'
			}
		];
	}

	init() {
		BOLDGRID.EDITOR.Controls.registerControl( this );

		return this;
	}

	onMenuClick() {
		let $control = $(
			_.template( panelTemplate )( {
				components: this.components,
				printComponent: function( type, component ) {
					if ( type === component.type ) {
						return `
					<label data-name="${component.name}">
						<span class="component-icon">${component.icon}</span>
						<span class="component-name">${component.title}</span>
					</label>`;
					}
				}
			} )
		);

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( this );
	}
}
