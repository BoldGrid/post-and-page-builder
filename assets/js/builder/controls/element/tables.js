window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Tables = {
		name: 'tables',

		tooltip: 'Table Designer',

		uploadFrame: null,

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

		elementType: '',

		iconClasses: 'dashicons dashicons-editor-table',

		selectors: [ 'table', 'div[class*="col"]' ],

		defaults: {
			cols: 3,
			rows: 4
		},

		/**
		 * Initialize control.
		 *
		 * @since 1.17.0
		 */
		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		panel: {
			title: 'Table Designer',
			height: '600px',
			width: '450px',
			includeFooter: true,
			customizeLeaveCallback: true,
			customizeCallback: true,
			customizeSupport: [
				'margin',
				'box-shadow',
				'tableborders',
				'animation',
				'table-colors',
				'customClasses'
			]
		},

		/**
		 * Get the color from defaults
		 *
		 * @since 1.17.0
		 *
		 * @param {string} color color value
		 * @returns color value
		 */
		getColorFromPalette: function( color ) {
			var paletteColors = BoldgridEditor.colors,
				isPaletteColor = false,
				isNeutralColor;

			isNeutralColor = BOLDGRID.COLOR_PALETTE.Modify.compareColors( color, paletteColors.neutral );

			if ( false !== isNeutralColor ) {
				return 'var( --color-neutral )';
			}

			paletteColors.defaults.forEach( function( paletteColor, index ) {
				var isMatch = BOLDGRID.COLOR_PALETTE.Modify.compareColors( color, paletteColor );
				if ( isMatch ) {
					isPaletteColor = `var(--color-${index + 1} )`;
				}
			} );

			return false !== isPaletteColor ? isPaletteColor : color;
		},

		/**
		 * Get the current target.
		 *
		 * @since 1.8.0
		 * @return {jQuery} Element.
		 */
		getTarget: function() {
			return self.$target;
		},

		/**
		 * When the user clicks on a menu item, update the available options.
		 *
		 * @since 1.8.0
		 */
		onMenuClick: function() {
			var initialTarget = BOLDGRID.EDITOR.Menu.getTarget( self );
			self.createTable( initialTarget );
			self.openPanel();
		},

		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.8.0
		 *
		 * @param  {string} selector Selector.
		 */
		open: function( selector ) {
			for ( let target of self.layerEvent.targets ) {
				let $target = $( target );
				if ( $target.is( selector ) ) {
					self.openPanel( $target );
				}
			}
		},

		/**
		 * When the user clicks on an element within the mce editor record the element clicked.
		 *
		 * @since 1.8.0
		 *
		 * @param  {object} event DOM Event
		 */
		elementClick( event ) {
			if ( self.layerEvent.latestTime !== event.timeStamp ) {
				self.layerEvent.latestTime = event.timeStamp;
				self.layerEvent.targets = [];
			}

			self.layerEvent.targets.push( event.currentTarget );
		},

		/**
		 * Setup Init.
		 *
		 * @since 1.2.7
		 */
		setup: function() {
			self.$menuItem = BG.Menu.$element.find( '[data-action="menu-tables"]' );

			self._setupMenuReactivate();
		},

		/**
		 * When a menu item is reopened because a user clicked on another similar element
		 * Update the available options.
		 *
		 * @since 1.8.0
		 */
		_setupMenuReactivate: function() {
			self.$menuItem.on( 'reactivate', self.updateMenuOptions );
		},

		/**
		 * Add style to header.
		 *
		 * @since 1.17.0
		 *
		 * @param {string} styleId style id
		 * @param {string} css css
		 */
		_addHeadingStyle: function( styleId, css ) {
			var $target = self.getTarget(),
				$body = $target.parents( 'body' ),
				$head = $body.parent().find( 'head' );

			if ( $head.find( '#' + styleId ).length ) {
				$head.find( '#' + styleId ).remove();
			}

			$head.append( '<style id="' + styleId + '">' + css + '</style>' );
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
			if ( $element.is( 'TABLE' ) ) {
				type = 'table';
			} else if ( $element.hasClass( 'row' ) ) {
				type = 'row';
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
			var panel = BG.Panel,
				template = wp.template( 'boldgrid-editor-tables' );

			// Remove all content from the panel.
			panel.clear();
			panel.$element.find( '.panel-body' ).html( template( self.getTemplateVariables() ) );

			self._setupChangeOptions();

			// Open Panel.
			panel.open( self );
		},

		/**
		 * Get Variables for use in template.
		 *
		 * @since 1.17.0
		 *
		 * @returns {array} array of template variables.
		 */
		getTemplateVariables: function() {
			var variables = {
				states: {}
			};

			return variables;
		},

		createTable: function( initialTarget ) {
			var selection = BOLDGRID.EDITOR.mce.selection,
				$selection = $( selection.getNode() ),
				$parentDiv = $selection.parents( 'div[class*=col]' ),
				nodeType = $selection.prop( 'nodeName' ),
				talbeNodeTypes = [ 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH' ],
				content;

			if (
				-1 === talbeNodeTypes.indexOf( nodeType ) &&
				! $selection.is( '[class*=col]' ) &&
				$parentDiv.length
			) {
				selection.select( $selection.parents( 'div[class*=col]' )[0] );
				$selection = $( selection.getNode() );
				nodeType = $selection.prop( 'nodeName' );
			}

			if ( -1 === talbeNodeTypes.indexOf( nodeType ) ) {
				content = selection.getContent();
				content = self.getDefaultTableMarkup() + content;
				selection.setContent( content );
				self.$target = $( selection.getNode() ).find( 'table' );
			} else if ( 'TABLE' === nodeType ) {
				self.$target = $selection;
				BG.Menu.setTarget( self, $selection );
			} else {
				self.$target = $selection.parents( 'table' );
				BG.Menu.setTarget( self, $selection.parents( 'table' ) );
			}
		},

		_setupChangeOptions: function() {
			var panel = BG.Panel,
				$target = self.getTarget(),
				$optionInputs = panel.$element.find( '.section-general-options input' );

			$optionInputs.on( 'change', function() {
				var $this = $( this ),
					isChecked = $this.prop( 'checked' ) ? true : false;

				if ( 'radio' === $this.attr( 'type' ) ) {
					$target.removeClass( $this.attr( 'data-classes' ) );
				}

				if ( isChecked ) {
					$target.addClass( $this.val() );
				} else {
					$target.removeClass( $this.val() );
				}
			} );
		},

		/**
		 * Default Table Markup.
		 *
		 * @since SINCEVERSION
		 *
		 * @returns {string} default table markup.
		 */
		getDefaultTableMarkup: function() {
			return `<table class="table">
                    <thead>
                        <tr>
                            <th data-column="1">Header 1</th>
                            <th data-column="2">Header 2</th>
                            <th data-column="3">Header 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-row="1">
                            <td data-column="1">Cell 1</td>
                            <td data-column="2">Cell 2</td>
                            <td data-column="3">Cell 3</td>
                        </tr>
                        <tr data-row="2">
                            <td data-column="1">Cell 1</td>
                            <td data-column="2">Cell 2</td>
                            <td data-column="3">Cell 3</td>
                        </tr>
                        <tr data-row="3">
                            <td data-column="1">Cell 1</td>
                            <td data-column="2">Cell 2</td>
                            <td data-column="3">Cell 3</td>
                        </tr>
                        <tr data-row="4">
                            <td data-column="1">Cell 1</td>
                            <td data-column="2">Cell 2</td>
                            <td data-column="3">Cell 3</td>
                        </tr>
                    </tbody>
                </table>`;
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Tables.init();
	self = BOLDGRID.EDITOR.CONTROLS.Tables;
} )( jQuery );
