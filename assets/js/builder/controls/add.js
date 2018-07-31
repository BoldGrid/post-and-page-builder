window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BG.CONTROLS.Add = {
		$element: null,

		name: 'adds',

		tooltip: 'Add New Item',

		priority: 1,

		iconClasses: 'genericon genericon-plus add-element-trigger',

		selectors: [ 'html' ],

		/*menuDropDown: {
			title: 'Add New',
			options: [
				{
					name: 'Media',
					class: 'action add-media dashicons dashicons-admin-media'
				},
				{
					name: 'Button',
					class: 'action font-awesome add-button'
				},
				{
					name: 'Icon',
					class: 'action font-awesome add-icon'
				},
				{
					name: 'Block',
					class: 'action add-gridblock'
				},
				{
					name: 'Section',
					class: 'action add-row'
				}
			]
		},*/

		init: function() {

			// BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		/**
		 * Setup.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			self._setupMenuClick();
		},

		/**
		 * Bind all events.
		 *
		 * @since 1.2.7
		 */
		_setupMenuClick: function() {
			BG.Menu.$element
				.find( '.bg-editor-menu-dropdown' )
				.on( 'click', '.action.add-gridblock', self.addGridblock )
				.on( 'click', '.action.add-row', self.addSection )
				.on( 'click', '.action.add-button', BG.CONTROLS.Button.insertNew )
				.on( 'click', '.action.add-media', self.openAddMedia )
				.on( 'click', '.action.add-icon', BG.CONTROLS.Icon.insertNew );
		},

		/**
		 * Open Add Media.
		 *
		 * @since 1.2.7
		 */
		openAddMedia: function() {
			wp.media.editor.open();
			wp.media.frame.setState( 'insert' );
		},

		/**
		 * Scroll to an element on the iFrame.
		 *
		 * @since 1.2.7
		 */
		scrollToElement: function( $newSection, duration ) {
			$( 'html, body' ).animate(
				{
					scrollTop: $newSection.offset().top
				},
				duration
			);
		},

		/**
		 * Add a new Section.
		 *
		 * @since 1.2.7
		 */
		addSection: function() {
			var $container = BOLDGRID.EDITOR.Controls.$container,
				$newSection = $( wp.template( 'boldgrid-editor-empty-section' )() );
			$container.$body.prepend( $newSection );

			self.scrollToElement( $newSection, 200 );
			BG.Service.popover.section.transistionSection( $newSection );
		},

		/**
		 * Add a new Gridblock.
		 *
		 * @since 1.2.7
		 */
		addGridblock: function() {
			var mce = BOLDGRID.EDITOR.Controls.editorMceInstance();
			if ( mce ) {
				mce.insert_layout_action();
			}
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Add.init();
	self = BOLDGRID.EDITOR.CONTROLS.Add;
} )( jQuery );
