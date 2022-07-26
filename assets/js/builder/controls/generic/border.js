var BG = BOLDGRID.EDITOR,
	$ = window.jQuery;

import template from '../../../../../includes/template/customize/color.html';
import { Border as BorderWidth } from '@boldgrid/controls';

export class Border extends BorderWidth {
	constructor( options ) {
		super( options );

		this.configs = {
			name: 'generic-border-color',
			label: 'Border Color',
			propertyName: 'border-color'
		};
	}

	/**
	 * Render the control.
	 *
	 * @since 1.6
	 *
	 * @return {jQuery} Control element.
	 */
	render() {
		let $control = super.render();

		this.$target = BG.Menu.getCurrentTarget();
		this.$colorControl = this.createControl();

		this.$control.append( this.$colorControl );
		this.$input = this.$colorControl.find( '[name="' + this.configs.name + '"]' );

		this._bind();

		return $control;
	}

	/**
	 * Create a control.
	 *
	 * @since 1.6.0
	 *
	 * @return {jQuery} Control element.
	 */
	createControl() {
		let $control = $( _.template( template )( this.configs ) );

		BG.Panel.$element.on( 'bg-customize-open', () => {
			this.$control
				.find( 'label.color-preview' )
				.css( 'background-color', this.$target.css( this.configs.propertyName ) );
		} );

		return $control;
	}

	/**
	 * Setup border color change event.
	 *
	 * @since 1.6.0
	 */
	_bind() {
		this.$input.on( 'change', () => {
			var value = this.$input.val(),
				type = this.$input.attr( 'data-type' );

			BG.CONTROLS.Color.resetBorderClasses( this.$target );

			if ( 'class' === type ) {
				this.$target.addClass( BG.CONTROLS.Color.getColorClass( this.configs.propertyName, value ) );
			} else {
				BG.Controls.addStyle( this.$target, this.configs.propertyName, value );
			}

			BG.Panel.$element.trigger(
				BG.Panel.currentControl.name + '-' + this.configs.propertyName + '-change'
			);
		} );
	}
}

export { Border as default };
