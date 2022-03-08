window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Fullwidthrows = {
		template: wp.template( 'boldgrid-editor-full-width-rows' ),

		/**
		 * Render the control.
		 *
		 * @since 1.17.0
		 */
		render: function() {
			let $control = $( this.template() );

			BG.Panel.$element
				.find( '.panel-body .customize' )
				.find( '.section.full-width-rows' )
				.remove();
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

			BG.Panel.$element.on( 'bg-customize-open', () => {
				var $inputs = BG.Panel.$element.find( '[name="full-width-rows"]' ),
					$target = BG.Menu.getCurrentTarget(),
					value = $target.hasClass( 'full-width-row' ) ? true : false;

				$inputs.each( function() {
					var $this = $( this );

					console.log( {
						$this: $this,
						isChecked: $this.prop( 'checked' ),
						value: value,
						hasClassFullWidthRow: $target.hasClass( 'full-width-row' )
					} );

					if ( true === value ) {
						$this.prop( 'checked', true );
					} else {
						$this.prop( 'checked', false );
					}
				} );
			} );

			return $control;
		},

		/**
		 * Bind the input event to newly created cnotrol.
		 *
		 * @since 1.17.0
		 */
		bind: function() {
			this.bindFullWidthRows();
		},

		/**
		 * binds the full width change event.
		 *
		 * @since 1.17.0
		 */
		bindFullWidthRows() {
			var panel = BG.Panel,
				$target = BG.Menu.getCurrentTarget();

			panel.$element.find( '[name="full-width-rows"]' ).on( 'change', function() {
				var $this = $( this ),
					value = $this.prop( 'checked' ),
					$firstCol = $target.find( 'div[class^="col-"]:first-of-type' ),
					$lastCol = $target.find( 'div[class^="col-"]:last-of-type' );

				console.log( {
					method: 'Fullwidthrows.bindFullWidthRows',
					firstCol: $firstCol,
					lastCol: $lastCol,
					value: value
				} );

				if ( false === value ) {
					$target.removeClass( 'full-width-row' );
				} else {
					$target.addClass( 'full-width-row' );
				}

				if ( false === value && 0 !== $firstCol.children( '.fwr-left' ).length ) {
					$firstCol
						.children( '.fwr-left' )
						.children()
						.unwrap();
					$lastCol
						.children( '.fwr-right' )
						.children()
						.unwrap();
				} else if ( true === value && 0 === $firstCol.children( '.fwr-left' ).length ) {
					$firstCol.wrapInner( '<div class="fwr-left" />' );
					$lastCol.wrapInner( '<div class="fwr-right" />' );
				}
			} );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Classes;
} )( jQuery );
