window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Hovervisibility = {
		template: wp.template( 'boldgrid-editor-hover-visibility' ),

		/**
		 * Render the control.
		 *
		 * @since 1.5.1
		 */
		render: function() {
			let $control = $( this.template() );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section.hover-visibility' )
				.remove();
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

			BG.Panel.$element.on( 'bg-customize-open', () => {
				var $inputs = BG.Panel.$element.find( '[name="hover-visibility"]' ),
					$target = BG.Menu.getCurrentTarget(),
					value = $target.hasClass( 'hvrbox-hide' ) ? 'hide' : 'always',
					value = $target.hasClass( 'hvrbox-show' ) ? 'show' : value;

				$inputs.each( function() {
					var $this = $( this );

					$this.prop( 'checked', false );

					if ( value === $this.val() ) {
						$this.prop( 'checked', true );
					}
				} );
			} );

			return $control;
		},

		/**
		 * Bind the input event to newly created cnotrol.
		 *
		 * @since 1.5.1
		 */
		bind: function() {
			this.bindHoverVisibility();
		},

		bindHoverVisibility() {
			var panel = BG.Panel,
				$target = BG.Menu.getCurrentTarget();

			panel.$element.find( '[name="hover-visibility"]' ).on( 'change', function() {
				var $this = $( this ),
					value = $this.val(),
					classes = [ 'hvrbox-show-always', 'hvrbox-show', 'hvrbox-hide' ];

				if ( 'none' === value ) {
					$target.removeClass( classes );
					return;
				}

				switch ( value ) {
					case 'show':
						$target.removeClass( classes );
						$target.addClass( 'hvrbox-show' );
						break;
					case 'hide':
						$target.removeClass( classes );
						$target.addClass( 'hvrbox-hide' );
						break;
					default:
						$target.removeClass( classes );
						break;
				}
			} );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Classes;
} )( jQuery );
