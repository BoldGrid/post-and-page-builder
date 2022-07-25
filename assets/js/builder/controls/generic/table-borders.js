window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

import template from '../../../../../includes/template/customize/table-borders.html';
import Border from './border';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Tableborders = {
		template: _.template( template ),

		data: {
			testData: 'testData',
			borderTypes: [
				{
					name: 'row-borders',
					label: 'Row Borders',
					property: 'top',
					dataAttr: 'row-borders'
				},
				{
					name: 'column-borders',
					label: 'Column Borders',
					property: 'right',
					dataAttr: 'column-borders'
				}
			],
			controls: {}
		},

		/**
		 * Render the control.
		 *
		 * @since 1.19.0
		 *
		 * @returns {object} control jQuery object.
		 */
		render: function() {
			var $tableBorderControl;
			this.data.borderTypes.forEach( function( borderType ) {
				var borderControl = new Border( { target: BG.Menu.getCurrentTarget() } ),
					$control = borderControl.render();

				self.data.controls[borderType.name] = {
					control: borderControl,
					$control: $control
				};

				console.log( { $control } );
			} );
			$tableBorderControl = $( this.template( this.data ) );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section .generic-table-borders' )
				.remove();

			BG.Panel.$element.find( '.panel-body .customize' ).append( $tableBorderControl );

			return $tableBorderControl;
		},

		/**
		 * Bind event.
		 *
		 * @since 1.19.0
		 */
		bind: function() {
			var $section = BG.Panel.$element.find( '.section .generic-table-borders' ),
				$el = BG.Menu.getCurrentTarget();

			console.log( { $section, $el } );

			this.data.borderTypes.forEach( function( borderType ) {
				console.log( { borderType, controls: self.data.controls } );

				//self.data.controls[ borderType.name ].control.bind();
			} );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Tableborders;
} )( jQuery );
