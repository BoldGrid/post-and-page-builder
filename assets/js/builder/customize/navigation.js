var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import template from '../../../../includes/template/customize/navigation.html';

import marginSvg from '../../../../assets/image/icons/customize-nav/margin.svg';
import paddingSvg from '../../../../assets/image/icons/customize-nav/padding.svg';
import borderSvg from '../../../../assets/image/icons/customize-nav/border.svg';
import boxShadow from '../../../../assets/image/icons/customize-nav/box-shadow.svg';
import borderRadius from '../../../../assets/image/icons/customize-nav/border-radius.svg';
import customClasses from '../../../../assets/image/icons/customize-nav/custom-class.svg';
import widthSvg from '../../../../assets/image/icons/customize-nav/width.svg';
import blockAlignment from '../../../../assets/image/icons/customize-nav/block-align.svg';
import colorSvg from '../../../../assets/image/icons/customize-nav/color.svg';
import backgroundColorSvg from '../../../../assets/image/icons/customize-nav/background-color.svg';
import rotateSvg from '../../../../assets/image/icons/customize-nav/rotate.svg';
import fontSizeSvg from '../../../../assets/image/icons/customize-nav/font-size.svg';
import designSvg from '../../../../assets/image/icons/customize-nav/design.svg';
import animationSvg from '../../../../assets/image/icons/customize-nav/animation.svg';
import devicesSvg from '../../../../assets/image/icons/customize-nav/devices.svg';
import hoverSvg from '../../../../assets/image/icons/customize-nav/hover-click.svg';

export class Navigation {
	constructor() {
		this.template = _.template( template );

		this.data = {
			controls: [
				{ name: 'design', icon: designSvg, label: 'Element Design' },
				{ name: 'padding', icon: paddingSvg, label: 'Padding' },
				{ name: 'margin', icon: marginSvg, label: 'Margin' },
				{ name: 'fontSize', icon: fontSizeSvg, label: 'Font Size' },
				{ name: 'fontColor', icon: colorSvg, label: 'Color' },
				{ name: 'background-color', icon: backgroundColorSvg, label: 'Background Color' },
				{ name: 'rotate', icon: rotateSvg, label: 'Rotate' },
				{ name: 'border', icon: borderSvg, label: 'Border' },
				{ name: 'border-radius', icon: borderRadius, label: 'Border Radius' },
				{ name: 'box-shadow', icon: boxShadow, label: 'Box Shadow' },
				{ name: 'animation', icon: animationSvg, label: 'Animation' },
				{ name: 'width', icon: widthSvg, label: 'Width' },
				{ name: 'blockAlignment', icon: blockAlignment, label: 'Block Alignment' },
				{ name: 'device-visibility', icon: devicesSvg, label: 'Responsive Utilities' },
				{ name: 'hoverVisibility', icon: hoverSvg, label: 'Hover Visibility' },
				{ name: 'Fullwidthrows', icon: hoverSvg, label: 'Full Width Rows' },
				{ name: 'customClasses', icon: customClasses, label: 'Custom CSS Classes' }
			]
		};
	}

	/**
	 * Setup.
	 *
	 * @since 1.6.0
	 *
	 * @return {Navigation} Class Instance.
	 */
	init() {
		this._render();
		this._setupClick();
		this._bindEvents();

		return this;
	}

	/**
	 * Show navigation.
	 *
	 * @since 1.6
	 */
	enable() {
		this.$element.show();
	}

	/**
	 * Hide navigation.
	 *
	 * @since 1.6
	 */
	disable() {
		this.$element.hide();
	}

	/**
	 * Process when panel opens.
	 *
	 * @since 1.6
	 */
	onPanelOpen() {
		this._enableMenuOptions();
		this.activateFirstControl();
		this.disable();
	}

	/**
	 * Activate control.
	 *
	 * @since 1.6
	 *
	 * @return {Jquery} Nav Item.
	 */
	activateFirstControl() {
		return this.$element
			.find( '.item.enabled' )
			.first()
			.click();
	}

	/**
	 * Display a generic control by name.
	 *
	 * @since 1.6.0
	 *
	 * @param  {string} name Control name.
	 */
	displayControl( name ) {
		BG.Panel.$element.find( '.customize [data-control-name="' + name + '"]' ).show();
	}

	/**
	 * Bind events for customize navigation.
	 *
	 * @since 1.6.0
	 */
	_bindEvents() {
		BG.Panel.$element.on( 'open', () => this.onPanelOpen() );
	}

	/**
	 * Display eligble menu items.
	 *
	 * @since 1.6
	 */
	_enableMenuOptions() {
		let $items = this.$element.find( '.item' ).removeClass( 'enabled' ),
			$customize = BG.Panel.$element.find( '.customize' );

		$customize.find( '[data-control-name]' ).each( ( index, el ) => {
			let $el = $( el ),
				name = $el.data( 'control-name' );

			this.$element.find( '[data-control-name="' + name + '"]' ).addClass( 'enabled' );
		} );
	}

	/**
	 * Render the navigation.
	 *
	 * @since 1.6.0
	 */
	_render() {
		this.$element = $( this.template( this.data ) );
		this.$element.hide();
		BG.Panel.$element.find( '.panel-title' ).after( this.$element );
	}

	/**
	 * When a user clicks on a nav item, display the coresponding control.
	 *
	 * @since 1.6.0
	 */
	_setupClick() {
		this.$element.find( '.item' ).on( 'click', e => {
			let $el = $( e.target ).closest( '.item' ),
				name = $el.data( 'control-name' );
			e.preventDefault();

			if ( this.$activeControl ) {
				this.$activeControl.removeClass( 'active' );
				BG.Panel.$element.find( '.customize [data-control-name]' ).hide();
			}

			$el.addClass( 'active' );
			this.$activeControl = $el;

			this.displayControl( name );
		} );
	}
}

export { Navigation as default };
