window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Customclasses = {
		template: wp.template( 'boldgrid-editor-custom-classes' ),

		/**
		 * Render the control.
		 *
		 * @since 1.5.1
		 */
		render: function() {
			let $control = $( this.template() );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section.custom-classes' )
				.remove();
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

			return $control;
		},

		/**
		 * Bind the input event to newly created cnotrol.
		 *
		 * @since 1.5.1
		 */
		bind: function() {
			this.bindClasses();
			this.bindId();
		},

		/**
		 * Bind the event of entering Id's
		 *
		 * @since 1.7.0
		 */
		bindId() {
			var panel = BG.Panel,
				$target = BG.Menu.getCurrentTarget(),
				currentId = $target.attr( 'id' );

			panel.$element
				.find( '[name="css-id"]' )
				.on( 'input', function() {
					var $this = $( this ),
						value = $this.val();

					// Strip out invalid input.
					value = value.replace( /[^A-Za-z0-9\-\_]/g, '' );

					$target.attr( 'id', value );
					$this.val( value );

					if ( ! value ) {
						$target.removeAttr( 'id' );
					}
				} )
				.val( currentId );
		},

		/**
		 * Bind thew event of enetering classes.
		 *
		 * @since 1.5
		 */
		bindClasses() {
			var panel = BG.Panel,
				$target = BG.Menu.getCurrentTarget(),
				currentClasses = $target.attr( 'data-custom-classes' );

			panel.$element
				.find( '[name="custom-classes"]' )
				.on( 'input', function() {
					var $this = $( this ),
						customClasses = $target.attr( 'data-custom-classes' ),
						value = $this.val();

					value = value.replace( ',', ' ' );

					$target.removeClass( customClasses );
					$target.attr( 'data-custom-classes', value );
					$target.addClass( value );
				} )
				.val( currentClasses );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Classes;
} )( jQuery );
