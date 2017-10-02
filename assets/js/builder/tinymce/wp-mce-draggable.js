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

	this.$loading = $( '.bg-editor-loading-main' );

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

	// Failsafe.
	setTimeout( function() {
		self.$loading.removeClass( 'active' );
	}, 3000 );

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
						dragImage: 'actual',
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

		tinymce.activeEditor.controlManager.setActive( 'toggle_draggable_imhwpb', true );
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
		tinymce.activeEditor.selection.setCursorLocation( self.draggable_instance.$boldgrid_menu_action_clicked, 0 );

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
	 * When the user clicks on a button, set the cursor location inside the button
	 */
	this.set_button_cursor = function( e ) {
		if ( e.clientX ) {
			var this_button = $( this );
			var buttons = self.draggable_instance.$master_container
				.find( 'button:not([data-mce-bogus])' )
				.not( this_button );
			self.replace_all_buttons( buttons );
			tinymce.activeEditor.selection.setCursorLocation( this, 1 );
		}
	};

	/**
	 * Refresh the buttons on the page, this is done so that they arent left with a
	 */
	this.replace_all_buttons = function( buttons ) {
		buttons.each( function() {
			var html = this.outerHTML;
			$( this ).replaceWith( html );
		} );
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
			.on( 'delete_dwpb.draggable_mce', self.delete_element )
			.on( 'drag_end_dwpb.draggable_mce', self.drag_end_event )
			.on( 'add_row_event_dwpb.draggable_mce', self.set_cursor )
			.on( 'boldgrid_edit_row.draggable_mce', self.edit_row )
			.on( 'click.draggable_mce', 'button:not([data-mce-bogus])', self.set_button_cursor )
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
	this.delete_element = function() {
		self.add_tiny_mce_history();
	};

	/**
	 * Drag Start Event
	 */
	this.drag_start = function() {
		tinymce.activeEditor.getBody().setAttribute( 'contenteditable', false );
		tinyMCE.activeEditor.selection.collapse( false );
		self.end_undo_level_mce();
		self.draggable_instance.$master_container.find( 'html' ).addClass( 'drag-progress' );
	};

	/**
	 * When the user starts selecting add the class to the html tag of the document so that we
	 * can hide the popovers.
	 */
	this.text_select_start = function() {
		self.draggable_instance.$master_container.find( 'html' ).addClass( 'selecting' );
	};

	/**
	 * After the selection process is done remove the class.
	 */
	this.text_select_end = function() {
		self.draggable_instance.$master_container.find( 'html' ).removeClass( 'selecting' );
	};

	/**
	 * Put the cursor in the passed element
	 */
	this.set_cursor = function( event, $new_element ) {
		tinymce.activeEditor.selection.setCursorLocation( $new_element, 0 );
	};

	/**
	 * Prevent the edit
	 */
	this.prevent_edit = function() {
		tinyMCE.activeEditor.selection.collapse( false );
		if ( ! self.draggable_instance.ie_version ) {
			tinymce.activeEditor.getBody().setAttribute( 'contenteditable', false );
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
		tinymce.activeEditor.getBody().setAttribute( 'contenteditable', true );
		IMHWPB.tinymce_undo_disabled = false;
		self.add_tiny_mce_history();
		self.initialize_gallery_objects( self.draggable_instance.$master_container );
		self.draggable_instance.$master_container.find( 'html' ).removeClass( 'drag-progress' );

		//Set the cursor into the recently dropped element
		if ( tinymce && tinymce.activeEditor.selection && dropped_element ) {
			tinymce.activeEditor.selection.setCursorLocation( dropped_element, 0 );
		}
	};

	/**
	 * Procedure that occurs when resizing a column is done
	 */
	this.column_resize_done = function() {
		var $temp;

		if ( ! self.draggable_instance.ie_version ) {

			// Blur the editor, allows FF to focus on click and add caret back in.
			tinymce.activeEditor.getBody().blur();

			//This action use to add an undo level, but it appears as if contenteditable, is doing that for us.
			tinymce.activeEditor.getBody().setAttribute( 'contenteditable', true );

			// Stops tinymce from scorlling to top.
			var $temp = $( '<a>temp</a>' );
			$( tinyMCE.activeEditor.getBody() ).append( $temp );
			tinymce.activeEditor.selection.setCursorLocation( $temp[0], 0 );
			$temp.focus();
			$temp.remove();
		}

		$window.trigger( 'resize' );
	};

	/**
	 * Procedure that occurs when adding a column is complete
	 */
	this.add_column_done = function( event, $added_element ) {
		self.add_tiny_mce_history();
		self.initialize_gallery_objects( self.draggable_instance.$master_container );
		tinymce.activeEditor.selection.setCursorLocation( $added_element, 0 );
	};

	/**
	 * Add undo level to tinymce
	 */
	this.add_tiny_mce_history = function() {
		tinymce.activeEditor.execCommand( 'mceAddUndoLevel' );
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
			tinyMCE.activeEditor.selection.select( tinyMCE.activeEditor.getBody(), true );
			tinyMCE.activeEditor.selection.collapse( false );
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
		$( tinymce.activeEditor.iframeElement )
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
		self.$loading.removeClass( 'active' );
	};

	this.updateResizingIframe = function() {
		if ( BG.Service.editorWidth.resizable ) {

			/**
			 * Set the temporary hidden iframe to the same width as the editor.
			 * Then find the post width on the front end iframe and set the
			 * editor to the same width.
			 */
			BG.Service.editorWidth.$resizeiframe.attr( 'width', self.$tinymceHTML.width() );
			self.tinymce_body_container.css( 'width', BG.Service.editorWidth.$postContainer.width() );
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
			self.$post_body.addClass( 'columns-1' ).removeClass( 'columns-2' );
		} else {
			self.$post_body.addClass( 'columns-2' ).removeClass( 'columns-1' );
		}
	};

	/**
	 * Highlight Current Device
	 */
	this.update_device_highlighting = function() {
		if ( self.$mce_iframe && ! self.draggable_inactive ) {
			var iframe_width = self.$mce_iframe.width();
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
			tinymce.activeEditor.selection.setCursorLocation( $p[0], 0 );
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
		self.$post_body = $( '#post-body' );
		self.$editor_content_container = $( '#poststuff' );
		self.$overlay_preview = $( '#boldgrid-overlay-preview' );
		self.$resize_div = $( '#resizable' );

		self.$mce_iframe = $( tinymce.activeEditor.iframeElement );
		self.tinymce_body_container = self.$mce_iframe.contents().find( 'body' );
		self.$tinymceHTML = self.$mce_iframe.contents().find( 'html' );

		self.bind_column_switch();
		self.bind_window_resize();
		self.bind_collapse_click();
		self.bind_min_max_controls();
		self.create_resize_handle();
		self.$window.trigger( 'resize' );
	} );
};