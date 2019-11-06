window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

import ComponentConfig from '@boldgrid/components/src/components/config';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Hr = {
		name: 'hr',

		tooltip: 'Horizontal Line',

		priority: 80,

		iconClasses: 'genericon genericon-minus',

		selectors: [ '.bg-editor-hr-wrap' ],

		componentPrefix: 'bg-hr',

		panel: {
			title: 'Horizontal Line',
			height: '575px',
			width: '325px',
			includeFooter: true,
			customizeLeaveCallback: true,
			customizeSupport: [
				'fontColor',
				'margin',
				'padding',
				'border',
				'box-shadow',
				'width',
				'blockAlignment',
				'animation',
				'device-visibility',
				'customClasses'
			],
			customizeSupportOptions: {
				margin: {
					horizontal: false
				}
			},
			customizeCallback: true,
			preselectCallback: true,
			styleCallback: true
		},

		maxMyDesigns: 10,

		init: function() {
			BG.Controls.registerControl( this );

			self.myDesigns = [];
			self.userDesigns._format();
			self.template = wp.template( 'boldgrid-editor-hr' );
		},

		setup() {
			this.registerComponent();
		},

		/**
		 * Register the componet in the Add Components panel.
		 *
		 * @since 1.8.0
		 */
		registerComponent() {
			let config = {
				name: 'hr',
				title: 'Divider',
				type: 'design',
				icon: require( './icon.svg' ),
				onInsert: 'prependColumn',
				getDragElement: () => $( this.getTemplate() )
			};

			BG.Service.component.register( config );
		},

		getTemplate() {
			return `<div class="row bg-editor-hr-wrap">
						<div class="col-md-12 col-xs-12 col-sm-12">
							<p><div class="bg-hr bg-hr-16"></div></p>
						</div>
					</div>`;
		},

		/**
		 * Override the get target method to return the hr inside the target instead of the target.
		 *
		 * @since 1.6
		 *
		 * @return {$} Hr element.
		 */
		getTarget: function() {
			return self.$currentTarget;
		},

		/**
		 * When the user clicks on the menu item, open panel.
		 *
		 * @since 1.6
		 */
		onMenuClick: function() {
			var panel = BG.Panel;

			// Remove all content from the panel.
			self.$currentTarget = BOLDGRID.EDITOR.Menu.getTarget( self ).find( '.bg-hr:first' );
			self.userDesigns._update();
			panel.clear();

			// Set markup for panel.
			panel.$element.find( '.panel-body' ).html(
				self.template( {
					text: 'Horizontal Rule',
					presets: ComponentConfig.hr.styles,
					myPresets: self.myDesigns
				} )
			);

			panel.showFooter();

			// Open Panel.
			panel.open( self );
		},

		userDesigns: {

			/**
			 * Append a sting of CSS classes to my designs.
			 *
			 * @since 1.6
			 *
			 * @param  {string} classes  Classes to be added to my designs.
			 */
			append: function( classes ) {
				var componentClasses = BG.Util.getComponentClasses( classes, self.componentPrefix ).join( ' ' );

				// @TODO Check if these classes exist in any order.
				// @TODO Make sure that if the design is removed from use, it's not added to my designs.
				if ( componentClasses && -1 === self.myDesigns.indexOf( componentClasses ) ) {
					self.myDesigns.push( componentClasses );
				}
			},

			/**
			 * Format the user components data into a format the template needs.
			 *
			 * @since 1.6
			 */
			_format: function() {
				var builderConfig = BoldgridEditor.builder_config,
					hrUsed = BoldgridEditor.builder_config.components_used.hr || [];

				_.each( hrUsed.slice( 0, self.maxMyDesigns ), function( design ) {
					self.userDesigns.append( design.classes );
				} );
			},

			/**
			 * Update My Designs with any designs added by the user.
			 *
			 * @since 1.6
			 */
			_update: function() {
				if ( self.myDesigns.length >= self.maxMyDesigns ) {
					return;
				}

				BG.Controls.$container.$body.find( 'hr' ).each( function() {
					self.userDesigns.append( $( this ).attr( 'class' ) );
				} );
			}
		}
	};

	self = BOLDGRID.EDITOR.CONTROLS.Hr;
	BOLDGRID.EDITOR.CONTROLS.Hr.init();
} )( jQuery );
