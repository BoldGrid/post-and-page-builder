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

		selectors: [ 'table' ],

		// This is what place we are rounding column widths to.
		roundWidthTo: 5,

		// This is how long we want to display column resize values.
		resizeTooltipDelay: 2000,

		// Panel configuration options.
		panel: {
			title: 'Table Designer',
			height: '600px',
			width: '450px',
			includeFooter: true,
			customizeLeaveCallback: true,
			customizeCallback: true,
			customizeSupport: [ 'tableborders', 'table-colors' ]
		},

		/**
		 * Initialize control.
		 *
		 * @since 1.21.0
		 */
		init: function() {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		/**
		 * Register the componet in the Add Components panel.
		 *
		 * @since 1.21.0
		 */
		registerComponent() {
			let config = {
				name: 'tables',
				title: 'Table',
				type: 'design',
				icon: require( './../../../../image/icons/table.svg' ),
				onInsert: 'prependColumn',
				getDragElement: () => $( self.getDefaultTableMarkup() )
			};

			BG.Service.component.register( config );
		},

		/**
		 * Get the color from defaults
		 *
		 * @since 1.21.0
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
		 * @since 1.21.0
		 * @return {jQuery} Element.
		 */
		getTarget: function() {
			var $target = BOLDGRID.EDITOR.Menu.getTarget( self );

			// Sometimes the target is needed before it's been set by clicking the menu item.
			if ( ! $target ) {
				$target = $( BOLDGRID.EDITOR.mce.selection ).closest( 'table' );
			}

			return $target;
		},

		/**
		 * When the user clicks on a menu item, update the available options.
		 *
		 * @since 1.21.0
		 */
		onMenuClick: function( event ) {
			var initialTarget = BOLDGRID.EDITOR.Menu.getTarget( self );

			if ( event && event.target ) {
				self.$target = initialTarget ? initialTarget : event.target;
			}

			self.openPanel();
		},

		/**
		 * Open the editor panel for a given selector and store element as target.
		 *
		 * @since 1.21.0
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
		 * @since 1.21.0
		 *
		 * @param  {object} event DOM Event
		 */
		elementClick() {
			if ( BOLDGRID.EDITOR.Panel.isOpenControl( this ) ) {
				self.openPanel();
			}
		},

		/**
		 * Bind Column Resize events.
		 *
		 * This utilizes the TinyMCE Tables plugin event 'ObjectResized'
		 * to detect when a resize event occurs on a table. When this happens
		 * we need to round the table widths to ease resizing, and then display
		 * the new size.
		 *
		 * @since 1.21.0
		 */
		_bindColumnResize: function() {
			tinymce.activeEditor.on( 'ObjectResized', event => {
				var eventTarget = event.target;

				// This event can be triggered by other objects.
				if ( ! $( eventTarget ).is( 'table' ) ) {
					return;
				}

				$( eventTarget )
					.find( 'td' )
					.each( function() {
						var width = parseInt( $( this ).width() ),
							parentWidth = parseInt(
								$( this )
									.offsetParent()
									.width()
							),
							percent = Math.ceil( 100 * width / parentWidth ),
							roundedPercent = Math.floor( percent / self.roundWidthTo ) * self.roundWidthTo;

						// If smaller than the rounding value, it'll end up as 0, and disappear. We don't want that.
						roundedPercent =
							self.roundWidthTo > roundedPercent ? self.roundWidthTo : roundedPercent;

						$( this ).css( 'width', roundedPercent + '%' );
					} );

				$( eventTarget )
					.find( 'tr:first-of-type' )
					.find( 'td' )
					.each( function() {
						self._showResizeValue( $( this ) );
					} );
			} );
		},

		/**
		 * Show Resize Value.
		 *
		 * This adds an absolute positioned element to the cells in the first row
		 * to display the current width of the cell after resizing.
		 *
		 * @since 1.21.0
		 *
		 * @param {jQuery Object} $td The td element.
		 */
		_showResizeValue: function( $td ) {
			var width = parseInt( $td.width() ),
				parentWidth = parseInt( $td.offsetParent().width() ),
				percent = Math.ceil( 100 * width / parentWidth ),
				roundedPercent = Math.floor( percent / self.roundWidthTo ) * self.roundWidthTo,
				markup = `<p class="td-resize-tooltip">${roundedPercent}%</p>`;

			$td.find( '.td-resize-tooltip' ).remove();
			$td.append( markup );

			$td
				.find( '.td-resize-tooltip' )
				.delay( self.resizeTooltipDelay )
				.fadeOut( 1000, function() {
					$( this ).remove();
				} );
		},

		/**
		 * Setup Init.
		 *
		 * @since 1.21.0
		 */
		setup: function() {
			self.$menuItem = BG.Menu.$element.find( '[data-action="menu-tables"]' );

			tinymce.activeEditor.contextToolbars[0].items =
				'tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol';

			self._bindContextToolbar();

			self._bindStructureChanges();

			self._bindColumnResize();

			self.registerComponent();
		},

		/**
		 * Determine the element type supported by this control.
		 *
		 * @since 1.21.0
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
		 * @since 1.21.0
		 */
		openPanel: function() {
			var panel = BG.Panel,
				template = wp.template( 'boldgrid-editor-tables' );

			// Remove all content from the panel.
			panel.clear();
			panel.$element.find( '.panel-body' ).html( template() );

			self._setupChangeColsRows();

			self._setupChangeHeadingLabels();

			self._setupChangeOptions();

			// Open Panel.
			panel.open( self );
		},

		/**
		 * Bind Context Toolbar.
		 *
		 * We need to be able to adjust the table toolbar positioning.
		 * Because the toolbar doesn't exist until the table is first clicked,
		 * we need to use a MutationObserver to detect when the toolbar is created.
		 *
		 * @since 1.21.0
		 */
		_bindContextToolbar: function() {
			var observer = new MutationObserver( ( mutationList, observer ) => {
				mutationList.forEach( mutation => {
					if ( 'childList' === mutation.type ) {
						mutation.addedNodes.forEach( node => {
							var nodeIsFloatpanel = $( node ).hasClass( 'mce-floatpanel' ),
								nodeHasTableButton = 0 < $( node ).find( '.mce-i-tableinsertrowafter' ).length;
							if ( nodeIsFloatpanel && nodeHasTableButton ) {
								self._adjustToolbarPosition( $( node ) );
								tinymce.activeEditor.contextToolbars[0].panel.state.off(
									'change:visible',
									self._bindShowHideContextToolbar
								);
								tinymce.activeEditor.contextToolbars[0].panel.state.on(
									'change:visible',
									self._bindShowHideContextToolbar
								);
							}
						} );
					}
				} );
			} );

			var observerOptions = {
				childList: true,
				subtree: false,
				attributes: false
			};

			observer.observe( document.body, observerOptions );
		},

		/**
		 * Bind Show Hide Context Toolbar.
		 *
		 * Bind Toolbar Position adjustment to the Toolbar's visibility change event.
		 *
		 * @since 1.21.0
		 *
		 * @param {Event} event Toolbar Visibility Change Event.
		 */
		_bindShowHideContextToolbar: function( event ) {
			var $toolbar = $( '.mce-floatpanel' );

			// Event.value is only true when the toolbar is visible.
			if ( event.value ) {
				self._adjustToolbarPosition( $toolbar );
			}
		},

		/**
		 * Adjust Toolbar Position.
		 *
		 * The toolbar positioning gets screwed up due to our implementation of the TinyMCE editor,
		 * so we have to correc the positioning whenever it is displayed.
		 *
		 * @param {jQuery Object} $toolbar The toolbar element.
		 */
		_adjustToolbarPosition: function( $toolbar ) {
			var iframeRects = tinymce.activeEditor.iframeElement.getClientRects()[0],
				toolbarPanel = tinymce.activeEditor.contextToolbars[0].panel,
				toolbarRects = toolbarPanel.layoutRect(),
				newRects = {},
				selectionRects = self
					.getTarget()
					.closest( 'table' )[0]
					.getClientRects()[0];

			if ( ! selectionRects || ! toolbarRects || ! iframeRects ) {
				return;
			}

			newRects.x = iframeRects.x + selectionRects.x - toolbarRects.w / 2 + selectionRects.width / 2;
			newRects.y = iframeRects.y + selectionRects.y + window.scrollY + selectionRects.height;

			$toolbar.css( 'top', newRects.y );
			$toolbar.css( 'left', newRects.x );
		},

		/**
		 * Setup Change Heading Labels.
		 *
		 * Heading labels are used to display the label in responsive tables.
		 * When the label inputs are changed, we assign their values to the data-label attribute.
		 *
		 * @since 1.21.0
		 */
		_setupChangeHeadingLabels() {
			var panel = BG.Panel,
				$target = self.getTarget(),
				$headingLabelsSection = panel.$element.find( '.section-heading-labels' ),
				$targetHeadings = $target.find( 'th' );

			$headingLabelsSection.children().remove();

			$targetHeadings.each( function() {
				var $heading = $( this ),
					headingLabel = $heading.attr( 'data-label' ) ? $heading.attr( 'data-label' ) : '',
					headingIndex = $heading.index();

				$headingLabelsSection.append(
					`<p class="hide-header">
						<label>Heading ${headingIndex + 1} Label
							<input type="text" 
								name="heading-label-${headingIndex}"
								data-heading-index="${headingIndex}"  
								value="${headingLabel}"></label>
					</p>`
				);
			} );

			$headingLabelsSection.find( 'input' ).each( self._bindHeadingLabels );

			$headingLabelsSection.find( 'input' ).on( 'change', self._bindHeadingLabels );
		},

		/**
		 * Bind Heading Labels.
		 *
		 * This is the actual event handler for the heading label inputs.
		 *
		 * @since 1.21.0
		 */
		_bindHeadingLabels: function() {
			var $this = $( this ),
				$target = self.getTarget(),
				$targetHeadings = $target.find( 'th' ),
				headingIndex = $this.data( 'heading-index' ),
				headingLabel = $this.val() ? $this.val() : '',
				$heading = $targetHeadings.eq( headingIndex );

			$heading.attr( 'data-label', headingLabel );

			$target
				.find( 'tbody' )
				.find( 'tr' )
				.each( function() {
					var $row = $( this ),
						$columnCell = $row.find( 'td' ).eq( headingIndex );

					$columnCell.attr( 'data-label', headingLabel );
				} );
		},

		/**
		 * Bind Structure Changes
		 *
		 * Whenever the structure of the table is changed by adding
		 * or deleting rows or columns, we have to make sure that
		 * various things are updated appropriately. Since TinyMCE doesn't have an event for this, we
		 * can do this by listenging to the 'ExecCommand' event, and filtering the events by the commands
		 * that were executed.
		 *
		 * @since 1.21.0
		 */
		_bindStructureChanges: function() {
			tinyMCE.activeEditor.on( 'ExecCommand', event => {
				var command = event.command,
					numRows = parseInt( self.getTarget().attr( 'data-num-rows' ) ),
					numCols = parseInt( self.getTarget().attr( 'data-num-cols' ) ),
					rowAddCommands = [
						'mceTableInsertRowBefore',
						'mceTableInsertRowAfter',
						'mceTablePasteRowBefore',
						'mceTablePasteRowAfter'
					],
					rowDelCommands = [ 'mceTableDeleteRow', 'mceTableCutRow' ],
					colAddCommands = [
						'mceTableInsertColBefore',
						'mceTableInsertColAfter',
						'mceTablePasteColBefore',
						'mceTablePasteColAfter'
					],
					colDelCommands = [ 'mceTableDeleteCol', 'mceTableCutCol' ];

				// Bind to Row Addition
				if ( -1 !== rowAddCommands.indexOf( command ) ) {
					self.getTarget().attr( 'data-num-rows', numRows + 1 );
					BG.CONTROLS.Color.updateTableBackgrounds( self.getTarget() );
					self._setupChangeColsRows();
					self._setupChangeHeadingLabels();
				}

				// Bind to Row Deletion
				if ( -1 !== rowDelCommands.indexOf( command ) ) {
					self.getTarget().attr( 'data-num-rows', numRows - 1 );
					BG.CONTROLS.Color.updateTableBackgrounds( self.getTarget() );
					self._setupChangeColsRows();
					self._setupChangeHeadingLabels();
				}

				// Bind to Column Addition
				if ( -1 !== colAddCommands.indexOf( command ) ) {
					self.getTarget().attr( 'data-num-cols', numCols + 1 );
					self._setupChangeColsRows();
					self._setupChangeHeadingLabels();
					self._setupColumnSizing();
				}

				// Bind to Column Deletion
				if ( -1 !== colDelCommands.indexOf( command ) ) {
					self.getTarget().attr( 'data-num-cols', numCols - 1 );
					self._setupChangeColsRows();
					self._setupChangeHeadingLabels();
					self._setupColumnSizing();
				}
			} );
		},

		/**
		 * Bind Column Sizing.
		 *
		 * Whenever a column is added or deleted, we need to make
		 * sure that all the columns are an even percentage.
		 *
		 * @since 1.21.0
		 */
		_setupColumnSizing: function() {
			var $target = self.getTarget(),
				numCols = parseInt( $target.attr( 'data-num-cols' ) ),
				widthVal = Math.floor( 100 / numCols );

			$target.find( 'th, td' ).each( ( _, col ) => {
				$( col ).css( 'width', widthVal + '%' );
			} );
		},

		/**
		 * Setup Change Cols Rows.
		 *
		 * This sets up the changing of the number of columns
		 * and rows input fields.
		 *
		 * @since 1.21.0
		 */
		_setupChangeColsRows: function() {
			var panel = BG.Panel,
				$target = self.getTarget(),
				$colsInput = panel.$element.find( 'input[name=tables-number-of-columns]' ),
				$rowsInput = panel.$element.find( 'input[name=tables-number-of-rows]' );

			$colsInput.off( 'change' );
			$rowsInput.off( 'change' );

			$colsInput.val( $target.attr( 'data-num-cols' ) );
			$rowsInput.val( $target.attr( 'data-num-rows' ) );

			$colsInput.on( 'change', function() {
				var $this = $( this ),
					colsValue = parseInt( $this.val() ),
					targetCols = parseInt( $target.attr( 'data-num-cols' ) ),
					selection = BOLDGRID.EDITOR.mce.selection;

				if ( colsValue > targetCols ) {
					let i = 0;
					while ( i < colsValue - targetCols ) {
						selection.setCursorLocation( $target.find( 'td' ).last()[0] );
						tinyMCE.activeEditor.execCommand( 'mceTableInsertColAfter' );
						i++;
					}
				} else if ( colsValue < targetCols ) {
					let i = 0;
					while ( i < targetCols - colsValue ) {
						selection.setCursorLocation( $target.find( 'td' ).last()[0] );
						tinyMCE.activeEditor.execCommand( 'mceTableDeleteCol' );
						i++;
					}
				}
			} );

			$rowsInput.on( 'change', function() {
				var $this = $( this ),
					rowsValue = parseInt( $this.val() ),
					targetRows = parseInt( $target.attr( 'data-num-rows' ) ),
					selection = BOLDGRID.EDITOR.mce.selection;

				if ( rowsValue > targetRows ) {
					let i = 0;
					while ( i < rowsValue - targetRows ) {
						tinyMCE.activeEditor.execCommand( 'mceTableInsertRowAfter' );
						selection.setCursorLocation( $target.find( 'td' ).last()[0] );
						i++;
					}
				} else if ( rowsValue < targetRows ) {
					let i = 0;
					while ( i < targetRows - rowsValue ) {
						tinyMCE.activeEditor.execCommand( 'mceTableDeleteRow' );
						selection.setCursorLocation( $target.find( 'td' ).last()[0] );
						i++;
					}
				}
			} );
		},

		/**
		 * Setup Change Options.
		 *
		 * This sets up the changing of the generic option
		 * fields. These fields all work based on adding / removing
		 * classes. Therefore all of these options' handlers can be
		 * generalized.
		 *
		 * @since 1.21.0
		 */
		_setupChangeOptions: function() {
			var panel = BG.Panel,
				$target = self.getTarget(),
				$optionInputs = panel.$element.find( 'input.general-table-option' );

			$optionInputs.each( function() {
				var $this = $( this ),
					$target = self.getTarget(),
					value = $this.val();

				if ( value && $target.hasClass( value ) ) {
					$this.prop( 'checked', true );
				}
			} );

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

				if ( 'tables-striped-rows' === $this.attr( 'name' ) ) {
					BG.CONTROLS.Color.updateTableBackgrounds( $target );
				}
			} );
		},

		/**
		 * Default Table Markup.
		 *
		 * @since 1.21.0
		 *
		 * @returns {string} default table markup.
		 */
		getDefaultTableMarkup: function() {
			return `<table class="bg-table table" data-num-cols="3" data-num-rows="4" style="width:100%">
                    <thead>
                        <tr>
                            <th data-label="Header 1">Header 1</th>
                            <th data-label="Header 2">Header 2</th>
                            <th data-label="Header 3">Header 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-row="1">
                            <td data-label="Header 1">Cell 1</td>
                            <td data-label="Header 2">Cell 2</td>
                            <td data-label="Header 3">Cell 3</td>
                        </tr>
                        <tr data-row="2">
                            <td data-label="Header 1">Cell 1</td>
                            <td data-label="Header 2">Cell 2</td>
                            <td data-label="Header 3">Cell 3</td>
                        </tr>
                        <tr data-row="3">
                            <td data-label="Header 1">Cell 1</td>
                            <td data-label="Header 2">Cell 2</td>
                            <td data-label="Header 3">Cell 3</td>
                        </tr>
                        <tr data-row="4">
                            <td data-label="Header 1">Cell 1</td>
                            <td data-label="Header 2">Cell 2</td>
                            <td data-label="Header 3">Cell 3</td>
                        </tr>
                    </tbody>
                </table>`;
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Tables.init();
	self = BOLDGRID.EDITOR.CONTROLS.Tables;
} )( jQuery );
