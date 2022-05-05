window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function() {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BG.CONTROLS.Information = {
		name: 'information',

		panel: {
			title: 'Controls Information',
			height: '700px',
			icon: 'fa fa-info',
			width: '750px'
		},

		init: function() {
			BG.Controls.registerControl( this );
		},

		/**
		 * Alias for Menu click.
		 *
		 * @since 1.6
		 */
		activate: function() {
			self.onMenuClick();
		},

		setup: function() {
			self.templateHTML = wp.template( 'boldgrid-editor-information' )();
		},

		/**
		 * When the user clicks on the menu item, open panel.
		 *
		 * @since 1.6
		 */
		onMenuClick: function() {
			var panel = BG.Panel;

			// Remove all content from the panel.
			panel.clear();

			// Set markup for panel.
			panel.$element.find( '.panel-body' ).html( self.templateHTML );

			// Open Panel.
			panel.open( self );
			panel.centerPanel();
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Information.init();
	self = BOLDGRID.EDITOR.CONTROLS.Information;
} )( jQuery );
