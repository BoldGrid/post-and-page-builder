var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

export class Advanced {
	constructor() {
		this.name = 'Advanced';

		this.panel = {
			title: 'Advanced',
			height: '650px',
			width: '375px',
			customizeCallback: true,
			customizeSupport: [
				'margin',
				'padding',
				'border',
				'width',
				'box-shadow',
				'border-radius',
				'animation',
				'background-color',
				'blockAlignment',
				'deviceVisibility',
				'customClasses'
			]
		};
	}

	/**
	 * Initialize this controls, usually runs right after the constructor.
	 *
	 * @since 1.6
	 */
	init() {
		BG.Controls.registerControl( this );
	}

	_setTargetType( targetType ) {
		BG.Panel.$element.find( '.customize-navigation' ).attr( 'data-element-type', targetType );
	}

	/**
	 * Open the palette customization panel.
	 *
	 * @since 1.6.0
	 */
	openPanel( $target, targetType ) {
		var hoverVisibilityIndex = this.panel.customizeSupport.indexOf( 'hoverVisibility' );

		this.$target = $target;
		BG.Menu.$element.targetData[this.name] = $target;

		if ( ! $target.parent().hasClass( 'has-hover-bg' ) ) {
			this.panel.customizeSupport.splice( hoverVisibilityIndex, 1 );
		} else if ( -1 === hoverVisibilityIndex ) {
			this.panel.customizeSupport.push( 'hoverVisibility' );
		}

		BG.Panel.clear();
		BG.Panel.showFooter();
		BG.Panel.open( this );
		this._setTargetType( targetType );
		BG.Panel.enterCustomization();
		BG.Panel.customizeOpenEvent();
	}
}

export { Advanced as default };
