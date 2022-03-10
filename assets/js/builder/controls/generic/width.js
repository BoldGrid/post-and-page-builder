window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};
BOLDGRID.EDITOR.CONTROLS.GENERIC = BOLDGRID.EDITOR.CONTROLS.GENERIC || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.GENERIC.Width = {
		template: wp.template( 'boldgrid-editor-generic-width' ),

		render: function() {
			var $control = $( this.template() ),
				$customize = BG.Panel.$element.find( '.panel-body .customize' ),
				currentTheme = BoldgridEditor.current_theme,
				isCrio = 'crio' === currentTheme || 'prime' === currentTheme;

			$customize.find( '.section.width-control' ).remove();
			$customize.find( '.section.full-width-rows' ).remove();
			$customize.append( $control );

			BG.Panel.$element.on( 'bg-customize-open', () => {
				var $inputs = BG.Panel.$element.find( '[name="full-width-rows"]' ),
					$target = BG.Menu.getCurrentTarget(),
					value = $target.hasClass( 'full-width-row' ) ? true : false;

				$inputs.each( function() {
					var $this = $( this );

					if ( true === value ) {
						$this.prop( 'checked', true );
					} else {
						$this.prop( 'checked', false );
					}
				} );
			} );

			if ( ! isCrio ) {
				$customize.find( '.section.full-width-rows' ).remove();
			}

			return $control;
		},

		bind: function() {
			var maxVal = 100,
				$target = BG.Menu.getCurrentTarget(),
				width = $target[0].style.width || $target.attr( 'width' );

			this.bindFullWidthRows();

			width = width ? parseInt( width ) : maxVal;
			width = Math.min( width, maxVal );
			width = Math.max( width, 0 );

			BG.Panel.$element
				.find( '.panel-body .customize .width .slider' )
				.slider( {
					min: 10,
					max: 100,
					value: width,
					range: 'max',
					slide: function( event, ui ) {
						if ( 100 === ui.value ) {
							BG.Controls.addStyle( $target, 'width', 'auto' );
						} else {
							BG.Controls.addStyle( $target, 'width', ui.value + '%' );
						}
					}
				} )
				.siblings( '.value' )
				.html( width );
		},

		/**
		 * binds the full width change event.
		 *
		 * @since 1.17.0
		 */
		bindFullWidthRows: function() {
			var panel = BG.Panel,
				$target = BG.Menu.getCurrentTarget();

			panel.$element.find( '[name="full-width-rows"]' ).on( 'change', function() {
				var $this = $( this ),
					value = $this.prop( 'checked' ),
					$firstCol = $target.find( 'div[class^="col-"]:first-of-type' ),
					$lastCol = $target.find( 'div[class^="col-"]:last-of-type' );

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

	self = BOLDGRID.EDITOR.CONTROLS.GENERIC.Width;
} )( jQuery );
