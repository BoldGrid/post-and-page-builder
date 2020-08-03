window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BG.Feedback = {
		init: function() {
			self.$input = $( '[name="boldgrid-record-feedback"]' );
			self.bindEvents();
		},

		bindEvents: function() {
			$( window ).on( 'boldgrid_added_gridblock', self.addGridblock );
		},

		/**
		 * Add an action to feedback.
		 *
		 * @since 1.5
		 *
		 * @param {object} options Object to store.
		 */
		add: function( options ) {
			var val = self.$input.val() || '[]';
			val = JSON.parse( val );
			val.push( options );
			self.$input.attr( 'value', JSON.stringify( val ) );
			self.$input.val( JSON.stringify( val ) );
		},

		/**
		 * Record feedback when gridblock added.
		 *
		 * @since 1.5
		 *
		 * @param {Event} event
		 * @param {Object} data
		 */
		addGridblock: function( event, data ) {
			if ( data && data.template ) {
				self.add( {
					action: 'installed_gridblock',
					data: {
						template: data.template
					}
				} );
			}
		}
	};

	self = BOLDGRID.EDITOR.Feedback;
	BOLDGRID.EDITOR.Feedback.init();
} )( jQuery );
