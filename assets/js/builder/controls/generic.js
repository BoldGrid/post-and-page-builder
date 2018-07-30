window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

import {
	Padding,
	Margin,
	BoxShadow,
	BorderRadius,
	Animation,
	DeviceVisibility
} from '@boldgrid/controls';
import { BackgroundColor } from './generic/background-color';
import { Border } from './generic/border';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BG.CONTROLS.Generic = {
		defaultCustomize: wp.template( 'boldgrid-editor-default-customize' ),

		basicControlInstances: [],

		bgControls: {
			margin: Margin,
			padding: Padding,
			'box-shadow': BoxShadow,
			'border-radius': BorderRadius,
			border: Border,
			'device-visibility': DeviceVisibility,
			animation: Animation,
			'background-color': BackgroundColor
		},

		allControls: [
			'background-color',
			'fontColor',
			'margin',
			'animation',
			'padding',
			'border',
			'box-shadow',
			'border-radius',
			'width',
			'device-visibility',
			'blockAlignment',
			'customClasses'
		],

		/**
		 * Setup controls that come from the BG controls lib.
		 *
		 * @since 1.6
		 *
		 * @param  {object} addOptions Options passed from controls.
		 * @param  {string} name       Name of control.
		 * @return {jQuery}            Control object.
		 */
		appendBasicBGControl( addOptions, name ) {
			let $control,
				bgControl = new name( {
					target: BG.Menu.getCurrentTarget(),
					colorPicker: { width: 215 }
				} );

			bgControl.applyCssRules = property => {
				BOLDGRID.EDITOR.Controls.addStyles( bgControl.$target, property );
				BG.Panel.$element.trigger( BG.Panel.currentControl.name + '-css-change' );
			};

			// On enter customization, refresh Values.
			self.basicControlInstances.push( bgControl );

			$control = bgControl.render();
			self.appendControl( $control );

			return $control;
		},

		/**
		 * Append control to customization area
		 *
		 * @since 1.6
		 * .
		 * @param  {jQuery} $control Control Element.
		 */
		appendControl( $control ) {
			BG.Panel.$element.find( '.panel-body .customize' ).append( $control );
		},

		/**
		 * Create customizatrion section.
		 *
		 * @since 1.6
		 */
		createCustomizeSection() {
			let $container = BG.Panel.$element.find( '.choices' ),
				$customize = self.defaultCustomize();

			if ( ! $container.length ) {
				$container = BG.Panel.$element.find( '.panel-body' );
			}

			$container.append( $customize );

			return $customize;
		},

		/**
		 * Init Controls.
		 *
		 * @since 1.2.7
		 */
		initControls: function() {
			var customizeOptions = BG.Panel.currentControl.panel.customizeSupport || [],
				customizeSupportOptions = BG.Panel.currentControl.panel.customizeSupportOptions || false;

			self.basicControlInstances = [];

			// Add customize section if it does not exist.
			if ( customizeOptions.length && ! BG.Panel.$element.find( '.panel-body .customize' ).length ) {
				self.createCustomizeSection();
			}

			$.each( customizeOptions, function() {
				var $control,
					customizationOption = this,
					addOptions = {};

				if ( customizeSupportOptions && customizeSupportOptions[this] ) {
					addOptions = customizeSupportOptions[this];
				}

				if ( self.bgControls[customizationOption] ) {
					$control = self.appendBasicBGControl( addOptions, self.bgControls[customizationOption] );
				} else {
					customizationOption = customizationOption.replace( '-', '' );
					customizationOption = customizationOption.toLowerCase();
					customizationOption =
						customizationOption.charAt( 0 ).toUpperCase() + customizationOption.slice( 1 );

					$control = BG.CONTROLS.GENERIC[customizationOption].render( addOptions );
					BG.CONTROLS.GENERIC[customizationOption].bind( addOptions );
				}

				BG.Tooltip.renderTooltips();
				$control.attr( 'data-control-name', this );
			} );

			self.bindControlRefresh();
		},

		bindControlRefresh() {
			BG.Panel.$element.on( 'bg-customize-open', () => {
				_.each( self.basicControlInstances, control => {
					if ( control.refreshValues ) {
						control.refreshValues();
					}
				} );
			} );
		},

		/**
		 * Class control that will allow the user to choose between classes.
		 *
		 * @since 1.2.7
		 */
		setupInputCustomization: function() {
			BG.Panel.$element.on( 'change', '.class-control input', function() {
				var $this = $( this ),
					name = $this.attr( 'name' ),
					$el = BG.Menu.getCurrentTarget(),
					controlClassnames = [],
					$siblingInputs = $this.closest( '.class-control' ).find( 'input[name="' + name + '"]' );

				// Find other values.
				$siblingInputs.each( function() {
					controlClassnames.push( $( this ).val() );
				} );

				$el.removeClass( controlClassnames.join( ' ' ) );
				$el.addClass( $this.val() );
			} );
		},

		/**
		 * Setup Init.
		 *
		 * @since 1.2.7
		 */
		setupInputInitialization: function() {
			var panel = BOLDGRID.EDITOR.Panel;

			panel.$element.on( 'bg-customize-open', function() {
				var $el = BG.Menu.getCurrentTarget();

				panel.$element.find( '.class-control input[default]' ).prop( 'checked', true );

				panel.$element.find( '.class-control input' ).each( function() {
					var $this = $( this );
					if ( $el.hasClass( $this.val() ) ) {
						$this.prop( 'checked', true );
					}
				} );
			} );
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.Generic;
} )( jQuery );
