window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function() {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BG.CONTROLS.Help = {
		name: 'help',

		tooltip: 'Help',

		priority: 3,

		iconClasses: 'fa fa-question',

		selectors: [ 'html' ],

		menuDropDown: {
			title: 'Help',
			options: [
				{
					name: 'Editing Guide',
					class: 'action font-awesome fa-question support-center'
				},
				{
					name: 'User Community',
					class: 'action font-awesome fa-users bg-user-community'
				},
				{
					name: 'Information',
					class: 'action font-awesome fa-info bg-editor-information'
				}
			]
		},

		urls: {
			supportCenter:
				'https://www.boldgrid.com/support/boldgrid-post-and-page-builder/?source=boldgrid-editor_drop-tab',
			userCommunity: 'https://www.facebook.com/groups/BGTeamOrange'
		},

		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		/**
		 * Open a URL in a new tab.
		 *
		 * @since 1.10.0
		 *
		 * @param  {string} url URL name.
		 */
		openTab( url ) {
			window.open( self.urls[url], '_blank' );
		},

		/**
		 * Bind all events.
		 *
		 * @since 1.6
		 */
		setup: function() {
			BG.Menu.$element
				.find( '.bg-editor-menu-dropdown' )
				.on( 'click', '.action.support-center', () => self.openTab( 'supportCenter' ) )
				.on( 'click', '.action.bg-editor-information', self.iconHelp )
				.on( 'click', '.action.bg-user-community', () => self.openTab( 'userCommunity' ) );
		},

		/**
		 * Open Icon control.
		 *
		 * @since 1.6
		 */
		iconHelp: function() {
			BG.CONTROLS.Information.activate();
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Help.init();
	self = BOLDGRID.EDITOR.CONTROLS.Help;
} )();
