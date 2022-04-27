var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

export class Advanced {
	constructor() {
		this.name = 'Advanced';

		this.panel = {
			title: 'Advanced',
			height: '575px',
			width: '375px',
			customizeCallback: true,
			customizeSupport: [
				'margin',
				'padding',
				'border',
				'outline',
				'width',
				'box-shadow',
				'border-radius',
				'animation',
				'background-color',
				'blockAlignment',
				'responsiveAlignment',
				'device-visibility',
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
		BG.Panel.$element.attr( 'data-element-type', targetType );
	}

	/**
	 * Open the palette customization panel.
	 *
	 * @since 1.6.0
	 */
	openPanel( $target, targetType ) {
		var hoverVisibilityIndex,
			responsiveAlignmentIndex,
			outlineIndex,
			isHoverChild,
			theme = BoldgridEditor.current_theme,
			isCrio = 'prime' === theme || 'crio' === theme ? true : false,
			$parent = $target.parent();

		this.$target = $target;
		BG.Menu.$element.targetData[this.name] = $target;

		if ( 'row' === targetType ) {
			$parent = $target.parents( '.boldgrid-section' );
		}

		if ( $parent.hasClass( 'has-hover-bg' ) ) {
			isHoverChild = true;
		} else if ( 0 !== $parent.closest( 'div[class*="col"].has-hover-bg' ).length ) {
			isHoverChild = true;
		} else if ( $target.is( 'div.row' ) && 0 !== $parent.parents( 'has-hover-bg' ).length ) {
			isHoverChild = true;
		}

		hoverVisibilityIndex = this.panel.customizeSupport.indexOf( 'hoverVisibility' );

		if ( ! isHoverChild && -1 !== hoverVisibilityIndex ) {
			this.panel.customizeSupport.splice( hoverVisibilityIndex, 1 );
		} else if ( isHoverChild && -1 === hoverVisibilityIndex ) {
			this.panel.customizeSupport.push( 'hoverVisibility' );
		}

		responsiveAlignmentIndex = this.panel.customizeSupport.indexOf( 'responsiveAlignment' );

		if ( ! isCrio && -1 !== responsiveAlignmentIndex ) {
			this.panel.customizeSupport.splice( responsiveAlignmentIndex, 1 );
		} else if ( isCrio && -1 === responsiveAlignmentIndex ) {
			this.panel.customizeSupport.push( 'hoverVisibility' );
		}

		outlineIndex = this.panel.customizeSupport.indexOf( 'outline' );

		if ( ! isCrio && -1 !== outlineIndex ) {
			this.panel.customizeSupport.splice( outlineIndex, 1 );
		} else if ( isCrio && -1 === outlineIndex ) {
			this.panel.customizeSupport.push( 'outline' );
		}

		this.panel.targetType = targetType;

		BG.Panel.clear();
		BG.Panel.showFooter();
		BG.Panel.open( this );
		this._setTargetType( targetType );
		BG.Panel.enterCustomization();
		BG.Panel.customizeOpenEvent();
	}
}

export { Advanced as default };
