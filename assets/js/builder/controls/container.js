window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Container = {
		name: 'container',

		tooltip: 'Section Width',

		priority: 15,

		iconClasses: 'fa fa-arrows-h',

		selectors: [ '.boldgrid-section .container', '.boldgrid-section .container-fluid' ],

		init: function() {},

		onMenuClick: function() {
			self.toggleSectionWidth();
		},

		/**
		 * Add a transition to the container changing size.
		 *
		 * @since 1.2.8
		 */
		transitionSize: function( $container ) {
			BG.Controls.$container.find( 'html' ).addClass( 'bg-disabled-handles' );
			$container.css( 'transition', 'width .5s' );
			setTimeout( function() {
				$container.css( 'transition', '' );
				$( window ).trigger( 'resize' );
				BG.Controls.$container.find( 'html' ).removeClass( 'bg-disabled-handles' );
			}, 600 );
		},

		/**
		 * Switch between a container and a container fluid.
		 */
		toggleSectionWidth: function( $container ) {
			if ( ! $container ) {
				$container = BG.Controls.$menu.targetData[self.name].closest(
					'.container, .container-fluid'
				);
			}

			if ( $container.hasClass( 'container' ) ) {
				self.transitionSize( $container );
				$container.addClass( 'container-fluid' );
				$container.removeClass( 'container' );
			} else {
				self.transitionSize( $container );
				$container.addClass( 'container' );
				$container.removeClass( 'container-fluid' );
			}
			$( window ).trigger( 'resize' );
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Container.init();
	self = BOLDGRID.EDITOR.CONTROLS.Container;
} )( jQuery );
