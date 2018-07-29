window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Fontcolor = {
		bound: false,

		template: wp.template( 'boldgrid-editor-font-color' ),

		render: function() {
			var $control = $( this.template() ),
				$target = BG.Menu.getTarget( BG.Panel.currentControl );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section.font-color' )
				.remove();
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

			BG.Panel.$element.on( 'bg-customize-open', function() {
				BG.Panel.$element
					.find( '.panel-body .customize' )
					.find( '.section.font-color label' )
					.css( 'background-color', $target.css( 'color' ) );
			} );

			return $control;
		},

		bind: function() {
			var panel = BG.Panel;

			if ( this.bound ) {
				return false;
			}

			panel.$element.on( 'change', '.color-preview ~ [name="font-color"]', function() {
				var $this = $( this ),
					$target = BG.Menu.getCurrentTarget(),
					value = $this.val(),
					type = $this.attr( 'data-type' );

				$target.removeClass( BG.CONTROLS.Color.colorClasses.join( ' ' ) );
				BG.Controls.addStyle( $target, 'color', '' );

				if ( 'class' === type ) {
					$target.addClass( BG.CONTROLS.Color.getColorClass( 'color', value ) );
				} else {
					BG.Controls.addStyle( $target, 'color', value );
				}
			} );

			this.bound = true;
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Fontcolor;
} )( jQuery );
