window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Responsivealignment = {
		template: wp.template( 'boldgrid-editor-responsive-text-alignment' ),

		/**
		 * Render the control.
		 *
		 * @since 1.19.0
		 *
		 * @returns {object} control jQuery object.
		 */
		render: function() {
			let $control = $( this.template() );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section.responsive-text-alignment' )
				.remove();
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

			return $control;
		},

		/**
		 * Bind event.
		 *
		 * @since 1.19.0
		 */
		bind: function() {
			var $section = BG.Panel.$element.find( '.section.responsive-text-alignment' ),
				$el = BG.Menu.getCurrentTarget(),
				$buttonsets = $section.find( '.buttonset' );

			$buttonsets.each( ( _, buttonset ) => {
				this.applyPreset( $( buttonset ), $el );
			} );

			$buttonsets.each( ( _, buttonset ) => {
				this.bindInputs( $( buttonset ), $el );
			} );
		},

		/**
		 * Bind Input changes.
		 *
		 * @since 1.19.0
		 *
		 * @param {object} $buttonset Buttonset jQuery object.
		 * @param {object} $el Target element jQuery object.
		 */
		bindInputs: function( $buttonset, $el ) {
			var device = $buttonset.attr( 'data-device' ),
				$inputs = $buttonset.find( 'input' ),
				classPrefix = ( classPrefix = 'text-' + device + '-' ),
				alignmentClasses = [ classPrefix + 'left', classPrefix + 'center', classPrefix + 'right' ];

			$inputs.on( 'change', function() {
				var $this = $( this ),
					value = $this.val();

				$el.removeClass( alignmentClasses );

				$el.addClass( value );
			} );
		},

		/**
		 * Apply preset alignment.
		 *
		 * @since 1.19.0
		 *
		 * @param {object} $buttonset Buttonset jQuery object.
		 * @param {object} $el        Target element jQuery object.
		 */
		applyPreset: function( $buttonset, $el ) {
			var device = $buttonset.attr( 'data-device' ),
				$inputs = $buttonset.find( 'input' ),
				classPrefix = 'text-' + device + '-',
				$alignNoneInput = $inputs.filter( '[value=""]' ),
				alignmentNone = true,
				alignmentClasses = [ classPrefix + 'left', classPrefix + 'center', classPrefix + 'right' ];

			$inputs.prop( 'checked', false );

			alignmentClasses.forEach( className => {
				if ( $el.hasClass( className ) ) {
					alignmentNone = false;
				}
			} );

			$inputs.each( function() {
				var $input = $( this ),
					value = $input.val();

				if ( value && $el.hasClass( value ) ) {
					$input.prop( 'checked', true );
				}
			} );

			if ( alignmentNone ) {
				$alignNoneInput.prop( 'checked', true );
			}
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Responsivealignment;
} )( jQuery );
