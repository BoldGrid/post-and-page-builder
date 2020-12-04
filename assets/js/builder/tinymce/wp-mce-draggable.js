var BG = BOLDGRID.EDITOR;

window.IMHWPB = IMHWPB || {};

/**
 * IMHWPB.WP_MCE_Draggable Responsible for interfacing with tinymce and the draggable class.
 */
IMHWPB.WP_MCE_Draggable = function() {
	var self = this;
	var $ = jQuery;
	var additional_classes;

	/**
	 * Resize Handle Selector
	 */
	this.resize_selector = '.mce-resizehandle';

	/**
	 * An instance of the Draggable class
	 */
	this.draggable_instance = false;

	/**
	 * The Main Window
	 */
	var $window = $( window );

	this.draggable_inactive = false;

	this.last_resize = null;

	this.phone_width_needed = 620; //480 + 300;
	this.tablet_width_needed = 1250; //890 + 300;
	this.desktop_width_needed = 1270; //1100 + 300;

	var menu_items = [];

	this.bind_window_resize = function() {
		let resizeProcess = _.debounce( self.resize_done_event, 300 );
		$window.on( 'resize', resizeProcess );
	};

	this.highlight_screen_size = function( type ) {
		self.remove_icon_highlights();
		$( '.mce-boldgrid-' + type ).addClass( 'boldgrid-highlighted-mce-icon' );
	};

	this.remove_icon_highlights = function() {
		$( '.mce-displaysize-imhwpb' ).removeClass( 'boldgrid-highlighted-mce-icon' );
	};

	/**
	 * PreInitialization BoldGrid Event
	 */
	var pre_init = $.Event( 'BoldGridPreInit' );

	/**
	 * Initiate the BoldGrid Dragging for the tinymce window
	 */
	this.load_draggable = function( $container ) {
		if ( false == self.draggable_instance ) {

			// Run all function that should run before draggable is initialized
			$( document ).trigger( pre_init, this );

			IMHWPB.WP_MCE_Draggable.draggable_instance = $container
				.IMHWPB_Draggable(
					{
						add_media_event_handler: self.add_media_action,
						insert_layout_event_handler: self.insert_layout_action,
						menu_items: menu_items,
						main_container: true
					},
					$
				)
				.init();

			self.draggable_instance = IMHWPB.WP_MCE_Draggable.draggable_instance;
		}

		self.bind_events();
	};

	/**
	 * The event that should happen when the user selects add media from a
	 * dropdown
	 */
	this.add_media_action = function() {
		self.insert_from_media_modal_tab( 'insert' );
	};

	/**
	 * Insert content from the media modal tab to the editor
	 */
	this.insert_from_media_modal_tab = function( tab_slug ) {
		BOLDGRID.EDITOR.mce.selection.setCursorLocation( self.draggable_instance.$boldgrid_menu_action_clicked, 0 );

		wp.media.editor.open();
		wp.media.frame.setState( tab_slug );
	};

	/**
	 * The event that should happen when the user selects add layout from a
	 * dropdown
	 */
	this.insert_layout_action = function() {
		BG.CONTROLS.Section.enableSectionDrag();
	};

	/**
	 * Bind actions to the common events
	 */
	this.bind_events = function() {
		self.draggable_instance.$master_container
			.on( 'mousedown.draggable_mce', '.draggable-tools-imhwpb', self.boldgrid_tool_click )
			.on( 'mouseup.draggable_mce', '.draggable-tools-imhwpb', self.boldgrid_tool_click )
			.on( 'add_column_dwpb.draggable_mce', self.add_column_done )
			.on( 'drag_start_dwpb.draggable_mce', self.drag_start )
			.on( 'delete_dwpb.draggable_mce', self.add_history )
			.on( 'boldgrid_clone_element', self.add_history )
			.on( 'drag_end_dwpb.draggable_mce', self.drag_end_event )
			.on( 'add_row_event_dwpb.draggable_mce', self.set_cursor )
			.on( 'boldgrid_edit_row.draggable_mce', self.edit_row )
			.on( 'click.draggable_mce', 'a', function( e ) {
				e.preventDefault();
			} )
			.on( 'resize_start_dwpb.draggable_mce', self.prevent_edit )
			.on( 'resize_done_dwpb.draggable_mce', self.column_resize_done );

		//Selection Event
		self.draggable_instance.$master_container.textSelect( self.text_select_start, self.text_select_end );
	};

	/**
	 * Delete element
	 */
	this.add_history = function() {
		self.add_tiny_mce_history();
	};

	/**
	 * Drag Start Event
	 */
	this.drag_start = function() {
		BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', false );
		BOLDGRID.EDITOR.mce.selection.collapse( false );

		self.end_undo_level_mce();
		self.draggable_instance.$master_container.find( 'html' ).addClass( 'drag-progress' );
	};

	/**
	 * When the user starts selecting add the class to the html tag of the document so that we
	 * can hide the popovers.
	 */
	this.text_select_start = function() {
		self.draggable_instance.$master_container.find( 'html' ).addClass( 'selecting' );
		self.draggable_instance.$master_container.trigger( 'text_select_start' );
	};

	/**
	 * After the selection process is done remove the class.
	 */
	this.text_select_end = function() {
		self.draggable_instance.$master_container.find( 'html' ).removeClass( 'selecting' );
		self.draggable_instance.$master_container.trigger( 'text_select_end' );
	};

	/**
	 * Put the cursor in the passed element
	 */
	this.set_cursor = function( event, $new_element ) {
		BOLDGRID.EDITOR.mce.selection.setCursorLocation( $new_element, 0 );
	};

	/**
	 * Prevent the edit
	 */
	this.prevent_edit = function() {
		BOLDGRID.EDITOR.mce.selection.collapse( false );
		if ( ! self.draggable_instance.ie_version ) {
			BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', false );
		}
	};

	/**
	 * Pausing the creation of undo levels This helps when dragging an element.
	 * Without this we will have multiple entries in the undo levels
	 */
	this.end_undo_level_mce = function() {
		IMHWPB.tinymce_undo_disabled = true;
	};

	/**
	 * Procedure that when dragging is complete
	 */
	this.drag_end_event = function( event, dropped_element ) {
		BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', true );
		BOLDGRID.EDITOR.mce.selection.setCursorLocation( null );

		IMHWPB.tinymce_undo_disabled = false;
		self.add_tiny_mce_history();
		self.initialize_gallery_objects( self.draggable_instance.$master_container );
		self.draggable_instance.$master_container.find( 'html' ).removeClass( 'drag-progress' );

		//Set the cursor into the recently dropped element
		if ( tinymce && BOLDGRID.EDITOR.mce.selection && dropped_element ) {
			BOLDGRID.EDITOR.mce.selection.setCursorLocation( dropped_element, 0 );
		}
	};

	/**
	 * Procedure that occurs when resizing a column is done
	 */
	this.column_resize_done = function() {
		var $temp;

		if ( ! self.draggable_instance.ie_version ) {

			// Blur the editor, allows FF to focus on click and add caret back in.
			BOLDGRID.EDITOR.mce.getBody().blur();

			/*
			 * This action use to add an undo level, but it appears as if contenteditable,
			 * This doing that for us.
			 */
			BOLDGRID.EDITOR.mce.getBody().setAttribute( 'contenteditable', true );
			BOLDGRID.EDITOR.mce.selection.setCursorLocation( null );
		}

		$window.trigger( 'resize' );
	};

	/**
	 * Procedure that occurs when adding a column is complete
	 */
	this.add_column_done = function( event, $added_element ) {
		self.add_tiny_mce_history();
		self.initialize_gallery_objects( self.draggable_instance.$master_container );
		BOLDGRID.EDITOR.mce.selection.setCursorLocation( $added_element, 0 );
	};

	/**
	 * Add undo level to tinymce
	 */
	this.add_tiny_mce_history = function() {
		BOLDGRID.EDITOR.mce.undoManager.add();
	};

	/**
	 * Setup the tinymce gallery objects
	 */
	this.initialize_gallery_objects = function( $container ) {
		if ( 'undefined' != typeof IMHWPBGallery && 'undefined' != typeof IMHWPBGallery.init_gallery ) {
			$container.find( '.masonry' ).removeClass( 'masonry' );
			IMHWPBGallery.init_gallery( $container );
		}
	};

	/**
	 * Procedure that should occur when a user clicks on a boldgrid handle
	 */
	this.boldgrid_tool_click = function() {
		self.remove_mce_resize_handles();

		if ( ! self.draggable_instance.ie_version ) {
			BOLDGRID.EDITOR.mce.selection.select( BOLDGRID.EDITOR.mce.getBody(), true );
			BOLDGRID.EDITOR.mce.selection.collapse( false );
		}
	};

	/**
	 * Deslect a tinymce image
	 */
	this.remove_mce_resize_handles = function() {
		self.draggable_instance.$master_container.find( '[data-mce-selected]' ).removeAttr( 'data-mce-selected' );
		self.draggable_instance.$master_container.find( '.mce-resizehandle' ).remove();
		$( '.mce-wp-image-toolbar' ).hide();
		self.draggable_instance.$master_container.find( self.resize_selector ).hide();
	};

	this.addDeactivateClasses = function() {
		$( 'html' ).addClass( 'draggable-inactive' );
		$( BOLDGRID.EDITOR.mce.iframeElement )
			.contents()
			.find( 'html' )
			.addClass( 'draggable-inactive' );
	};

	/**
	 * Event to fire once the user resizes their window
	 */
	this.resize_done_event = function() {
		self.updateScreenLayout();
		self.updateResizingIframe();

		//Highlight the current display type
		self.update_device_highlighting();
		self.$window.trigger( 'resize.boldgrid-gallery' );

		BG.Service.event.emit( 'mceResize' );
	};

	this.updateResizingIframe = function() {
		if ( BG.Service.editorWidth.resizable ) {

			/**
			 * Set the temporary hidden iframe to the same width as the editor.
			 * Then find the post width on the front end iframe and set the
			 * editor to the same width.
			 */
			BG.Service.editorWidth.$resizeiframe.attr( 'width', BG.Controls.$container.$html.width() );
			BG.Controls.$container.$body.css( 'width', BG.Service.editorWidth.getWidth() );
		}
	};

	this.updateScreenLayout = function() {

		// No Display Type Selected.
		if ( ! IMHWPB.Editor.instance.currently_selected_size ) {
			if ( 1470 < window.innerWidth ) {
				all_elements_visible();
			} else if ( 1355 < window.innerWidth ) {
				collapse_sidebar();
			} else if ( 1041 < window.innerWidth ) {
				min_visible();
			} else if ( 1040 >= window.innerWidth ) {
				self.set_num_columns( 2 );
			}

			// Monitor type Selected.
		} else if ( 'monitor' == IMHWPB.Editor.instance.currently_selected_size ) {
			if ( 1470 < window.innerWidth ) {
				all_elements_visible();
			} else if ( 1355 < window.innerWidth ) {
				collapse_sidebar();
			} else {
				min_visible();
			}

			// Tablet type Selected.
		} else if ( 'tablet' == IMHWPB.Editor.instance.currently_selected_size ) {
			if ( 1250 < window.innerWidth ) {
				all_elements_visible();
			} else if ( 1134 < window.innerWidth ) {
				collapse_sidebar();
			} else {
				min_visible();
			}

			// Phone type Selected.
		} else if ( 'phone' == IMHWPB.Editor.instance.currently_selected_size ) {
			all_elements_visible();
		}
	};

	/**
	 * Layout arrangement for Large displays
	 */
	var all_elements_visible = function() {
		self.set_num_columns( 2 );
		self.$body.removeClass( 'folded' );
		self.$window.trigger( 'scroll' );
	};

	/**
	 * Layout arrangement for Medium displays
	 */
	var collapse_sidebar = function() {
		self.set_num_columns( 2 );
		self.$body.addClass( 'folded' );
		self.$window.trigger( 'scroll' );
	};

	/**
	 * Layout arrangement for Small displays
	 */
	var min_visible = function() {
		self.set_num_columns( 1 );
		self.$body.addClass( 'folded' );
		self.$window.trigger( 'scroll' );
	};

	/**
	 * Set the number of columns for the page
	 */
	this.set_num_columns = function( columns ) {
		if ( 1 == columns ) {
			$( '#post-body' ).addClass( 'columns-1' ).removeClass( 'columns-2' );
		} else {
			$( '#post-body' ).addClass( 'columns-2' ).removeClass( 'columns-1' );
		}
	};

	/**
	 * Highlight Current Device
	 */
	this.update_device_highlighting = function() {
		if ( BG.Controls.$container.$iframe && ! self.draggable_inactive ) {
			var iframe_width = BG.Controls.$container.$iframe.width();
			if ( 1061 < iframe_width ) {
				self.highlight_screen_size( 'desktop' );
			} else if ( 837 < iframe_width ) {
				self.highlight_screen_size( 'tablet' );
			} else {
				self.highlight_screen_size( 'phone' );
			}
		}
	};

	/**
	 * What should happen when the user clicks on the collapse menu?
	 * This fires after wordpresses action on the button
	 */
	this.bind_collapse_click = function() {
		$( '#collapse-menu' ).on( 'click', function() {
			if ( ! IMHWPB.Editor.instance.currently_selected_size ) {
				if ( 1355 < window.innerWidth && 1470 > window.innerWidth ) {
					if ( self.$body.hasClass( 'folded' ) ) {
						self.set_num_columns( 2 );
						self.$window.trigger( 'scroll' );
					} else {
						self.set_num_columns( 1 );
						self.$window.trigger( 'scroll' );
					}
				}
			}
			self.update_device_highlighting();
		} );
	};

	this.bind_column_switch = function() {
		$( '[name="screen_columns"]' ).on( 'click', function() {
			self.update_device_highlighting();
		} );
	};

	/**
	 * Add a menu item to boldgrid menus
	 */
	this.add_menu_item = function( title, element_type, callback ) {
		menu_items.push( {
			title: title,
			element_type: element_type,
			callback: callback
		} );
	};

	/**
	 * Action that occurs when the user clicks edit as row inside the editor.
	 */
	this.edit_row = function( event, nested_row ) {
		var $p = $( nested_row ).find( 'p, a' );
		if ( $p.length ) {
			BOLDGRID.EDITOR.mce.selection.setCursorLocation( $p[0], 0 );
		}
	};

	/**
	 * Bind the controls that set the size of the overlay
	 */
	this.bind_min_max_controls = function() {
		var $maximize_row_button = $( '#max-row-overlay' );
		var $min_row_button = $( '#min-row-overlay' );
		$maximize_row_button.on( 'click', function() {
			self.$resize_div.animate(
				{
					height: '1000px'
				},
				1000
			);
		} );

		$min_row_button.on( 'click', function() {
			self.$resize_div.animate(
				{
					height: '0px'
				},
				1000
			);
		} );
	};

	/**
	 * Setup the controls for resizing the edit row overlay
	 */
	this.create_resize_handle = function() {
		var $temp_overlay = $( '.temp-overlay' );
		self.$resize_div
			.resizable( {
				handles: {
					n: $( '.resizable-n' )
				},
				start: function( event, ui ) {
					$temp_overlay.addClass( 'active' );
				},
				stop: function( event, ui ) {
					$temp_overlay.removeClass( 'active' );
				}
			} )
			.bind( 'resize', function( e, ui ) {
				$( this ).css( 'top', 'auto' );
			} )
			.removeClass( 'ui-resizable' );
	};

	$( function() {
		self.$window = $( window );
		self.$body = $( 'body' );
		self.$editor_content_container = $( '#poststuff' );
		self.$overlay_preview = $( '#boldgrid-overlay-preview' );
		self.$resize_div = $( '#resizable' );

		self.bind_column_switch();
		self.bind_window_resize();
		self.bind_collapse_click();
		self.bind_min_max_controls();
		self.create_resize_handle();
		self.$window.trigger( 'resize' );
	} );
};
