var BG = BOLDGRID.EDITOR;

import ContentDragging from './drag/content.js';
import ColumnDragging from './drag/column.js';
import { Placeholder } from './drag/placeholder.js';
import ieVersion from './browser/ie-version.js';

jQuery.fn.IMHWPB_Draggable = function( settings, $ ) {
	var self = this,
		BG = BOLDGRID.EDITOR,
		most_recent_enter = [];

	self.ie_version = null;
	self.isSafari = null;

	/**
	 * The jQuery object that the user indicated was draggable.
	 */
	self.$master_container = this;

	// Some Jquery Selectors to be reused.
	self.$window = $( window );
	self.$iframe = $( '#content_ifr' );
	self.$body = self.find( 'body' );
	self.$html = self.find( 'html' );
	self.$validatedInput = $( 'input[name="boldgrid-in-page-containers"]' );
	self.resizeOverlay = wp.template( 'boldgrid-editor-mce-tools' )();
	self.find( 'html' ).append( self.resizeOverlay );
	self.original_selector_strings = {};

	self.scrollInterval = false;

	// Tinymce element used for auto scrolling.
	this.$mce_32 = $( '#wp-content-wrap .mce-container-body .mce-toolbar-grp:first' );

	self.$post_status_info = $( '#post-status-info' );

	/** Popover Menu Items to be added. **/
	self.additional_menu_items = settings.menu_items || [];

	/** How long should we wait before removing or displaying a new popover. **/
	this.hover_timout = settings.hover_timout || 175;

	/**
	 * How far away from a column in the verticle direction should I drag before becoming unlocked.
	 * @type {Number}
	 */
	this.columnUnlockThreshold = 75;

	/**
	 * The interaction container refers to the wrapper that holds all the draggable items.
	 */
	this.$interaction_container = null;

	// BoldGrid menu item clicked.
	this.$boldgrid_menu_action_clicked = null;

	// Last occurrence of an auto scroll.
	this.last_auto_scroll_event = null;

	// Is the user editing anested row.
	this.editting_as_row = false;

	// These Setting is used to manage the states of the visible popovers.
	this.hover_elements = {
		content: {
			add_element: null
		},
		column: {
			add_element: null
		},
		row: {
			add_element: null
		}
	};

	/**
	 * These color alias' help to make sure that the text and background color have enough contrast.
	 */
	this.color_alias = {
		white: [ 'rgb(255, 255, 255)', 'white' ],
		transparent: [ 'rgba(0, 0, 0, 0)', 'transparent' ]
	};

	// This.master_container_id = '#' + .uniqueId().attr('id');
	this.master_container_id = ''; // Temp because document cant have ID.

	/**
	 * Event that indicates that dragging has finished and started.
	 */
	this.resize_finish_event = $.Event( 'resize_done_dwpb' );
	this.resize_start_event = $.Event( 'resize_start_dwpb' );
	this.boldgrid_modify_event = $.Event( 'boldgrid_modify_content' );

	/** Event fire once row has been added. **/
	this.add_row_event = $.Event( 'add_row_event_dwpb' );

	/** Triggered once an element is deleted. **/
	this.delete_event = $.Event( 'delete_dwpb' );

	/** Triggered once an elements contents are cleared. **/
	this.clear_event = $.Event( 'clear_dwpb' );

	/**
	 * An event that indicates that a column has been added.
	 */
	this.add_column_event = $.Event( 'add_column_dwpb' );

	/**
	 * An event that indicates the dragging has started.
	 */
	this.drag_start_event = $.Event( 'drag_start_dwpb' );

	/**
	 * A Boolean indicating whether or not we have disbabled popovers.
	 */
	this.popovers_disabled = false;

	/**
	 * How many pixels of the right side border before we cause the row to stack.
	 */
	this.right_resize_buffer = 10;

	/**
	 * A boolean indication to ensure that every dragstart has a drag finish and
	 * or drag drop A big that frequently occurs in internet explorer.
	 */
	this.drag_end_event = $.Event( 'drag_end_dwpb' );

	/**
	 * Has the user recently clicked on nesting a row.
	 */
	this.nest_row = false;

	/**
	 * A booleaan that helps us force drag drop event on safarii and ie.
	 */
	this.drag_drop_triggered = false;

	/**
	 * A boolean flag passed in to allow console.log's.
	 */
	this.debug = settings.debug;

	/**
	 * A string that represents all draggable selectors.
	 */
	this.draggable_selectors_string = null;

	/**
	 * A string that represents all row selectors.
	 */
	this.row_selectors_string = null;

	/**
	 * A string of the formated content selectors.
	 */
	this.content_selectors_string = null;

	/**
	 * The selectors that represent draggable columns Essentially all columns
	 * that are not within a nested row.
	 */
	this.column_selectors_string = null;

	/**
	 * The class name used for dragging selectors.
	 */
	this.dragging_selector_class_name = 'dragging-imhwpb';

	/**
	 * The dragging class as a $ selector.
	 */
	this.dragging_selector = '.' + this.dragging_selector_class_name;

	/**
	 * The currently dragged object is stored here. When starts dragging this
	 * element is hidden. When the user finishes the drag, this element is
	 * removed().
	 */
	this.$current_drag = null;

	/**
	 * Boolean Whether or not the user is currently in the resizing process.
	 */
	this.resize = false;

	/**
	 * Boolean Has the user clicked on an item that is draggable.
	 */
	this.valid_drag = null;

	/**
	 * The buffer in pixels of how close the user needs to be to a border in
	 * order to activate the drag handle.
	 */
	this.border_hover_buffer = 15;

	/**
	 * How far the user can be from the resize position before it automatically
	 * snaps to that location.
	 */
	this.resize_buffer = 0.0213;

	/**
	 * The maximum number of columns that can be in a row.
	 */
	this.max_row_size = 12;

	/**
	 * The most recently added added element to a row.
	 */
	this.$most_recent_row_enter_add = null;

	/**
	 * Current Window Width.
	 */
	this.window_width = null;

	/**
	 * Current window height.
	 */
	this.window_height = null;

	/**
	 * The current column class being used by bootstrap in relation to the
	 * current size of the screen.
	 */
	this.active_resize_class = null;

	/**
	 * Temporarily transformed row that must be changed back.
	 */
	this.restore_row = null;

	/**
	 * When an element is dragged it creates a new object, hides the old object
	 * and saves the new object to this variable. That object is deleted
	 * whenever the user drags onwards.
	 */
	this.$temp_insertion = null;

	/**
	 * This element is created for the drag image and then deleted when dragging is complete.
	 */
	this.$cloned_drag_image = null;

	/**
	 * Default selectors for rows.
	 */
	this.row_selector = settings.row_selector || [ '.row:not(.row .row)' ];

	/**
	 * Add media event handler.
	 */
	this.add_media_event_handler = settings.add_media_event_handler || function() {};

	/**
	 * Insert layout.
	 */
	this.insert_layout_event_handler = settings.insert_layout_event_handler || function() {};

	/**
	 * An array of the column selectors.
	 */
	this.general_column_selectors = settings.general_column_selectors || [
		'[class*="col-md"]'
	];

	/**
	 * Nested row selector.
	 */
	this.nested_row_selector_string = '.row .row:not(.row .row .row)';

	/**
	 * Nested row selector.
	 */
	this.sectionSelectorString = '.boldgrid-section';

	this.nestedColumnSelector = '.row .row > [class*="col-md"]:not(.row .row .row [class*="col-md"])';

	/**
	 * These are the selectors that are defined as content elements.
	 * @todo Use this array to create content_selectors & nested_mode_content_selectors.
	 */
	this.general_content_selectors = [

		// General Content Selectors.
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'h7',
		'a:not(p a)',
		'img:not(p img):not(a img)',
		'p:not(blockquote p)',
		'button:not(p button):not(a button)',
		'ul',
		'pre',
		'ol',
		'dl',
		'form',
		'table',
		'.row .row',
		'[data-imhwpb-draggable="true"]',
		'.wpview-wrap',
		'.wpview',
		'blockquote',
		'code',
		'abbr'
	];

	/**
	 * A string containing the eligible content selectors A "content element" is
	 * an element that can.. - be placed into a column - be placed outside of a
	 * row - be sorted in a container Initialized at page load.
	 */
	this.content_selectors = settings.content_selectors || [

		// Headings.
		'h1:not(.row .row h1)',
		'h2:not(.row .row h2)',
		'h3:not(.row .row h3)',
		'h4:not(.row .row h4)',
		'h5:not(.row .row h5)',
		'h6:not(.row .row h6)',
		'h7:not(.row .row h7)',

		'a:not(.row .row a):not(p a)',

		// Common Drag Content.
		/*******************************************************************
		 * Specifying that nested content is not draggable, is not
		 * necessary, but improves performance I've defined common cases so
		 * that the selector is not made any larger than it already is
		 ******************************************************************/
		'img:not(.row .row img):not(p img):not(a img)',
		'p:not(.row .row p):not(blockquote p)',
		'button:not(.row .row button):not(p button):not(a button)',

		// Lists.
		'ul:not(.row .row ul):not(.draggable-tools-imhwpb ul)',
		'ol:not(.row .row ol)',
		'dl:not(.row .row dl)',

		// Additional Content.
		'form:not(.row .row form)',
		'table:not(.row .row table)',
		'pre:not(.row .row pre)',

		// Nested Rows - Not rows nested out of master container.
		'.row .row:not(.row .row .row)',

		// Custom definitions.
		'[data-imhwpb-draggable="true"]:not(.row .row [data-imhwpb-draggable="true"])',

		// WP specific wrapper.
		'.wpview-wrap:not(.row .row .wpview-wrap)',
		'.wpview:not(.row .row .wpview)',

		'blockquote:not(.row .row blockquote)',
		'code:not(.row .row code)',
		'abbr:not(.row .row abbr)'
	];

	/**
	 * A string containing the eligible content selectors A "content element" is
	 * an element that can.. - be placed into a column - be placed outside of a
	 * row - be sorted in a container Initialized at page load.
	 */
	var nested_mode_content_selectors = [

		// Headings.
		'.row .row h1',
		'.row .row h2',
		'.row .row h3',
		'.row .row h4',
		'.row .row h5',
		'.row .row h6',
		'.row .row h7',

		'.row .row a',

		// Common Drag Content.
		'.row .row img:not(p img):not(a img)',
		'.row .row p',
		'.row .row button:not(p button):not(a button)',

		// Lists.
		'.row .row ul',
		'.row .row ol',
		'.row .row dl',

		// Additional Content.
		'.row .row form',
		'.row .row table',
		'.row .row pre',

		// Nested Rows - Not rows nested out of master container.
		'.row .row .row',

		// Custom definitions.
		'.row .row [data-imhwpb-draggable="true"]',

		// WP specific wrapper.
		'.row .row .wpview-wrap',
		'.row .row .wpview',
		'.row .row code',
		'.row .row blockquote',
		'.row .row abbr'
	];

	/**
	 * These are the selectors that will interact with a row when dragging it.
	 */
	var immediate_row_siblings = [
		'> h1',
		'> h2',
		'> h3',
		'> h4',
		'> h5',
		'> h6',
		'> h7',
		'> a',
		'> img',
		'> p',
		'> button',
		'> ul',
		'> ol',
		'> dl',
		'> form',
		'> table',
		'> pre',
		'> .row',
		'> dl',
		'> form',
		'> table',
		'.row:not(.row .row)',
		'> [data-imhwpb-draggable="true"]',
		'> .wpview-wrap',
		'> .wpview',
		'> code',
		'> blockquote',
		'> abbr'
	];

	/**
	 * An outline of the sizes (Percentage) that corresponds to a column class.
	 *
	 * For example a col-2 should be .167% of the row size.
	 */
	this.column_sizes = {
		'0': 0,
		'1': 0.083,
		'2': 0.167,
		'3': 0.25,
		'4': 0.333,
		'5': 0.416,
		'6': 0.5,
		'7': 0.583,
		'8': 0.667,
		'9': 0.75,
		'10': 0.833,
		'11': 0.917,
		'12': 1,
		'13': 1.083
	};

	/**
	 * The drag type determines chooses between two drag methods Default -
	 * dragEnter. Drag enter will append/insert before when you drag into an
	 * element. Option 1 - proximity. Calculations are done every time the user
	 * moves their mouse (while dragging). The benefit if this that their mouse
	 * does not need to be in the drag destination to be placed their -
	 * dragEnter - proximity.
	 */
	this.dragTypeSetting = settings.dragType || 'dragEnter';

	/**
	 * Scenarios that outline how a specific layout should transform into another.
	 */
	this.layout_translation = {
		'[12]': {
			'12': '6', // All 12's should become this size.
			new: '6' // The new column should become this size.
		},
		'[6,6]': {
			'6': '4',
			new: '4'
		},
		'[4,4,4]': {
			'4': '3',
			new: '3'
		},

		// These transforms depend on a current column being passed in.
		// It's used in cases of duplication only.
		'[3,3,3,3]': {
			current: '3', // If the column that is being duplicated is a 3.
			current_transform: '2', // Change the duplicated column to a 2.
			new: '2', // Add a new column that is also a 2.

			// This array indicates how many additional items need to be transformed.
			// And what their previous values should be and what their new values should be.
			additional_transform: [

				// In this example, change 1, col-3 to a col-2.
				{
					count: '1',
					from: '3',
					to: '2'
				}
			]
		},
		'[6,3,3]': {
			current: '3',
			current_transform: '2',
			new: '2',
			additional_transform: [
				{
					count: '1',
					from: '3',
					to: '2'
				}
			]
		}
	};

	this.capitalizeFirstLetter = function( string ) {
		return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
	};

	/**
	 * Initialization Process.
	 */
	this.init = function() {
		// Init fourpan.
		self.fourpan( {
			element_padding: 0,
			transition_speed: 0,
			activate: activate_edit_as_row,
			deactivate: disable_edit_as_row
		} );

		self.ie_version = ieVersion();
		self.isSafari = self.checkIsSafari();
		self.create_selector_strings();
		save_original_selector_strings();
		self.bind_events();
		self.setup_additional_plugins();
		self.validate_markup();
		self.track_window_size();
		addContainerData();

		BG.RESIZE.Row.init( self );
		BG.Controls.init( self );
		BG.DRAG.Section.init( self );

		return self;
	};

	var addContainerData = function() {
		if ( ! BoldgridEditor.is_boldgrid_theme ) {
			self.find( 'html' ).addClass( 'non-bg-theme' );
		}
	};

	/**
	 * Store the original of the selector strings.
	 *
	 * If they get modified during the process of the editor processing,
	 * These should be used for validation.
	 */
	var save_original_selector_strings = function() {
		self.original_selector_strings = {
			general_content_selector_string: self.general_content_selector_string,
			unformatted_content_selectors_string: self.unformatted_content_selectors_string,
			content_selectors_string: self.content_selectors_string,
			immediate_row_siblings_string: self.immediate_row_siblings_string,
			row_selectors_string: self.row_selectors_string,
			column_selectors_string: self.column_selectors_string,
			unformatted_column_selectors_string: self.unformatted_column_selectors_string,
			general_column_selectors_string: self.general_column_selectors_string,
			immediate_column_selectors_string: self.immediate_column_selectors_string,
			draggable_selectors_string: self.draggable_selectors_string
		};
	};

	/**
	 * Create all selector strings from configuration arrays.
	 */
	this.create_selector_strings = function() {

		// An unformatted string simply specifies that the elements to not have the :visible qualifier.
		/**
		 * Content Selectors.
		 */
		self.general_content_selector_string = self.general_content_selectors.join();
		self.unformatted_content_selectors_string = self.content_selectors.join();
		self.content_selectors_string = self.format_selectors( self.content_selectors ).join();
		self.immediate_row_siblings_string = immediate_row_siblings.join();

		/**
		 * Row Selectors.
		 */
		self.row_selectors_string = self.row_selector.join();

		/**
		 * Column Selectors.
		 */
		// This should be the column selector string without the visible keyword but may not be working as intended.
		self.column_selectors_string = self.format_column_selectors( self.general_column_selectors, true ).join();
		self.unformatted_column_selectors_string = self.column_selectors_string.replace( /:visible/, '' );

		self.general_column_selectors_string = self.general_column_selectors.join();
		self.immediate_column_selectors_string = self
			.format_immediate_column_selectors( self.general_column_selectors )
			.join();

		/**
		 * Combination of all selectors.
		 */
		self.draggable_selectors_string = self.format_draggable_selectors_string();
	};

	/**
	 * Initialize the background colors of the window to facilitate editing.
	 *
	 * If being used within WP_TINYMCE this should really be done from the theme.
	 */
	this.set_background_colors = function() {

		// On init set the background colors.
		var background_color = self.$body.css( 'background-color' );

		// If the background color is transparent set the background color to white.
		if ( self.color_is( background_color, 'transparent' ) || self.color_is( background_color, 'white' ) ) {
			self.$body.css( 'background-color', 'white' );

			// If the background color is white and the color of the text is white,
			// set the text to black.
			if ( self.color_is( self.$body.css( 'color' ), 'white' ) ) {
				self.$body.css( 'color', 'black' );
			}
		}
	};

	/**
	 * Clean Up the markup and add any needed classes/wrappers.
	 */
	this.validate_markup = function() {

		// If the theme is a BG theme w/ variable containers feature, or the theme is not BG theme.
		if ( ! BoldgridEditor.is_boldgrid_theme || BG.Controls.hasThemeFeature( 'variable-containers' ) ) {
			BG.VALIDATION.Section.updateContent( self.$body );
			self.$validatedInput.attr( 'value', 1 );
			self.$validatedInput.val( 1 );
		}

		self.wrap_hr_tags();
		self.wrap_content_elements( self.$body );
		self.add_redundant_classes( self );
		BG.Service.sanitize.removeClasses( self );
	};

	/**
	 * Remove Classes that were added during drag.
	 *
	 * @since 1.1.1.3
	 */
	this.failSafeCleanup = function() {
		self.find( 'body .dragging-started-imhwpb' ).remove();
		self.find( '.cloned-div-imhwpb' ).removeClass( 'cloned-div-imhwpb' );
	};

	/**
	 * Wrap images and anchors in paragraph.
	 *
	 * This is done because tinyMCE frequently does this which causes irregularities
	 * also by doing this, we make it easier to drag items.
	 *
	 * @since jQuery $context
	 */
	this.wrap_content_elements = function( $context ) {

		// This needs to occur everytime something is added to page.
		$context.find( 'img, a' ).each( function() {

			// Find out its already draggable.
			var $this = $( this );

			if (
				! $this
					.parent()
					.closest_context(
						self.original_selector_strings.general_content_selector_string,
						$context
					).length
			) {
				// This HR is not already draggable.
				$this.wrap( '<p class=\'mod-reset\'></p>' );
			}
		} );
	};

	/**
	 * Wrap all hr tags in a draggable div This should be called everytime dom
	 * content is inserted.
	 */
	this.wrap_hr_tags = function() {

		// This needs to occur everytime something is added to page.
		self.find( 'hr' ).each( function() {

			// Find out its already draggable.
			var $this = $( this );

			if (
				! $this.closest_context(
					self.original_selector_strings.general_content_selector_string,
					self
				).length
			) {
				var $closest_receptor = $this.closest_context(
					self.original_selector_strings.row_selectors_string +
						', ' +
						self.original_selector_strings.general_column_selectors_string,
					self
				);
				if ( $closest_receptor.is( self.original_selector_strings.row_selectors_string ) ) {
					$this.wrap(
						'<div class=\'col-md-12\'><div class=\'row bg-editor-hr-wrap\'><div class=\'col-md-12\'></div></div></div>'
					);
				} else {

					// This HR is not already draggable.
					$this.wrap( '<div class=\'row bg-editor-hr-wrap\'><div class=\'col-md-12\'></div></div>' );
				}
			} else {
				$this.closest( '.row' ).addClass( 'bg-editor-hr-wrap' );
			}
		} );
	};

	/**
	 * Bind all events.
	 */
	this.bind_events = function() {
		// Bind Event Handlers to container.
		self.bind_drag_listeners();
		self.bind_container_events();
		self.bind_additional_menu_items();

		// This event should be bound to another mce event.
		setTimeout( function() {
			self.set_background_colors();
		}, 1000 );
	};

	var disable_edit_as_row = function() {
		if ( self.editting_as_row ) {

			// Restore Content Selectors.
			self.content_selectors = self.original_selectors.content;
			self.row_selector = self.original_selectors.row;

			self.create_selector_strings();

			self.off( '.draggable' );
			self.$body.off( '.draggable' );
			self.bind_events();

			$.fourpan.$recent_highlight.removeClass( 'current-edit-as-row' );
			self.editting_as_row = false;

			self.$html.removeClass( 'editing-as-row' );
			self.window_mouse_leave();
			self.trigger( 'edit-as-row-leave' );
		}
	};

	var activate_edit_as_row = function() {

		// Save Content Selectors.
		self.original_selectors = {};
		self.original_selectors.content = self.content_selectors;
		self.original_selectors.row = self.row_selector;

		self.content_selectors = nested_mode_content_selectors;
		self.row_selector = [ self.nested_row_selector_string ];

		self.create_selector_strings();

		self.off( '.draggable' );
		self.$body.off( '.draggable' );
		self.bind_events();

		self.find( '.current-edit-as-row' ).removeClass( 'current-edit-as-row' );
		$.fourpan.$recent_highlight.addClass( 'current-edit-as-row' );

		self.editting_as_row = $.fourpan.$recent_highlight;
		self.$html.addClass( 'editing-as-row' );
		self.trigger( 'edit-as-row-enter' );
		self.window_mouse_leave();
	};

	/**
	 * Unbinds the event namespace ".draggable". This is used when the user
	 * disables our plugin.
	 */
	this.unbind_all_events = function() {
		self.off( '.draggable' );
		self.$body.off( '.draggable' );
		self.off( '.draggable_mce' );
		self.$body.attr( 'style', '' );
	};

	/**
	 * Hide all popover menus.
	 */
	this.hide_menus = function( e ) {
		var $this,
			menu_clicked = false;

		if ( e && e.target ) {
			$this = $( e.target );
			if ( $this.closest( '.popover-menu-imhwpb' ).length ) {
				menu_clicked = true;
			} else if ( $this.closest( '.context-menu-imhwpb' ).siblings( '.popover-menu-imhwpb:visible' ).length ) {
				menu_clicked = true;
			}
		}

		if ( ! menu_clicked ) {
			var $popovers = self.find( '.popover-menu-imhwpb' );

			if ( $this ) {
				$popovers.not( $this.closest( '.popover-menu-imhwpb' ) ).addClass( 'hidden' );
			}
		}
	};

	/**
	 * Setup the Is Typing Plugin.
	 */
	this.setup_additional_plugins = function() {
		if ( $.fn.is_typing_boldgrid ) {
			self.is_typing_boldgrid();
		}
	};

	/**
	 * Bind all general events to the container.
	 */
	this.bind_container_events = function() {
		self
			.on( 'mousedown.draggable', '.drag-handle-imhwpb', self.drag_handle_mousedown )
			.on( 'mouseup.draggable', '.drag-handle-imhwpb', self.drag_handle_mouseup )
			.on( 'click.draggable', self.hide_menus )
			.on( 'click.draggable', self.failSafeCleanup )
			.on( 'boldgrid_modify_content.draggable', self.refresh_fourpan )
			.on( 'boldgrid_modify_content.draggable', () => BG.Service.event.emit( 'modifyContent' ) );

		self
			.on( 'mouseleave.draggable', self.window_mouse_leave )
			.on( 'mouseup.draggable', self.master_container_mouse_up )
			.on( 'mousemove.draggable', self.mousemove_container );

		self
			.on( 'start_typing_boldgrid.draggable', self.typing_events.start )
			.on( 'end_typing_boldgrid.draggable', self.typing_events.end );

		if ( 11 < self.ie_version || ! self.ie_version ) {
			self.on( self.resize_event_map, self.column_selectors_string );
		}
	};

	/**
	 * Initializes event binds for drop down menu clicks: for menu items passed
	 * in at initialization.
	 */
	this.bind_additional_menu_items = function() {
		$.each( self.additional_menu_items, function( key, menu_item ) {
			self.on(
				'click.draggable',
				'li[data-action="' + menu_item.title + '"]',
				menu_item.callback
			);
		} );
	};

	/**
	 * Sets up dragging for all elements defined.
	 */
	this.bind_drag_listeners = function() {
		self.$window.on( 'dragover.draggable', self.drag_handlers.over );

		self
			.on( 'dragstart.draggable', '.drag-handle-imhwpb, [data-action="nest-row"]', self.drag_handlers.start )
			.on( 'dragstart.draggable', 'img, a', self.drag_handlers.hide_tooltips )
			.on( 'drop.draggable', self.drag_handlers.drop )
			.on( 'dragend.draggable', self.drag_handlers.end )
			.on( 'dragleave.draggable', self.drag_handlers.leave_dragging )
			.on( 'dragenter.draggable', self.drag_handlers.record_drag_enter );
	};

	this.refresh_fourpan = function() {

		// If editing as row update the overlay.
		if ( self.editting_as_row ) {
			$.fourpan.refresh();
		}
	};

	/** * Start jQuery Helpers** */
	/**
	 * Reverses a collection.
	 */
	$.fn.reverse = [].reverse;

	/**
	 * Removes a popover.
	 */
	$.fn.remove_popover_imhwpb = function() {
		// $( this ).remove();
	};

	/**
	 * Checks if the passed element comes after the current element.
	 */
	$.fn.is_after = function( sel ) {
		return 0 !== this.prevAll().filter( sel ).length;
	};

	/**
	 * Checks if the passed element comes before the current element.
	 */
	$.fn.is_before = function( sel ) {
		return 0 !== this.nextAll().filter( sel ).length;
	};

	/**
	 * Closest Context.
	 */
	$.fn.closest_context = function( sel, context ) {
		var $closest;
		if ( this.is( sel ) ) {
			$closest = this;
		} else {
			$closest = this.parentsUntil( context )
				.filter( sel )
				.eq( 0 );
		}

		return $closest;
	};

	/** * End jQuery Helpers** */

	/**
	 * Finds all column selectors and add additional column classes.
	 */
	this.add_redundant_classes = function( $context ) {
		$context
			.find( self.original_selector_strings.general_column_selectors_string )
			.each( function() {
				var $current_element = $( this );
				$current_element.addClass( self.find_column_sizes( $current_element ) );
			} );
	};

	/**
	 * Each time the window changes sizes record the class that the user should
	 * be modifying.
	 */
	this.track_window_size = function() {
		self.active_resize_class = self.determine_class_sizes();
		self.$window.on( 'load resize', function() {
			setTimeout( function() {
				self.active_resize_class = self.determine_class_sizes();
			}, 300 );
		} );
	};

	/**
	 * Prevent default if exists.
	 */
	this.prevent_default = function( event ) {
		if ( event.preventDefault ) {
			event.preventDefault();
		}
	};

	/**
	 * Create a string that holds a list of comma separated draggable selectors.
	 */
	this.format_draggable_selectors_string = function() {
		var selectors = [];

		selectors.push( self.content_selectors_string );
		selectors.push( self.column_selectors_string );
		selectors.push( self.row_selectors_string );

		return selectors.join();
	};

	/**
	 * Create a string of the column selectors.
	 */
	this.format_immediate_column_selectors = function( selectors ) {
		var column_selectors = self.format_selectors( selectors ).slice();
		$.each( column_selectors, function( key, value ) {
			value = '> ' + value;
			column_selectors[key] = value;
		} );
		return column_selectors;
	};

	/**
	 * Finds all of the redundant classes for an element. Example: If a class
	 * currently has col-md-3 then it should have the classes col-sm-12 and
	 * col-xs-12 added to it.
	 */
	this.find_column_sizes = function( $column ) {
		var classes = $column.attr( 'class' );
		var added_classes = [];

		// Find the sizes for each type.
		var xs_size = classes.match( /col-xs-([\d]+)/i );
		var sm_size = classes.match( /col-sm-([\d]+)/i );
		var md_size = classes.match( /col-md-([\d]+)/i );

		// If an element does not have the class then add it.
		var design_size = 12;
		if ( ! xs_size ) {
			added_classes.push( 'col-xs-' + design_size );
		} else {
			design_size = xs_size[1];
		}

		if ( ! sm_size ) {
			added_classes.push( 'col-sm-' + design_size );
		} else {
			design_size = sm_size[1];
		}

		if ( ! md_size ) {
			added_classes.push( 'col-md-' + design_size );
		}

		return added_classes.join( ' ' );
	};

	/**
	 * Create a string of the column selectors.
	 */
	this.format_column_selectors = function( selectors, format_visibility ) {
		var column_selectors = selectors;
		if ( format_visibility ) {
			column_selectors = self.format_selectors( selectors ).slice();
		}

		$.each( column_selectors, function( key, value ) {
			value = self.row_selectors_string + ' > ' + value;
			column_selectors[key] = value;
		} );

		return column_selectors;
	};

	/**
	 * Appends :not(:hidden) to each element.
	 */
	this.format_selectors = function( selectors ) {
		var array_copy = selectors.slice();
		$.each( array_copy, function( key, value ) {
			value += ':visible';
			array_copy[key] = value;
		} );

		return array_copy;
	};

	/**
	 * Determines if a dragged element should be placed before or after the
	 * passed element. If we are placing an element within another element,
	 * before and after results in append or prepend.
	 */
	this.before_or_after_drop = function( $element, pos_obj ) {
		var drop_point,
			bounding_rect = $element.get( 0 ).getBoundingClientRect(),
			slope = -( bounding_rect.height / bounding_rect.width ),
			y_intercept = Math.floor( bounding_rect.bottom ) - slope * bounding_rect.left,
			position_y_on_slope = slope * pos_obj.x + y_intercept;

		if ( position_y_on_slope <= pos_obj.y ) {
			drop_point = 'after';
		} else {
			drop_point = 'before';
		}

		return drop_point;
	};

	/**
	 * Remove the class .receptor-containers-imhwpb.
	 */
	this.remove_receptor_containers = function() {
		self.find( '.receptor-containers-imhwpb' ).removeClass( 'receptor-containers-imhwpb' );
	};

	/**
	 * Once we finish dragging an element, we need to remove the hidden element.
	 */
	this.finish_dragging = function() {
		if ( self.$cloned_drag_image && self.$cloned_drag_image.remove ) {
			self.$cloned_drag_image.remove();
		}
		if ( self.$temp_insertion ) {
			self.$temp_insertion.removeClass( 'cloned-div-imhwpb' );
		}

		// Fail safe to remove all activated classes.
		self.find( self.dragging_selector ).removeClass( self.dragging_selector_class_name );

		self.valid_drag = false;
		self.remove_receptor_containers();

		// We have just modified the DOM.
		self.trigger( self.boldgrid_modify_event );
	};

	/**
	 * Check if 2 arrays are equal.
	 */
	this.array_equal = function( a, b ) {
		if ( a === b ) {
			return true;
		}

		if ( null == a || null == b ) {
			return false;
		}

		if ( a.length != b.length ) {
			return false;
		}

		for ( var i = 0; i < a.length; ++i ) {
			if ( a[i] !== b[i] ) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Reset the drag operation, deleting any temp data.
	 */
	this.drag_cleanup = function() {

		// This is just a failsafe, but performing this on IE causes resource spike.
		if ( ! self.ie_version ) {

			// Make sure that the transformed layout has the correct elements wrapped.
			self.validate_markup();
		}

		self.$current_drag.remove();
		self.placeholder.revertContent();
		self.finish_dragging();
		self.trigger( self.drag_end_event, self.$temp_insertion );
		BG.Service.event.emit( 'dragDrop', self.$temp_insertion );
		self.$current_drag = null;
		self.$temp_insertion.trigger( 'mouseenter' );
		self.removeClass( 'drag-progress' );
		clearInterval( self.scrollInterval );
	};

	/**
	 * This function defines the restrictions of the dragged item.
	 */
	this.determine_current_drag_properties = function() {
		var sibling = '';
		var parent = '';

		// Rows.
		if ( self.$current_drag.IMHWPB.is_row ) {
			sibling = self.row_selectors_string;

			// Columns can only be dragged into current row.
		} else if ( self.$current_drag.IMHWPB.is_column ) {
			parent = self.row_selectors_string;
			sibling = self.general_column_selectors_string;

			// Paragraphs, Images, Headings see (self.content_selectors_string).
		} else if ( self.$current_drag.IMHWPB.is_content ) {
			parent = self.column_selectors_string;
			sibling = self.content_selectors_string;
		}

		self.$current_drag.properties = {
			sibling: sibling, // The element can be be placed next to siblings.
			parent: parent

			// The element can be placed within a parent.
		};
	};

	/**
	 * Check if a value is between another 2 values.
	 */
	this.between = function( x, min, max ) {
		return x >= min && x <= max;
	};

	/**
	 * Delete popovers.
	 */
	this.delete_popovers = function() {
		self.find( 'body .draggable-tools-imhwpb' ).each( function() {
			var $element = $( this );
			var $element_next = $element.next();
			if ( $element_next.length ) {
				$element_next[0].popover = null;
			}

			// Wait for keypress events before removing element.
			setTimeout( function() {
				$element.remove();
			} );
		} );
	};

	/**
	 * Set classes to help position the menu depeneding on parent proximity to edge of screen.
	 *
	 * @since 1.2.10
	 * @param jQuery $currentPopover.
	 */
	this.setMenuPosition = function( $currentPopover ) {
		var popoverWidth,
			totalWidth,
			boundingClientRect = $currentPopover[0].getBoundingClientRect(),
			$sideMenu = $currentPopover.find( '.side-menu' ),
			htmlWidth = self.$html.width(),
			buffer = 100;

		if ( $sideMenu.length ) {
			$currentPopover.removeClass( 'side-menu-left menu-align-left' );

			// If side menu cant fit, point to left.
			popoverWidth = $currentPopover.find( '.popover-menu-imhwpb ul' ).width();
			totalWidth = boundingClientRect.right + $sideMenu.width();
			totalWidth = totalWidth + buffer;
			if ( totalWidth > self.$html.width() ) {
				$currentPopover.addClass( 'side-menu-left' );
			}

			// Context Menu cant fit align left.
			if ( popoverWidth + boundingClientRect.right > htmlWidth ) {
				$currentPopover.addClass( 'menu-align-left' );
			}
		}
	};

	/**
	 * Returns the type of the given element.
	 *
	 * @todo elimnate the use of this function when possible, consumes alot of resources on edge.
	 */
	this.get_element_type = function( $element ) {
		var type = '';

		if ( $element.is( self.content_selectors_string ) ) {
			type = 'content';
		} else if ( $element.is( self.row_selectors_string ) ) {
			type = 'row';
		} else if ( $element.is( self.column_selectors_string ) ) {
			type = 'column';
		}

		return type;
	};

	/**
	 * Return Row, Column, Content or nested-row.
	 */
	this.get_tooltip_type = function( $current ) {

		// Even though HR's are nested they should not appear as nested.
		if (
			$current.is( self.nested_row_selector_string ) &&
			0 == $current.find( '> .col-md-12 > hr:only-child' ).length &&
			! self.editting_as_row
		) {
			var type = 'nested-row';
		} else {
			var type = self.get_element_type( $current );
		}

		return type;
	};

	/**
	 * Shortcut to get all elements that are direct decendents of the body.
	 */
	this.get_top_level_elements = function() {
		return self.$body.find( '> *' ).not( '.draggable-tools-imhwpb' );
	};

	/**
	 * Formats a row into an array of stacks See this.find_column_stack for an
	 * explanation as to what a stack is.
	 */
	this.find_row_layout = function( $row ) {
		var layout = [];
		var stack = [];
		var stack_size = 0;
		$row.find( self.immediate_column_selectors_string ).each( function() {
			var column = {};
			var $column = $( this );
			var column_size = self.find_column_size( $column );
			if ( 12 >= column_size + stack_size ) {
				column.size = column_size;
				column.object = $column[0];
				stack.push( column );
				stack_size += column_size;
			} else {
				layout.push( stack );
				stack = [];
				column.size = stack_size = column_size;
				column.object = $column[0];
				stack.push( column );
			}
		} );

		if ( stack.length ) {
			layout.push( stack );
		}

		return layout;
	};

	/**
	 * Finds a layout stack A layout stack is a section of 12 columns, in a row.
	 * Example: If a row has 3 columns of widths: 12, 8 and 4. This row has 2 stacks.
	 * The first stack has 1 column and a width of 12. The second stack has 2
	 * columns a width of 8 and a width of 4.
	 */
	this.find_column_stack = function( $row, column ) {
		var stack = [];
		var index = null;
		var layout = self.find_row_layout( $row );
		$.each( layout, function( key, current_stack ) {
			$.each( current_stack, function( column_key, current_column ) {
				if ( column == current_column.object ) {
					stack = current_stack;
					index = key;
					return false;
				}
			} );
			if ( stack.length ) {
				return false;
			}
		} );

		return {
			stack: stack,
			stack_index: index
		};
	};

	/**
	 * Checks to see if the column passed in is an adjacent column.
	 *
	 * @return boolean
	 */
	this.check_adjacent_column = function( stack, sibling_column ) {
		var sibling_in_stack = false;

		if ( sibling_column && sibling_column.length ) {
			$.each( stack, function( key, current_column ) {
				if ( sibling_column[0] == current_column.object ) {
					sibling_in_stack = true;
					return false;
				}
			} );
		}

		return sibling_in_stack;
	};

	this.elementIsEmpty = function( $element ) {
		var isEmpty = $element.is( ':empty' ),
			minContentLength = 4;

		/*
		 * If not Empty
		 * 		and no images, icons, hr, or anchors found
		 * 		and content length less than limit,
		 * 		THIS IS EMPTYISH
		 */
		if ( ! isEmpty && ! $element.find( 'img, i, hr, a' ).length && $element.text().length < minContentLength ) {
			isEmpty = true;
		}

		return isEmpty;
	};

	this.getNewColumnString = function() {
		var string = 'col-md-1 col-sm-12 col-xs-12';
		switch ( self.active_resize_class ) {
			case 'col-sm':
				string = 'col-md-12 col-sm-1 col-xs-12';
				break;
			case 'col-xs':
				string = 'col-md-12 col-sm-12 col-xs-1';
				break;
		}

		return string;
	};

	/**
	 * Event that occurs when the user moves their mouse.
	 */
	this.mousemove_container = function( event ) {

		// Log All Mouse Movement.
		self.pageX = event.originalEvent.clientX;
		self.pageY = event.originalEvent.clientY;

		// If we are currently resizing run this process.
		if ( self.resize ) {
			if ( ! self.resize.triggered ) {
				self.trigger( self.resize_start_event );
				self.resize.triggered = true;
			}

			var smaller_position, larger_position, smaller_override, larger_override;

			var $row = self.resize.element.closest_context( self.row_selectors_string, self );

			if ( ! $row.length ) {
				return;
			}

			var row_width = $row[0].getBoundingClientRect().width;
			var column_size = self.find_column_size( self.resize.element );
			var siblingColumnSize = self.find_column_size( self.resize.sibling );
			var offset = self.resize.element[0].getBoundingClientRect();
			var row_size = self.find_row_size( $row );

			// Determine how much drag until next location.
			var current_column_size = self.column_sizes[column_size] * row_width;
			var offset_added = self.column_sizes[column_size + 1] * row_width;
			var offset_removed = self.column_sizes[column_size - 1] * row_width;

			// Figure out the position of the next smallest column size.
			if ( self.resize.left ) {
				smaller_position = offset_added - current_column_size + offset.left;
				larger_position = offset_removed - current_column_size + offset.left;
				smaller_override = self.pageX > smaller_position;
				larger_override = self.pageX < larger_position;
			} else {
				smaller_position = offset_removed - current_column_size + offset.right;
				larger_position = offset_added - current_column_size + offset.right;
				smaller_override = self.pageX < smaller_position;

				// If the users cursor is anywhere outside of the row + 10, make larger.
				larger_override =
					self.pageX > larger_position ||
					$row[0].getBoundingClientRect().right + self.right_resize_buffer < self.pageX;
			}

			var resize_buffer = row_width * self.resize_buffer;

			// Has the dragging made the current element smaller?
			var made_smaller =
				smaller_override ||
				self.between( smaller_position, self.pageX - resize_buffer, self.pageX + resize_buffer );

			// Has the dragging made the current element larger?
			var made_larger =
				larger_override ||
				self.between( larger_position, self.pageX - resize_buffer, self.pageX + resize_buffer );

			var valid_smaller = made_smaller && 1 < column_size,
				valid_larger = made_larger && column_size < self.max_row_size;

			// If Im Resizing from the left
			// and im making the item larger
			// and the row size is more than the max row size.
			// and this is the first element in the stack.
			// exit.
			if ( self.resize.left && valid_larger ) {
				var column_stack = self.find_column_stack( $row, self.resize.element[0] );
				if ( self.resize.element[0] == column_stack.stack[0].object ) {
					return false;
				}
			}

			/*
			 * If my column size is 1.
			 * - and your making me smaller.
			 * - delete me, switch to resize my sibling
			 */
			if ( 1 === column_size && made_smaller ) {
				if ( self.elementIsEmpty( self.resize.element ) ) {
					var $newSibiling,
						resizeElement = self.resize.element;

					self.resize.element.remove();
					self.change_column_size( self.resize.sibling );

					self.resize.element = self.resize.sibling;

					if ( self.resize.right ) {
						self.resize.left = self.resize.right;
						self.resize.element.addClass( 'resize-border-left-imhwpb' );
						self.resize.right = null;
						$newSibiling = self.resize.sibling.prev();
					} else {
						self.resize.right = self.resize.left;
						self.resize.element.addClass( 'resize-border-right-imhwpb' );
						self.resize.left = null;
						$newSibiling = self.resize.sibling.next();
					}

					self.resize.sibling = $newSibiling;
				}

				return false;
			}

			if ( valid_smaller || valid_larger ) {
				var column_stack = self.find_column_stack( $row, self.resize.element[0] );

				// If your resizing from the left and this is the first item in the stack.
				if ( self.resize.left && self.resize.element[0] == column_stack.stack[0].object && made_smaller ) {
					if ( 12 >= row_size ) {
						self.change_column_size( self.resize.element, false );
						self.resize.sibling = $( '<div>' ).addClass( self.getNewColumnString() );
						self.resize.sibling.addClass( 'content-border-imhwpb' );
						self.resize.element.before( self.resize.sibling );
						return false;
					} else {
						return false;
					}
				}

				/*
				 * If my column size is 1.
				 * - and your making me smaller.
				 * - delete me.
				 */
				if ( made_larger && 1 == siblingColumnSize ) {
					if ( self.elementIsEmpty( self.resize.sibling ) ) {
						var method = 'next';
						if ( self.resize.left ) {
							method = 'prev';
						}

						var $next = self.resize.sibling[method]();
						self.resize.sibling.remove();
						self.resize.sibling = $next;
						self.change_column_size( self.resize.element );
					}

					return false;
				}

				// If your resizing from the right
				//	and the row has 12
				//  and your making it larger
				//  and this is a descktop view.
				// And this is the last column in the row.
				var last_col_in_row =
					column_stack.stack[column_stack.stack.length - 1].object == self.resize.element[0];
				if (
					self.resize.right &&
					12 == row_size &&
					valid_larger &&
					'col-md' == self.active_resize_class &&
					last_col_in_row
				) {
					return false;
				}

				// If my resizing from the right
				// And im making myself smaller.
				// And Im the last item in the stack.
				// Add a column.
				if ( 12 >= row_size && self.resize.right && last_col_in_row && made_smaller ) {
					self.change_column_size( self.resize.element, false );
					self.resize.sibling = $( '<div>' ).addClass( self.getNewColumnString() );
					$row.append( self.resize.sibling );
					return false;
				}

				var sibling_in_stack = self.check_adjacent_column( column_stack.stack, self.resize.sibling );
			}

			if ( valid_smaller ) {
				self.change_column_size( self.resize.element, false );

				if ( self.resize.sibling && self.resize.sibling.length ) {
					if ( siblingColumnSize < self.max_row_size && sibling_in_stack ) {
						self.change_column_size( self.resize.sibling );
					}
				}

				var new_column_stack = self.find_column_stack( $row, self.resize.element[0] );

				if ( column_stack.stack_index != new_column_stack.stack_index ) {
					self.end_resize();
				}
			} else if ( valid_larger ) {
				if ( ! self.resize.sibling || ( self.resize.sibling.length && 1 == siblingColumnSize ) ) {
					return;
				}

				self.change_column_size( self.resize.element );
				if ( sibling_in_stack ) {
					self.change_column_size( self.resize.sibling, false );
				}

				var new_column_stack = self.find_column_stack( $row, self.resize.element[0] );

				if ( column_stack.stack_index != new_column_stack.stack_index ) {
					self.end_resize();
				}
			}
		}
	};

	/**
	 * Method to be called when the resize process has completed.
	 */
	this.end_resize = function() {
		self.resize = false;

		self.$html.removeClass( 'no-select-imhwpb' );
		BG.Service.sanitize.removeClasses( self );
		self.removeClass( 'resizing-imhwpb cursor-not-allowed-imhwpb' );

		self.trigger( self.resize_finish_event );
	};

	/**
	 * Events to trigger when the users mouse leaves the window.
	 */
	this.window_mouse_leave = function() {
		if ( self.resize ) {
			self.end_resize();
		}

		BG.Service.sanitize.removeClasses( self, 'resize' );

		self.hover_elements = {
			content: null,
			column: null,
			row: null
		};
	};

	/**
	 * When the user presses down on the drag handle Add borders to the
	 * locations that the user can drop the items.
	 */
	this.drag_handle_mousedown = function( event ) {
		self.valid_drag = true;
		self.$current_clicked_element = BOLDGRID.EDITOR.Service.popover.selection.$target;

		if ( self.$current_clicked_element.is( 'a' ) && self.$current_clicked_element.find( 'img, button' ).length ) {
			self.$current_clicked_element
				.find( 'img, button' )
				.first()
				.addClass( 'dragging-imhwpb' );
		} else {
			self.$current_clicked_element.addClass( 'dragging-imhwpb' );
		}

		// Add borders for the possible target selections of the current element.
		if ( self.$current_clicked_element.is( self.content_selectors_string ) ) {
			self.find( self.column_selectors_string ).addClass( 'receptor-containers-imhwpb' );
		} else if ( self.$current_clicked_element.is( self.row_selectors_string ) ) {
			self.find( self.row_selectors_string ).addClass( 'receptor-containers-imhwpb' );
		} else if ( self.$current_clicked_element.is( self.column_selectors_string ) ) {
			self.find( self.column_selectors_string ).addClass( 'receptor-containers-imhwpb' );

			self.find( self.row_selectors_string ).addClass( 'receptor-containers-imhwpb' );
		}
	};

	/**
	 * Handles the event of a mouse up on the drag handle.
	 */
	this.drag_handle_mouseup = function() {
		self.remove_receptor_containers();
		self.valid_drag = false;
	};

	/**
	 * Handles the mouse up on the main container.
	 */
	this.master_container_mouse_up = function( event, element ) {
		if ( self.resize ) {
			self.end_resize();
		}

		if ( self.$current_clicked_element ) {
			self.$current_clicked_element.removeClass( 'dragging-imhwpb' );
		}
	};

	/**
	 * Decrease row size by 1.
	 */
	this.decrease_row_size = function( $row ) {
		var row_decreased = false;
		$row
			.find( self.immediate_column_selectors_string )
			.reverse()
			.each( function() {
				var $current_element = $( this );
				if ( 2 <= self.find_column_size( $current_element ) ) {
					self.change_column_size( $current_element, false );
					row_decreased = true;
					return false;
				}
			} );

		return row_decreased;
	};

	/**
	 * Find the location of the border on an column.
	 */
	this.get_border_mouse_location = function( $element, x_position ) {
		var right_of_column,
			left_of_column,
			bounding_rectangle = $element[0].getBoundingClientRect(),
			left_position = Math.floor( bounding_rectangle.left ),
			right_position = Math.floor( bounding_rectangle.right );

		right_of_column = self.between( x_position, right_position - self.border_hover_buffer, right_position );
		left_of_column = self.between( x_position, left_position, left_position + self.border_hover_buffer );

		return {
			left: left_of_column,
			right: right_of_column
		};
	};

	/**
	 * Given a set of key value pairs, and a row. Change the sizes in the row to
	 * the sizes in the transform.
	 */
	this.transform_layout = function( $row, layout_transform ) {
		$.each( layout_transform, function( current_value, transform_value ) {
			$row.find( self.immediate_column_selectors_string ).each( function() {
				var $column = $( this );
				if ( current_value == self.find_column_size( $column ) ) {
					self.change_column_size( $column, null, transform_value );
				}
			} );
		} );
	};

	/**
	 * Given an array of sizes, returns the an object with the previous rows
	 * values and the size it translates to.
	 */
	this.find_layout_transform = function( layout_format, current_column_size ) {
		var translation_key = JSON.stringify( layout_format );
		var transform = self.layout_translation[translation_key];

		// If this override is requires a current column to be passed and it
		// does not match
		// Unset the transform
		if (
			'undefined' != typeof current_column_size &&
			'undefined' != typeof transform &&
			'undefined' != typeof transform.current &&
			transform.current != current_column_size
		) {
			transform = null;
		} else if (
			'undefined' == typeof current_column_size &&
			'undefined' != typeof transform &&
			transform.current
		) {
			transform = null;
		}

		return transform;
	};

	/**
	 * Given a row, return an array of its sizes.
	 */
	this.get_layout_format = function( $row ) {
		var layout_format = [];
		$row.find( self.immediate_column_selectors_string ).each( function() {
			layout_format.push( self.find_column_size( $( this ) ) );
		} );

		return layout_format;
	};

	/**
	 * Change the size of a column to the passed in value or increments/decrements.
	 */
	this.change_column_size = function( $column_element, increment, value_override ) {
		if ( ! $column_element.length ) {
			return;
		}

		var regex = new RegExp( self.active_resize_class + '-[\\d]+', 'i' );
		$.each( $column_element.attr( 'class' ).split( ' ' ), function( key, class_name ) {
			if ( class_name.match( regex ) ) {
				var column_size = parseInt( class_name.replace( /\D/g, '' ) );

				if ( value_override ) {
					column_size = value_override;
				} else if ( false === increment ) {
					column_size--;
				} else {
					column_size++;
				}

				var new_class_name = class_name.replace( /\d+/g, column_size );
				var new_class_string = $column_element.attr( 'class' ).replace( class_name, new_class_name );

				$column_element.attr( 'class', new_class_string );

				return false;
			}
		} );

		// We have just modified the DOM.
		self.trigger( self.boldgrid_modify_event );
	};

	/**
	 * Return the column size of a column.
	 */
	this.find_column_size = function( $column_element ) {
		var regex,
			matches,
			column_size = 0;

		if ( ! $column_element || ! $column_element.length ) {
			return column_size;
		}

		regex = new RegExp( self.active_resize_class + '-([\\d]+)', 'i' );
		matches = $column_element.attr( 'class' ).match( regex );

		if ( matches ) {
			column_size = matches[1];
		}

		return parseInt( column_size );
	};

	/**
	 * Sums all column sizes in a row.
	 */
	this.find_row_size = function( $row ) {
		var total_size = 0;

		$row
			.find( self.immediate_column_selectors_string )
			.not( '.dragging-imhwpb' )
			.each( function() {
				total_size += self.find_column_size( $( this ) );
			} );

		return total_size;
	};

	/**
	 * Based on the window size, return the column type that is being used.
	 */
	this.determine_class_sizes = function() {
		var column_type;
		var width = self.width();

		if ( 1061 < width ) {
			column_type = 'col-md';
		} else if ( 837 < width ) {
			column_type = 'col-sm';
		} else {
			column_type = 'col-xs';
		}

		return column_type;
	};

	/**
	 * Check if a color word is the same a some of the common definitions for these color.
	 * Definitions are defined in self.color_alias.
	 */
	this.color_is = function( color_returned, color ) {
		return -1 !== self.color_alias[color].indexOf( color_returned );
	};

	/**
	 * Logic used for adding a maximum height.
	 * If the height of the element if >= 200,
	 * 		then max_height * 1.25,
	 * Else
	 * 		max_height = 250.
	 */
	var add_max_height_styles = function( $element, cur_height ) {
		if ( 200 <= cur_height ) {
			var max_height = cur_height * 1.25;
		} else {
			var max_height = 250;
		}
		$element.css( {
			'max-height': max_height + 'px',
			overflow: 'hidden'
		} );
	};

	/**
	 * Add Max heights to rows if dragging a column.
	 * Add Max Heights to content if dragging content.
	 */
	this.add_max_heights = function() {
		if ( 'column' == self.$current_drag.IMHWPB.type ) {
			self.find( self.row_selectors_string ).each( function() {
				var $this = $( this );
				var row_size = self.find_row_size( $this );
				if ( 12 >= row_size ) {
					var outer_height = $this.outerHeight();
					add_max_height_styles( $this, outer_height );
				}
			} );
		} else if ( 'content' == self.$current_drag.IMHWPB.type ) {
			add_max_height_styles( self.$temp_insertion, self.$current_drag.IMHWPB.height );
		}
	};

	/**
	 * Remove the list of styles that we add for max heights.
	 */
	var remove_max_height_styles = function( $element ) {
		$element.css( {
			'max-height': '',
			overflow: ''
		} );
	};

	/**
	 * We've added max heights to rows and content elements while dragging.
	 * Remove them so that the editor is WYSIWYG after drag is finished.
	 */
	this.remove_max_heights = function() {
		if ( 'column' == self.$current_drag.IMHWPB.type ) {
			remove_max_height_styles( self.find( self.row_selectors_string ) );
		} else if ( 'content' == self.$current_drag.IMHWPB.type ) {
			remove_max_height_styles( self.$temp_insertion );
		}
	};

	this.get_other_top_level_elements = function() {
		return self.$body.find( self.immediate_row_siblings_string ).not( self.$current_drag );
	};

	/**
	 * Find max and min y cord used for dragging rows.
	 */
	this.find_page_min_max = function() {
		var min_max = {};
		if ( self.$current_drag.IMHWPB.is_row ) {
			var $other_top_level_elements = self.get_other_top_level_elements();

			var $first = $other_top_level_elements.eq( 0 );
			var $last = $other_top_level_elements.last();

			min_max = {
				offset_top: $first[0].getBoundingClientRect().top,
				offset_bottom: $last[0].getBoundingClientRect().top + $last.outerHeight( true )
			};
		}

		return min_max;
	};

	/**
	 * Find boundries of a column when dragging within a row in the locked setting.
	 */
	this.find_row_min_max = function() {
		var min_max = {};
		if ( self.$current_drag.IMHWPB.is_column ) {
			var $row = self.$current_drag.closest( '.row' );
			var row = $row.get( 0 );

			var client_rect = row.getBoundingClientRect();
			min_max = {
				offset_left: client_rect.left,
				offset_right: client_rect.left + $row.outerWidth( true ),
				offset_top: Math.max( 0, client_rect.top - self.columnUnlockThreshold ),
				offset_bottom: client_rect.top + $row.outerHeight( true )
			};
		}

		return min_max;
	};

	/**
	 * Find the the points of each top level element at which a dragged element
	 * should be placed before or after.
	 *
	 * This is used everytime the location of an element changes during dragging a row as well
	 * as the start of a row drag.
	 *
	 * Instead of doing the math everytime the over event triggers, do this only when needed
	 * This allows us to use a simple comparison operator later.
	 */
	this.find_top_level_positions = function() {
		var positions = [];
		if ( self.$current_drag.IMHWPB.is_row ) {
			var $other_top_level_elements = self.get_other_top_level_elements();

			$other_top_level_elements.each( function() {
				var $this = $( this );
				var height = $this.outerHeight( true );

				positions.push( {
					max: this.getBoundingClientRect().top + height,
					element: $this
				} );
			} );
		}

		return positions;
	};

	/**
	 * When dragging columns, use this to find the right x point of each element.
	 */
	this.find_column_sibling_positions = function() {
		var positions = [];
		if ( self.$current_drag.IMHWPB.is_column ) {
			self.$current_drag.siblings( self.general_column_selectors_string ).each( function() {
				var $this = $( this );
				var width = $this.outerWidth( true );
				var bounding_rect = this.getBoundingClientRect();

				positions.push( {
					max: bounding_rect.left + width,
					element: $this
				} );
			} );
		}
		return positions;
	};

	/**
	 * Set the current drag properties for a column. These are needed for drag over DnD.
	 */
	this.recalc_col_pos = function() {

		// Recalc pos of all top level elements.
		self.$current_drag.IMHWPB.col_pos = self.find_column_sibling_positions();
		self.$current_drag.IMHWPB.row_min_max = self.find_row_min_max();
	};

	/**
	 * Set the current drag properties for a column. These are needed for drag over DnD.
	 */
	this.recalc_row_pos = function() {

		// Recalc pos of all top level elements.
		self.$current_drag.IMHWPB.row_pos = self.find_top_level_positions();
		self.$current_drag.IMHWPB.row_min_max = self.find_page_min_max();
	};

	/**
	 * This function is used to drag colummns.
	 */
	this.reposition_column = function( page_x, page_y ) {
		if ( self.$current_drag.IMHWPB.is_column && false == self.$current_drag.IMHWPB.unlock_column ) {
			if (
				self.$current_drag.IMHWPB.row_min_max.offset_top > page_y ||
				self.$current_drag.IMHWPB.row_min_max.offset_bottom < page_y
			) {
				self.$current_drag.IMHWPB.unlock_column = true;
				var $row = self.entered_target.closest( self.row_selectors_string );
				if ( $row.length ) {
					self.move_column_to( self.entered_target ); // Dom mod event triggered in here.
				}

				return;
			}

			// If the element is outside of the row to the left and the temp insertion is not the first column,
			// insert this column as the first column.
			if ( page_x < self.$current_drag.IMHWPB.row_min_max.offset_left ) {
				var $first_elem = self.$current_drag
					.closest( self.row_selectors_string )
					.find( self.immediate_column_selectors_string )
					.not( self.$current_drag )
					.eq( 0 );

				if ( $first_elem.get( 0 ) != self.$temp_insertion[0] ) {
					$first_elem.before( self.$temp_insertion );
					self.recalc_col_pos();

					// We have just modified the DOM.
					self.trigger( self.boldgrid_modify_event );
				}
				return;

				// If the element is outside of the row to the right and the temp insertion is not the last column,
				// insert this column as the last column.
			} else if ( page_x > self.$current_drag.IMHWPB.row_min_max.offset_right ) {
				var $last_elem = self.$current_drag
					.closest( self.row_selectors_string )
					.find( self.immediate_column_selectors_string )
					.not( self.$current_drag )
					.last();

				if ( $last_elem.get( 0 ) != self.$temp_insertion[0] ) {
					$last_elem.after( self.$temp_insertion );
					self.recalc_col_pos();

					// We have just modified the DOM.
					self.trigger( self.boldgrid_modify_event );
				}

				return;
			}

			// Check each column end point position.
			$.each( self.$current_drag.IMHWPB.col_pos, function() {
				if ( page_x < this.max ) {
					if ( most_recent_enter[0] == this.element[0] ) {
						return false;
					}
					most_recent_enter = this.element;

					// Insert Before if not already there.
					if (
						this.element
							.nextAll()
							.not( self.$current_drag )
							.filter( self.$temp_insertion ).length
					) {
						this.element.before( self.$temp_insertion );

						// If the element is before me but not immediatly before me, insert immediatly before me.
					} else if (
						this.element
							.prevAll( self.general_column_selectors_string )
							.not( self.$current_drag )
							.get( 0 ) != self.$temp_insertion[0]
					) {
						this.element.before( self.$temp_insertion );
					} else {
						this.element.after( self.$temp_insertion );
					}

					// We have just modified the DOM.
					self.trigger( self.boldgrid_modify_event );

					self.recalc_col_pos();

					return false;
				}
			} );
		}
	};

	this.fill_row = function( row_size, $row ) {
		var $new_column;

		if ( row_size < self.max_row_size ) {
			$new_column = $(
				'<div class="col-md-' + ( self.max_row_size - row_size ) + ' col-sm-12 col-xs-12"></div>'
			);
			$row.append( $new_column );
		}

		return $new_column;
	};

	this.setInheritedBg = function( $element, timeout ) {

		// Set the background color to its parents bg color.
		if ( self.color_is( $element.css( 'background-color' ), 'transparent' ) ) {
			$element.parents().each( function() {
				var $this = $( this ),
					bgColor = $this.css( 'background-color' );

				if ( ! self.color_is( bgColor, 'transparent' ) ) {
					$element.css( 'background-color', bgColor );
					return false;
				}
			} );
		}
		setTimeout( function() {

			//If the background is still transparent, set to white
			if ( self.color_is( $element.css( 'background-color' ), 'transparent' ) ) {
				$element.css( {
					'background-color': 'white',
					color: '#333'
				} );
			}
		}, timeout || 100 );
	};

	/**
	 * This object contains all the event handlers used for DND (Drag and Drop).
	 */
	this.drag_handlers = {

		/**
		 * Hide all tooltips while dragging.
		 */
		hide_tooltips: function() {
			if ( ! self.$current_drag ) {
				setTimeout( function() {
					self.$body.find( '.draggable-tools-imhwpb' ).addClass( 'hidden' );
				}, 100 );
			}
		},

		/**
		 * Handle the drop event of a draggable.
		 */
		drop: function( event ) {
			if ( self.$current_drag ) {
				self.prevent_default( event );

				/**
				 * IE Fix Dragend does not fire occasionally, but drag drop does
				 * make sure that the drag end function is always called.
				 */
				self.drag_handlers.end( event );
				self.drag_drop_triggered = true;
			}
		},

		/**
		 * This event is triggered at each drag conclusion. We remove the dragged
		 * image and remove classes as needed Standard cleanup procedures must
		 * ensue.
		 */
		end: function( event ) {
			if ( self.drag_drop_triggered ) {
				return;
			}
			if ( ! self.$current_drag ) {
				return;
			}

			self.restore_row = null;
			self.$most_recent_row_enter_add = null;
			self.remove_max_heights();

			self.drag_cleanup();

			return true;
		},

		/**
		 * When the Dragging begins We we set a drag image, hide the current
		 * drag image, and set some initial drag properties.
		 */
		start: function( event ) {
			var $new_column, $row, row_size;

			self.valid_drag = true;
			self.drag_drop_triggered = false;
			var $this = $( this );

			self.$current_drag = BG.Service.popover.selection.getWrapTarget();
			self.$current_drag.addClass( 'dragging-imhwpb' );
			self.addClass( 'drag-progress' );

			if ( self.$current_drag.parent( 'a' ).length ) {
				self.original_html = self.$current_drag.parent( 'a' )[0].outerHTML;
			} else {
				self.original_html = self.$current_drag[0].outerHTML;
			}

			// These settings help reduce cpu resource usage, storing some properties of the
			// drag start so that they wont be retrieved again.
			self.$current_drag.IMHWPB = {
				is_column: 'column' === BG.Service.popover.selection.name,
				is_row: 'row' === BG.Service.popover.selection.name,
				is_content: 'content' === BG.Service.popover.selection.name,
				height: self.$current_drag.outerHeight(),
				width: self.$current_drag.outerWidth(),
				dragStarted: true
			};

			// Save the column size at drag start so that it wont be recalculated
			if ( self.$current_drag.IMHWPB.is_row && $this.hasClass( 'action-list' ) ) {
				self.$current_drag.IMHWPB.is_row = false;
				self.$current_drag.IMHWPB.is_content = true;
			}

			if ( self.$current_drag.IMHWPB.is_column ) {
				self.$current_drag.IMHWPB.column_size = self.find_column_size( self.$current_drag );

				var $current_row = self.$current_drag.closest_context(
					self.row_selectors_string,
					self
				);
				if ( $current_row.length ) {
					self.$current_drag.IMHWPB.original_row = $current_row[0];
				}
			}

			self.determine_current_drag_properties();

			// Set the dragging content.
			// For IE this must be set to "text" all lower case.
			event.originalEvent.dataTransfer.setData( 'text', '' );
			event.originalEvent.dataTransfer.dropEffect = 'copy';

			self.$temp_insertion = $( self.original_html );
			self.$temp_insertion.removeClass( 'dragging-imhwpb popover-hover' );
			self.$temp_insertion.addClass( 'cloned-div-imhwpb' );

			self.placeholder = new Placeholder( self.$current_drag, self.$temp_insertion );
			self.placeholder.setContent();

			// Set Dragging Image.
			// Add the inline-style so that its not modified by content changed.
			self.$current_drag
				.css( {
					height: self.$current_drag.IMHWPB.height,
					width: self.$current_drag.IMHWPB.width
				} )
				.addClass( 'hidden dragging-started-imhwpb' );

			self.$current_drag.attr( 'data-mce-bogus', 'all' );

			self.setInheritedBg( self.$current_drag );

			// Setting Drag Image is not allowed in IE, and fails on safari.
			if ( ! event.skipDragImage && 'undefined' != typeof event.originalEvent.dataTransfer.setDragImage && ! self.isSafari ) {

				// Turn off Drag Image.
				var img = document.createElement( 'img' );
				img.src = '';
				event.originalEvent.dataTransfer.setDragImage( img, 0, 0 );
			}

			// Since we arent creating on proximity we will need to create this right away.
			self.$current_drag.before( self.$temp_insertion );

			// Set an additional value of type for quick index lookups
			if ( self.$current_drag.IMHWPB.is_column ) {
				self.$current_drag.IMHWPB.type = 'column';
				self.recalc_col_pos();

				$row = self.$current_drag.closest( '.row' );
				row_size = self.find_row_size( $row );

				if ( row_size < self.max_row_size ) {
					self.fill_row( row_size, $row );
				}

				// If the row has not stacked with columns, allow the rail dragging && desktop view.
				if (
					12 >= row_size &&
					'col-md' == self.active_resize_class &&
					self.$current_drag.siblings( self.unformatted_column_selectors_string ).not( self.$temp_insertion )
						.length

					//	&& !self.editting_as_row
				) {
					self.$current_drag.IMHWPB.unlock_column = false;
				} else {
					self.$current_drag.IMHWPB.unlock_column = true;
				}
			} else if ( self.$current_drag.IMHWPB.is_row ) {
				self.$current_drag.IMHWPB.type = 'row';
				self.recalc_row_pos();
			} else {
				self.$current_drag.IMHWPB.type = 'content';
			}

			// Set max height to rows and content.
			self.add_max_heights();

			// This timeout is needed so that there isnt a flsh on the screen in chrome/ie.
			// You cannot modify the drag object in this event.
			var timeout_length = 100;
			if ( self.ie_version ) {
				timeout_length = 150;
			}

			setTimeout( function() {
				self.$current_drag.removeClass( 'hidden' );
				self.trigger( self.drag_start_event );
				self.find( '.resizing-imhwpb' ).removeClass( 'resizing-imhwpb' );
			}, timeout_length );

			self.drag_handlers.initSmoothScroll();
		},

		over: function( event ) {
			if ( ! self.$current_drag || ! self.valid_drag ) {
				return;
			}

			// Prevent Default is required for IE compatibility.
			// Otherwise you'll exp a intermitent drag end.
			event.preventDefault();

			// Handles Auto Scrolling
			// Only trigger every 10 microseconds
			if ( ! self.last_auto_scroll_event || self.last_auto_scroll_event + 10 <= new Date().getTime() ) {
				self.last_auto_scroll_event = new Date().getTime();

				/**
				 * HANDLE ROW DRAGGING.
				 * This is important.
				 * This was moved to "over" on 10/14/15.
				 */
				if ( self.$current_drag.IMHWPB.dragStarted ) {
					if ( BG.Controls.$container.$current_drag.IMHWPB.is_row ) {
						BG.DRAG.Row.dragCursorPosition( event.originalEvent.pageY );
					}
					self.reposition_column( event.originalEvent.pageX, event.originalEvent.pageY );
				}

				// Don't auto scroll when modifying a nested row.
				if ( self.$html.hasClass( 'editing-as-row' ) ) {
					return;
				}

				self.drag_handlers.autoScroll( event );
			}
		},

		initSmoothScroll: function() {

			// Delay in milliseconds.
			var y = 1;

			// Init Y-axis pixel displacement.
			self.autoScrollSpeed = false;

			self.scrollInterval = setInterval( function() {
				if ( ! self.autoScrollSpeed ) {
					return;
				}

				window.scrollBy( 0, self.autoScrollSpeed );
			}, y );
		},

		/**
		 * Automatically Scroll Down the screen as the user drags.
		 *
		 * @since 1.3
		 */
		autoScroll: function( event ) {
			var isFixedTop = 'fixed' === self.$mce_32.css( 'position' ),
				topOffset = self.$mce_32[0].getBoundingClientRect(),
				positionY = event.originalEvent.screenY;

			/*
			 * On dual monitor setups where the height of the window is much larger than the
			 * main window, skip auto scroll. Unable to get consistent results. -100 window height is
			 * used to identify this scenario.
			 */
			if ( -100 > window.screenY ) {
				return;
			}

			// 150: Is the range within the mce bar you must reach before scrolling up starts.
			if ( positionY < topOffset.bottom + 150 && isFixedTop ) {
				self.autoScrollSpeed = -1;

				// 100: Is the range within the bottom bar you must get to before scrolling down starts.
			} else if ( positionY > window.innerHeight - 100 ) {
				self.autoScrollSpeed = 1;
			} else {
				self.autoScrollSpeed = false;
			}
		},

		/**
		 * This function is responsible for all of the animation that the user
		 * sees as their cursor moves across the screen. It needs some cleanup
		 * to remove some duplicate code Its currently separated into three
		 * different types of dragging elements for ease of development. Theres
		 * a section for content, column, and row.
		 */
		leave_dragging: function( event ) {
			if ( ! self.$current_drag ) {
				return;
			}

			// Prevent Default here causes an issue on IE.
			if ( ! self.ie_version ) {
				event.preventDefault();
			}

			var $left = $( event.target ),
				$entered = self.entered_target;

			// Prevent Multiple Events from being triggered at an X and Y location.
			if ( self.prevent_duplicate_location_events( event ) || ! self.$current_drag ) {
				return false;
			}

			// Skip if dragging over same element.
			if ( self.$temp_insertion[0] == $entered[0] ) {
				self.$most_recent_row_enter_add = null;
				return true;
			}

			// If you are dragging outside of the master container, skip this event.
			// This check is done later for content.
			if (
				false == self.has( $entered ).length &&
				false == self.$current_drag.IMHWPB.is_content
			) {
				return true;
			}

			if ( self.$current_drag.IMHWPB.is_row ) {
				BG.DRAG.Row.dragEnter( $entered );
			} else if ( self.$current_drag.IMHWPB.is_content ) {
				ContentDragging( event, $left, $entered );
			} else if ( self.$current_drag.IMHWPB.is_column && self.$current_drag.IMHWPB.unlock_column ) {
				ColumnDragging( event, $left, $entered );
			}
		},

		/**
		 * When the user drag enters into any element, store the element that
		 * was entered. This is needed because on chrome and safari, there is a
		 * bug that causes the relatedTarget that should be attached to the
		 * event object in the drag entered to be missing. To circumvent this
		 * issue all events where bound to the drag leave and I've recorded the
		 * drag enter with this function. This way we have the record of both
		 * the drag leave and the drag enter.
		 */
		record_drag_enter: function( event ) {
			if ( ! self.$current_drag ) {
				return;
			}

			// Prevent Default here causes an issue on IE.
			if ( ! self.ie_version ) {
				event.preventDefault();
			}

			self.entered_target = $( event.target );
		}
	};

	/**
	 * Determine if current browser is safari.
	 *
	 * Thanks To: http://stackoverflow.com/questions/7944460/detect-safari-browser.
	 *
	 * @since 1.1.1.3
	 *
	 * @return boolean.
	 */
	this.checkIsSafari = function() {
		return /^((?!chrome|android).)*safari/i.test( navigator.userAgent );
	};

	/**
	 * Move the column the passed element.
	 */
	this.move_column_to = function( $entered ) {
		var current_drag_is_sibling = $entered.is( self.unformatted_column_selectors_string );
		var current_drag_is_parent = $entered.is( self.$current_drag.properties.parent );

		// Calculate Row Size.
		var $new_row = $entered.closest_context( self.row_selectors_string, self );
		var $current_row = self.$temp_insertion.closest_context( self.row_selectors_string, self );

		var row_size = self.find_row_size( $new_row );
		if ( $new_row.length && $current_row[0] != $new_row[0] ) {
			if ( current_drag_is_parent && row_size >= self.max_row_size ) {
				return false;
			}

			// If your dragging into a row that is not the original row,
			// Restore the state of the previous row, and store the
			// state of the new row.
			/** An IE FIX * */
			/**
			 * Temp insertion is deleted when row is replaced on IE
			 * only*
			 */
			var temp_insertion = self.$temp_insertion[0].innerHTML;
			if ( self.restore_row ) {

				// Restore.
				$current_row.html( self.restore_row );
				self.$temp_insertion.html( temp_insertion );
			}

			var dragging_out_of_original = self.$current_drag.IMHWPB['original_row'] != $new_row[0];

			// Store current row only if its not the original row. That row will not be restored.
			if ( dragging_out_of_original ) {
				self.restore_row = $new_row.html();
			} else {
				self.restore_row = null;
			}

			// IF the row has enough room for your current drag item,
			// just place the item.
			var row_has_room = row_size + self.$current_drag.IMHWPB['column_size'] <= self.max_row_size;
			if ( false == row_has_room && dragging_out_of_original ) {

				// Use the rest of the space if row is partially empty.
				var remaining_row_space = self.max_row_size - row_size;
				var column_size = null;
				var max_capacity = 9;
				if ( 0 < remaining_row_space ) {

					// Row already has enough room for column, do not transform.
					column_size = remaining_row_space;
				} else if ( $new_row.find( self.immediate_column_selectors_string ).length <= max_capacity ) {

					// The new column will be a one, make room
					// Transform the row to allow for the size of the
					// row. (Reduce row by 3).
					column_size = 3;

					if ( self.$current_drag.IMHWPB['column_size'] < column_size ) {
						column_size = self.$current_drag.IMHWPB['column_size'];
					}

					for ( var i = 0; i < column_size; i++ ) {
						self.decrease_row_size( $new_row );
					}
				}

				if ( column_size ) {

					// Set the column Size.
					self.change_column_size( self.$temp_insertion, null, column_size );
				} else {

					// The row does not have room for the column.
					self.restore_row = null;
					return true;
				}
			} else {

				// Set the column Size.
				self.change_column_size( self.$temp_insertion, null, self.$current_drag.IMHWPB['column_size'] );
			}

			if ( current_drag_is_sibling ) {
				$entered.before( self.$temp_insertion );
			} else {
				$new_row.append( self.$temp_insertion );
			}
			self.record_recent_column_insertion();
		} else if ( current_drag_is_sibling ) {

			// If dragging into new row.
			if ( $entered.is_before( self.$temp_insertion ) ) {
				$entered.before( self.$temp_insertion );
			} else {
				$entered.after( self.$temp_insertion );
			}
			self.record_recent_column_insertion();
		}
	};

	/**
	 * Set the time at which a column was inserted Record the columns insertion.
	 */
	this.record_recent_column_insertion = function() {
		self.recent_event = {};
		self.insertion_time = new Date().getTime();
		self.trigger( self.boldgrid_modify_event );
	};

	/**
	 * Check to see if a recent drag event was triggered at the location
	 * Prevents an event from occuring at teh same location as an event that
	 * just occured.
	 */
	this.prevent_duplicate_location_events = function( event ) {
		var current_drag_loc = [ event.originalEvent.pageX, event.originalEvent.pageY ];

		var prevent;

		// Filter Duplicate Events.
		if ( self.array_equal( self.current_drag_enter_event_loc, current_drag_loc ) ) {
			prevent = true;
		} else {
			self.current_drag_enter_event_loc = current_drag_loc;
			prevent = false;
		}
		return prevent;
	};

	this.createEmptyRow = function() {
		return $( '<div class="row"><div class="col-md-12"></div></div>' );
	};

	this.postAddRow = function( $empty_row ) {

		// The following line was leaving garbage in undo history.
		//$empty_row.addClass( 'added-element' );
		setTimeout( function() {
			self.find( '.added-element' ).removeClass( 'added-element' );
		}, 1000 );

		self.trigger( self.add_row_event, $empty_row.find( '.col-md-12' ) );
	};

	/**
	 * Handle the user typing.
	 */
	this.typing_events = {
		start: function() {
			BG.Service.event.emit( 'startTyping' );
			self.find( 'html' ).addClass( 'boldgrid-is-typing' );
		},
		end: function() {
			BG.Service.event.emit( 'endTyping' );
			self.validate_markup();
			self.find( 'html' ).removeClass( 'boldgrid-is-typing' );
		}
	};

	/**
	 * Event that resize the width of a column.
	 */
	this.resize_event_map = {

		/**
		 * This event is active while the user is moving their mouse with 'mouseup'.
		 */
		'mousemove.draggable': function( event, $element ) {
			if ( ! self.resize ) {
				var position_x = self.pageX,
					border_hover = false;
				if ( 'undefined' != typeof event && null != event ) {
					position_x = event.originalEvent.clientX;
					$element = $( this );
					border_hover = self.get_border_mouse_location( $element, position_x );
				}
				if ( border_hover && ( border_hover.left || border_hover.right ) ) {
					$element.addClass( 'resizing-imhwpb' );

					if ( self.ie_version && tinymce ) {
						BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', false );
						BOLDGRID.EDITOR.mce.boldgridResize = true;
					}
				} else {
					$element.removeClass( 'resizing-imhwpb' );

					if ( self.ie_version && tinymce ) {
						BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', true );
						BOLDGRID.EDITOR.mce.boldgridResize = false;
					}
				}
			}

			// If for some reason drag is still active, remove it.
			if ( self.$current_drag ) {

				// This was causing issues on firefox drag elements.
				//	self.drag_handlers.end( event );
			}
		},

		/**
		 * The event is activates the resize process.
		 */
		'mousedown.draggable': function( event ) {

			// If they user clicked on drag handle, return
			let $target = $( event.target );
			if ( $target.closest( '.draggable-tools-imhwpb' ).length ) {
				return;
			}

			var $element = $( this );
			var border_hover = self.get_border_mouse_location( $element, event.originalEvent.clientX );
			var $sibling = null;

			if ( border_hover.left ) {
				$sibling = $element.prevAll( self.column_selectors_string ).first();

				// Add borders before and after
				$element.addClass( 'resize-border-left-imhwpb' );
			} else if ( border_hover.right ) {
				$sibling = $element.nextAll( self.column_selectors_string ).first();

				// Add borders before and after
				$element.addClass( 'resize-border-right-imhwpb' );
			}

			if ( border_hover.left || border_hover.right ) {
				if ( $sibling.length ) {
					$sibling.addClass( 'content-border-imhwpb' );
				}

				$element.addClass( 'content-border-imhwpb' );
				self.addClass( 'resizing-imhwpb' );
				self.find( '.resizing-imhwpb' ).removeClass( 'resizing-imhwpb' );

				self.$html.addClass( 'no-select-imhwpb' );
				self.trigger( 'resize_clicked' );

				self.resize = {
					element: $element,
					sibling: $sibling,
					left: border_hover.left,
					right: border_hover.right
				};
			}
		}
	};

	return this;
};
