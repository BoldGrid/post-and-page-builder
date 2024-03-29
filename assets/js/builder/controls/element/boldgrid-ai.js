/**
 * File: assets/js/builder/controls/element/boldgrid-ai.js
 * 
 * BoldGrid AI Panel
 * 
 * @since SINCEVERSION
 */
window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

// Import Semver.
import { createRoot } from '@wordpress/element';
import { BoldgridPanel } from 'boldgrid-panel';

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.BoldgridAi = {
		/**
		 * Name.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		name: 'boldgrid-ai',

		/**
		 * Tooltip.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		tooltip: 'AI',

		/**
		 * Priority.
		 * 
		 * @since 1.25.0
		 * @type {number}
		 */
		priority: 10,

		/**
		 * Currently controlled element.
		 *
		 * @type {$} Jquery Element.
		 */
		$target: null,

		/**
		 * Tracking of clicked elements.
		 * @type {Object}
		 */
		layerEvent: { latestTime: 0, targets: [] },

		/**
		 * Element Type.
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		elementType: '',

		/**
		 * Icon Classes
		 * 
		 * @since 1.25.0
		 * @type {string}
		 */
		iconClasses: '',

		/**
		 * Selectors.
		 * 
		 * @since 1.25.0
		 * @type {Array<string>}
		 */
		selectors: [],

		/**
		 * Panel Config.
		 * 
		 * @since 1.25.0
		 * 
		 * @type {Object<title: string, height: string, width: string, noSlimScroll: boolean, scrollTarget: string, sizeOffset: number>}
		 */
		panel: {
			title: 'Boldgrid AI',
			height: '625px',
			width: '450px',
			noSlimScroll: true,
			scrollTarget: '.panel-body',
			sizeOffset: 0
		},

		/**
		 * Control Init
		 * 
		 * @since 1.25.0
		 */
		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		/**
		 * Get the current target.
		 *
		 * @since 1.25.0
		 *
		 * @return {jQuery} Element.
		 */
		getTarget: function() {
			return self.$target;
		},


		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.25.0
		 *
		 * @param  {string} selector Selector.
		 */
		open( _ ) {
			for ( let target of self.layerEvent.targets ) {
				let $target = $( target );
					self.openPanel( $target );
			}
		},

		/**
		 * When the user clicks on an element within the mce editor record the element clicked.
		 *
		 * @since 1.25.0
		 *
		 * @param  {MouseEvent} event DOM Event
		 */
		elementClick( event ) {
			if ( self.layerEvent.latestTime !== event.timeStamp ) {
				self.layerEvent.latestTime = event.timeStamp;
				self.layerEvent.targets = [];
			}

			self.layerEvent.targets.push( event.currentTarget );
		},

		/**
		 * Find out what type of element we're working with.
		 *
		 * @since 1.25.0
		 */
		setElementType: function() {
			self.elementType = this.checkElementType( self.$target );
			BG.Panel.$element.find( '.customize-navigation' ).attr( 'data-element-type', self.elementType );
			self.panel.targetType = self.elementType;
		},

		/**
		 * Determine the element type supported by this control.
		 *
		 * @since 1.8.0
		 *
		 * @param  {jQuery} $element Jquery Element.
		 * @return {string}          Element.
		 */
		checkElementType: function( $element ) {
			let type = '';
			if ( $element.hasClass( 'boldgrid-section' ) ) {
				type = 'section';
			} else if ( $element.hasClass( 'row' ) ) {
				type = 'row';
			} else if ( $element.hasClass( 'bg-box' ) ) {
				type = 'bg-box';
			} else {
				type = 'column';
			}

			return type;
		},

		/**
		 * Open Panel.
		 *
		 * @since 1.2.7
		 *
		 * @param $target Current Target.
		 */
		openPanel: function( $target ) {
			var panel             = BG.Panel,
				selectedComponent = 'BoldgridAi';

			self.$target = $target;

			// Remove all content from the panel.
			panel.clear();

			panel.$element.find( '.panel-body' ).html();

			self.setElementType();

			panel.$element.find( '.ui-sortable' ).sortable( {
				handle: '.dashicons-move'
			} );

			// Open Panel.
			panel.open( self );

			panel.$element.find( '.panel-body' ).append( '<div class="bg-ai-react-container"></div>' );

			// This will be the element that the React App attaches to.
			const bgRoot = createRoot( panel.$element.find( '.bg-ai-react-container' ).get( 0 ) );

			// Update this to use values passed in init.
			const ApiEndpoints = {
				textGenerate: 'https://api-dev-jamesros.boldgrid.com/api/ai/text-generate',
				textEdit: 'https://api-dev-jamesros.boldgrid.com/api/ai/text-edit',
			};
			
			// Hashed Connect Key will be provided by the PPB plugin
			// Update this to use values passed in init.
			const connectKey = 'ab7f42c94611216266d29f2090cf15ff';

			const usedComponents = [
				{
					name: 'BoldgridAiText',
					props: { target: $( 'body' ), apiEndpoints: ApiEndpoints, connectKey: connectKey },
					navClass: 'dashicons dashicons-editor-textcolor',
					title: 'Background Color',
					Component: null
				}
			];

			return bgRoot.render(
				<BoldgridPanel type="BoldgridAi" selectedComponent='BoldgridAiText' usedComponents={usedComponents} target={self.$target} />
			);
		},
	};

	BOLDGRID.EDITOR.CONTROLS.BoldgridAi.init();
	self = BOLDGRID.EDITOR.CONTROLS.BoldgridAi;

} )( jQuery );
