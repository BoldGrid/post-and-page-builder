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
					name: 'Information',
					class: 'action font-awesome fa-info bg-editor-information'
				}
			]
		},

		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		/**
		 * Bind all events.
		 *
		 * @since 1.6
		 */
		setup: function() {
			BG.Menu.$element
				.find( '.bg-editor-menu-dropdown' )
				.on( 'click', '.action.support-center', self.openSupportCenter )
				.on( 'click', '.action.bg-editor-information', self.iconHelp );
		},

		/**
		 * Go to the support center.
		 *
		 * @since 1.5
		 */
		openSupportCenter: function() {
			window.open(
				'https://www.boldgrid.com/support/boldgrid-post-and-page-builder/?source=boldgrid-editor_drop-tab',
				'_blank'
			);
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
