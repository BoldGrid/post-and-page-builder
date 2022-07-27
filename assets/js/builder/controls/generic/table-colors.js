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
		let $control = $( template );

		BG.Panel.$element.find( '.panel-body .customize .generic-table-colors' ).remove();
		BG.Panel.$element.find( '.panel-body .customize' ).append( $control );

		BG.Panel.$element.on( 'bg-customize-open', () => {
			let currentBackgroundColor = this.$target.css( 'background-color' );
			if ( BG.Controls.$container.color_is( currentBackgroundColor, 'transparent' ) ) {
				currentBackgroundColor = '#FFFFFF';
			}

			this.$control.find( 'label.color-preview' ).css( 'background-color', currentBackgroundColor );
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
