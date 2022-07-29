var BG = BOLDGRID.EDITOR,
	$ = window.jQuery;

import template from '../../../../../includes/template/customize/table-colors.html';

export class TableColors {

	/**
	 * Render the control.
	 *
	 * @since 1.6
	 *
	 * @return {jQuery} Control element.
	 */
	render() {
		this.$target = BG.Menu.getCurrentTarget();
		this.$control = this.createControl();
		this.$input = this.$control.find( 'input.color-control' );

		this._bind();

		return this.$control;
	}

	/**
	 * Create a control.
	 *
	 * @since 1.6.0
	 *
	 * @return {jQuery} Control element.
	 */
	createControl() {
		let $control = $( template ),
			bgColors = BG.CONTROLS.Color.getColorsFormatted();

		BG.Panel.$element.find( '.panel-body .customize .generic-table-colors' ).remove();
		BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

		BG.Panel.$element.on( 'bg-customize-open', () => {
			var $target = this.$target;

			this.$input.each( ( _, input ) => {
				var $input = $( input ),
					targetType = $input.attr( 'data-target-type' ),
					targetColor = $target.attr( `data-table-${targetType}-bg-color` ),
					targetColorType = $target.attr( `data-table-${targetType}-bg-type` );

				$input.val( targetColor ? targetColor : '#000' );
				$input.attr( 'data-type', targetColorType ? targetColorType : 'color' );
				if ( 'color' === targetColorType ) {
					this.$control
						.find( `label[for=${targetType}-bg-color] ` )
						.css( 'background-color', targetColor ? targetColor : '#fff' );
				} else if ( 'class' === targetColorType ) {
					let color = targetColor ? bgColors[parseInt( targetColor ) - 1].color : '#000';
					this.$control.find( `label[for=${targetType}-bg-color] ` ).css( 'background-color', color );
				} else if ( ! targetColor ) {
					this.$control.find( `label[for=${targetType}-bg-color] ` ).css( 'background-color', '#000' );
				}
			} );
		} );

		return $control;
	}

	/**
	 * Setup background color change event.
	 *
	 * @since 1.6.0
	 */
	_bind() {
		this.$input.on( 'change', e => {
			var $this = $( e.currentTarget ),
				value = $this.val(),
				type = $this.attr( 'data-type' ),
				targetType = $this.attr( 'data-target-type' );

			this.$target.attr( `data-table-${targetType}-bg-color`, value );
			this.$target.attr( `data-table-${targetType}-bg-type`, type );

			BG.CONTROLS.Color.updateTableBackgrounds( this.$target );

			BG.Panel.$element.trigger( BG.Panel.currentControl.name + '-background-color-change' );
		} );
	}
}

export { TableColors as default };
