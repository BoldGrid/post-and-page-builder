var IMHWPB = IMHWPB || {};
window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
var BG = BOLDGRID.EDITOR;

/**
 * IMHWPB.Editor
 * Class responsible for interfacing between WordPress and tinyMCE
 * DO NOT AUTOFORMAT
 */
IMHWPB.Editor = function( $ ) {
	var self = this;

	//Have we bound the media open event yet?
	this.media_default_bound = false;

	/**
	 * The Main Window
	 */
	var $window = $( window );

	//Init common selectors that will be retrieved from the draggable class once initialized
	this.row_selector_string = '';
	this.content_selector_string = '';
	this.column_selector_string = '';
	this.currently_selected_size = null;

	/**
	 * Select alignment from media modal
	 */
	this.select_alignment = function() {
		var $current_selection = $( tinymce.activeEditor.selection.getNode() );
		var $alignment_sidebar = $( '.attachments-browser select.alignment' );
		var $alignment_sidebar_linkto = $( '.attachments-browser select.link-to' );

		//Bind the media open event
		if ( false == self.media_default_bound ) {
			self.media_default_bound = true;
			wp.media.frame.on( 'open', self.select_alignment );
		}

		if ( $current_selection.is( 'img' ) ) {
			var classes = $current_selection.attr( 'class' );
			var current_classes = [];
			if ( classes ) {
				current_classes = $current_selection.attr( 'class' ).split( /\s+/ );
			}

			var value_selection = 'none';
			$.each( current_classes, function( index, class_item ) {
				if ( 'aligncenter' == class_item ) {
					value_selection = 'center';
					return false;
				} else if ( 'alignnone' == class_item ) {
					value_selection = 'none';
					return false;
				} else if ( 'alignright' == class_item ) {
					value_selection = 'right';
					return false;
				} else if ( 'alignleft' == class_item ) {
					value_selection = 'left';
					return false;
				}
			} );

			//Choose default link
			var default_link_setting = null;
			var $wrapped_link = $current_selection.parent( 'a' );
			if ( ! $wrapped_link.length ) {
				default_link_setting = 'none';
			}

			if ( $alignment_sidebar_linkto.length && default_link_setting ) {
				$alignment_sidebar_linkto.val( default_link_setting ).change();
			}

			if ( $alignment_sidebar.length ) {
				$alignment_sidebar.val( value_selection ).change();
			}
		}
	};

	/**
	 * When the user clicks on attachments in the media modal, auto select the same alignment
	 * that their current image has
	 */
	this.select_default_alignment = function() {
		$( document ).on( 'click', '.attachments-browser .attachment', self.select_alignment );
	};

	/**
	 * Get the draggable object that has been insantiated
	 */
	this.draggable = function() {
		var draggable = null;
		if ( IMHWPB.WP_MCE_Draggable && IMHWPB.WP_MCE_Draggable.instance ) {
			draggable = IMHWPB.WP_MCE_Draggable.instance.draggable_instance;
		}

		return draggable;
	};

	/**
	 * Carry over the height width and classes of the images when replacing images with images
	 */
	this.override_insert_media = function() {
		var original_send_to_editor = send_to_editor;
		send_to_editor = function( attachments ) {
			var args = [];

			//If we are replacing an image with an image
			if ( ! attachments.match( /^\[.+?\]/ ) ) {
				var $current_selection = $( tinymce.activeEditor.selection.getContent() );
				var $inserting_content = $( attachments );
				var inserting_media_image =
					$inserting_content.is( 'img' ) ||
					( $inserting_content.is( 'a' ) && $inserting_content.find( '*' ).is( 'img' ) );
			}

			//Only do this rewrite if inserting 1 image
			if (
				inserting_media_image &&
				$current_selection.is( 'img' ) &&
				1 >= $inserting_content.find( 'img' ).length
			) {
				var classes_to_add = [];
				var classes = $current_selection.attr( 'class' );
				var current_classes = [];
				if ( classes ) {
					current_classes = classes.split( /\s+/ );
				}

				var width = $current_selection.attr( 'width' );
				var height = $current_selection.attr( 'height' );

				//Find all classes that need to transfered over
				$.each( current_classes, function( index, class_item ) {
					if (
						! class_item.match( /size-/ ) &&
						! class_item.match( /align/ ) &&
						! class_item.match( /wp-image-/ )
					) {
						classes_to_add.push( class_item );
					}
				} );

				var $image_to_insert = null;
				if ( $inserting_content.is( 'img' ) ) {
					var $image_to_insert = $inserting_content;
				} else {
					var $image_to_insert = $inserting_content.find( 'img' );
				}

				//Transfer over the classes
				$.each( classes_to_add, function( key, value ) {
					$image_to_insert.addClass( value );
				} );

				//Set height and width
				$image_to_insert.attr( 'height', height ).attr( 'width', width );

				//Instead of running send_to_editor which is found in wp-admin/js/media-upload.js
				//which then runs editor.execCommand( 'mceInsertContent', false, html );
				//Insert with $ and trigger needed events
				//This is because tinymce was deleting columns and paragraphs if the only thing
				//in it was an image.

				//If current node is preceded by an anchor, replace that too
				var $current_node = $( tinymce.activeEditor.selection.getNode() );
				var $parent = $current_node.parent();
				if ( $parent.length && 'A' == $parent[0].tagName ) {
					$current_node = $parent;
				}

				$current_node.replaceWith( $inserting_content[0].outerHTML );
				tinymce.activeEditor.fire( 'setContent' );
				tinymce.activeEditor.focus();
				BOLDGRID.EDITOR.mce.undoManager.add();

				/*
				 * When using BoldGrid Connect Search to add an image to the
				 * page, sometimes everything is successful except the closing
				 * of the media modal. Below, we'll close the media modal.
				 */
				if ( window.tb_remove ) {
					try {
						window.tb_remove();
					} catch ( e ) {}
				}

				return;
			} else {
				args.push( attachments );
			}

			original_send_to_editor.apply( this, args );
		};
	};

	/**
	 * Select default alignment from the media modal window
	 * If you are replacing an image with an image, then the default alignment should be
	 * used
	 */
	self.select_default_alignment();

	//Store the users original screen column value
	self.original_column_val = $( '[name="screen_columns"]:checked' ).val();

	/**
	 * Adding three new buttons
	 */
	tinymce.PluginManager.add( 'monitor_view_imhwpb', function( editor, url ) {
		if ( 'content' !== editor.id ) {
			return;
		}

		editor.addButton( 'monitor_view_imhwpb', {
			title: 'Desktop View',
			icon: 'icon dashicons dashicons-desktop imhwpb-icon',
			classes: 'displaysize-imhwpb widget btn boldgrid-desktop',
			onclick: function( e ) {
				self.activate_display( 'monitor', $( e.target ) );
			}
		} );
	} );

	/**
	 * Adding a button that is used to change the view to tablet
	 */
	tinymce.PluginManager.add( 'tablet_view_imhwpb', function( editor, url ) {
		if ( 'content' !== editor.id ) {
			return;
		}

		editor.addButton( 'tablet_view_imhwpb', {
			title: 'Tablet View',
			icon: 'icon dashicons dashicons-tablet imhwpb-icon',
			classes: 'displaysize-imhwpb widget btn boldgrid-tablet',
			onclick: function( e ) {
				self.activate_display( 'tablet', $( e.target ) );
			}
		} );
	} );

	/**
	 * Adding a button that changes the view to phone
	 */
	tinymce.PluginManager.add( 'phone_view_imhwpb', function( editor, url ) {
		if ( 'content' !== editor.id ) {
			return;
		}

		editor.addButton( 'phone_view_imhwpb', {
			title: 'Phone View',
			icon: 'icon dashicons dashicons-smartphone imhwpb-icon',
			classes: 'displaysize-imhwpb widget btn boldgrid-phone',
			onclick: function( e ) {
				self.activate_display( 'phone', $( e.target ) );
			}
		} );
	} );

	/**
	 * Allowing the user to toggle the draggable fucntionality
	 */
	tinymce.PluginManager.add( 'toggle_draggable_imhwpb', function( editor, url ) {
		if ( 'content' !== editor.id ) {
			return;
		}

		BOLDGRID.EDITOR.mce = editor;

		/**
		 * When replacing an image with an image we will carry over the classes, width and
		 * height of the image being replaced.
		 */
		self.override_insert_media();

		editor.addButton( 'toggle_draggable_imhwpb', {
			title: 'BoldGrid Editing',
			icon: 'icon genericon genericon-move',
			classes: 'widget btn',
			onclick: self.toggle_draggable_plugin
		} );

		//Before adding an undo level check to see if this is allowed
		editor.on( 'BeforeAddUndo', function( e ) {
			if ( true == IMHWPB.tinymce_undo_disabled ) {
				return false;
			}

			e.level.content = BG.Service.sanitize.cleanup( e.level.content );
		} );

		// On Undo and redo make sure galleries are intialized.
		editor.on( 'undo redo', function( e ) {
			if ( BOLDGRID.EDITOR.Controls.$container ) {
				BOLDGRID.EDITOR.Controls.$container.trigger( 'history_change_boldgrid' );
			}

			if ( 'undefined' != typeof IMHWPBGallery && IMHWPBGallery.init_gallery ) {
				IMHWPBGallery.init_gallery( $( editor.iframeElement ).contents() );
			}
		} );

		//When content is added to editor
		editor.on( 'SetContent', function( e ) {
			self.reset_anchor_spaces( tinymce.activeEditor.getBody(), true );

			if ( $.fourpan && $.fourpan.refresh ) {
				$.fourpan.refresh();
			}

			if ( 'html' == e.format && self.dragging_is_active() && ! e.set ) {
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.validate_markup();
			}
		} );
		editor.on( 'show', function( e ) {
			if ( self.dragging_is_active() ) {
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.validate_markup();
			}
		} );

		editor.on( 'KeyDown', function( e ) {
			if ( ! self.draggable ) {
				return true;
			}

			var $structure,
				$newParagraph,
				$prev,
				node = tinymce.activeEditor.selection.getNode(),
				$current_node = $( node ),
				enterKey = 13;

			if ( self.dragging_is_active() ) {
				self.draggable.$master_container.trigger( 'is-typing-keydown' );
			}

			var is_column = $current_node.is( self.draggable.column_selectors_string ),
				is_module = $current_node.hasClass( 'bg-box' ),
				is_row = $current_node.is( self.draggable.row_selectors_string ),
				is_anchor = $current_node.is( 'A' ),
				isEmpty = tinymce.DOM.isEmpty( node );

			if ( is_module && 13 == e.which && isEmpty ) {
				$structure = $( '<p><br></p>' );
				$current_node.append( $structure );
				editor.selection.setCursorLocation( $structure[0], 0 );
				return false;
			}

			if ( is_column || is_row ) {

				//Any Character
				if (
					( 48 <= e.which && 90 >= e.which ) ||
					( 96 <= e.which && 105 >= e.which ) ||
					13 == e.which
				) {

					//Do not delete an element with content
					if ( ! isEmpty ) {
						return;
					}

					// When a user presses enter in an empty column. Create a new empty row with a new column inside.
					if ( enterKey == e.which ) {

						// If is row or col-12.
						if (
							is_row ||
							( is_column &&
								self.draggable.max_row_size ===
									self.draggable.find_column_size( $current_node ) )
						) {
							$structure = $(
								'<div class="row"><div class="col-md-12"></div></div>'
							);
							$current_node.closest( '.row' ).after( $structure );
							editor.selection.setCursorLocation(
								$structure.find( '.col-md-12' )[0],
								0
							);
							return false;
						}

						if ( is_column ) {
							$newParagraph = $(
								'<p><br data-mce-bogus="1"></p><p><br data-mce-bogus="1"></p>'
							);
							$current_node.append( $newParagraph );
							editor.selection.setCursorLocation( $newParagraph.last()[0], 0 );
							return false;
						}
					}

					//The key pressed was alphanumeric
					if ( is_column ) {
						$newParagraph = $( '<p><br data-mce-bogus="1"></p>' );
						$structure = $newParagraph;
					} else {
						$structure = $( '<div class="col-md-12"><p><br></p></div>' );
						$newParagraph = $structure.find( 'p' );
					}

					$current_node.html( $structure );
					editor.selection.setCursorLocation( $newParagraph[0], 0 );
				}
			} else if ( is_anchor && ( '8' == e.which || '46' == e.which ) ) {

				//Backspace or Delete Key
				if (
					'&nbsp;&nbsp;' == $current_node.html() ||
					'&nbsp; ' == $current_node.html()
				) {
					$current_node.remove();
					return false;
				}
			} else if ( 'P' == node.tagName ) {

				// When clicking enter on an empty P, Just add another P.
				if ( enterKey == e.which && isEmpty && ! $current_node.find( 'img' ).length ) {
					$newParagraph = $( '<p><br data-mce-bogus="1"></p>' );
					$current_node.after( $newParagraph );
					editor.selection.setCursorLocation( $newParagraph[0], 0 );
					return false;
				}

				if ( '8' == e.which && isEmpty ) {
					$prev = $current_node.prev();
					if ( $prev.length && $prev.hasClass( 'draggable-tools-imhwpb' ) ) {
						$prev = $prev.prev();
					}

					if ( $prev.length ) {
						$current_node.remove();
						if ( tinymce.DOM.isEmpty( $prev[0] ) ) {
							editor.selection.setCursorLocation( $prev[0], 0 );
						} else {
							editor.selection.select( $prev[0] );
							editor.selection.collapse( 0 );
						}
						return false;
					}
				}
			} else if (
				'IMG' == node.tagName ||
				$current_node.is( '.button-primary, .button-secondary, .btn' )
			) {
				if ( enterKey == e.which ) {
					$newParagraph = $( '<p><br data-mce-bogus="1"></p>' );
					var $parentP = $current_node.closest( 'p' );
					if ( $parentP.length ) {
						$parentP.after( $newParagraph );
					} else {
						$current_node.after( $newParagraph );
					}

					editor.selection.setCursorLocation( $newParagraph[0], 0 );
					return false;
				}
			}

			return true;
		} );

		//Every time the user clicks on a new node.
		//re-map to a different section
		editor.on( 'NodeChange', function( e ) {
			var $element = $( e.element );

			//If the element is an anchor
			//And the user clicks on the last or first position in the content
			//And that content character is a space
			//Then re-map the node change to the the position after/before it
			if ( 'A' == e.element.tagName ) {
				var range = tinymce.DOM.createRng();
				var current_range = tinymce.activeEditor.selection.getRng();
				var position = null;
				if ( current_range.startOffset == current_range.endOffset ) {
					if ( 0 === current_range.startOffset ) {

						//If the first character is a space, set the cursor to the second character
						//to preserve the buffer
						if (
							'&nbsp;' == e.element.firstChild.data.substr( 0, 6 ) ||
							/\s/.test( e.element.firstChild.data.substr( 0, 1 ) )
						) {
							position = 1;
						}
					} else if (
						e.element.firstChild &&
						current_range.startOffset == e.element.firstChild.length
					) {
						var final_pos_offset = 0;

						//If the last character is a space, set the cursor to the second to last
						//character to preserve the buffer
						if (
							'&nbsp;' == e.element.firstChild.data.substr( -6 ) ||
							/\s/.test( e.element.firstChild.data.substr( -1 ) )
						) {
							final_pos_offset = -1;
						}
						position = e.element.firstChild.length + final_pos_offset;
					}
				}

				//Set the position of the cursor
				if ( position ) {
					range.setStart( e.element.firstChild, position );
					range.setEnd( e.element.firstChild, position );
					tinymce.activeEditor.selection.setRng( range );
				}
			}

			if ( e.selectionChange && $element.length ) {
				if ( $element.is( 'br' ) ) {
					$element
						.parent()
						.children()
						.each( function() {
							var $this = $( this );
							if ( $this.is( 'a' ) && $this.html() && ! $this.find( 'img' ).length ) {
								$new_element = $this.find( ':first' );
								if ( ! $new_element.length ) {
									$new_element = $this;
								}

								editor.selection.setCursorLocation( $new_element[0], 1 );
								return false;
							}
						} );
				}
			}
		} );

		/**
		 * While resizing a column if you finish resizing over wpview wrap, mouseup isn't triggered
		 * trigger it manually
		 */
		editor.on( 'SetAttrib', function( e ) {
			if (
				e.attrElm.hasClass( 'wpview-wrap' ) &&
				'undefined' != typeof IMHWPB.WP_MCE_Draggable.instance
			) {
				var draggable = IMHWPB.WP_MCE_Draggable.instance.draggable_instance;
				if ( draggable.resize ) {
					draggable.$master_container.trigger( 'mouseup', e.attrElm );
				}
			}
		} );

		/**
		 * On mouse down of the drag tools, prevent tinymce from blocking event.
		 */
		editor.on( 'mousedown', function( e ) {
			if ( ! self.draggable ) {
				return;
			}

			var $target = $( e.target ),
				isResizing = true === tinymce.activeEditor.boldgridResize,
				isPopoverChild = $target.closest( '.draggable-tools-imhwpb' ).length,
				isActionItem =
					! self.draggable.ie_version &&
					$target.hasClass( 'action-list' ) &&
					! $target.attr( 'draggable' ),
				isPopover = isPopoverChild && ! isActionItem,
				newDiv;

			if ( isPopover || isResizing ) {

				// Stop tinymce DragDropOverrides.
				// https://github.com/tinymce/tinymce/blob/master/js/tinymce/classes/DragDropOverrides.js#L164.
				e.button = true;

				// Stop tinymce from preventing out event.
				// https://github.com/tinymce/tinymce/blob/master/js/tinymce/classes/dom/EventUtils.js#L125.
				e.preventDefault = function() {};

				// Fake the target so that cE checking evals a different element.
				newDiv = $( '<div><div></div></div>' );
				newDiv[0].contentEditable = false;
				e.target = newDiv[0];
			}
		} );

		editor.on( 'dragstart', function( e ) {
			var $target = $( e.originalTarget );
			if ( $target.hasClass( 'popover-imhwpb' ) ) {
				e.preventDefault();
			}
		} );

		//Prevents boldgrid popovers from appearing when resizing images
		editor.on( 'ObjectResizeStart', function( e ) {
			if (
				'undefined' !=
				typeof IMHWPB.WP_MCE_Draggable.instance.draggable_instance.$master_container
			) {
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.popovers_disabled = true;
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.$master_container
					.find( 'html' )
					.addClass( 'bg-disabled-handles' );
			}
		} );

		//Once an object is resized, allow boldgrid popovers.
		editor.on( 'ObjectResized', function( e ) {
			if (
				'undefined' !=
				typeof IMHWPB.WP_MCE_Draggable.instance.draggable_instance.$master_container
			) {
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.popovers_disabled = false;
				IMHWPB.WP_MCE_Draggable.instance.draggable_instance.$master_container
					.find( 'html' )
					.removeClass( 'bg-disabled-handles' );
			}
		} );

		/**
		 * Before WP retrieves the contents of the editor, we will strip out any extra spaces
		 * that we wrapped around anchors as well as any other cleanup
		 */
		editor.on( 'GetContent', function( e ) {
			if ( e.content ) {
				e.content = self.reset_anchor_spaces( '<div>' + e.content + '</div>', false );
				e.content = BG.Service.sanitize.cleanup( e.content );
			}
		} );

		editor.on( 'AddUndo', function( e ) {
			BOLDGRID.EDITOR.GRIDBLOCK.View.updateHistoryStates();

			/*
				* Update the frame html, this is different from the undo level content.
				* An ideal solution would validate the undo level to the same
				* extent as the iframe.
				*/
			if ( BOLDGRID.EDITOR.Service.component ) {
				BOLDGRID.EDITOR.Service.component.validateEditor();
			}
		} );

		/**
		 * When the editor is initialized load the draggable ability
		 */
		editor.on( 'init', function( event ) {
			IMHWPB.WP_MCE_Draggable.instance = new IMHWPB.WP_MCE_Draggable();

			var $body = $( editor.getBody() );
			var $tinymce_iframe = $( event.target.iframeElement ).contents();

			if ( BoldgridEditor.body_class ) {
				$body.addClass( BoldgridEditor.body_class );
			}

			if ( BoldgridEditor.hasDraggableEnabled ) {
				IMHWPB.WP_MCE_Draggable.instance.load_draggable( $tinymce_iframe );
				self.draggable = IMHWPB.WP_MCE_Draggable.instance.draggable_instance;
				if ( self.draggable.ie_version && 11 >= self.draggable.ie_version ) {
					$body.addClass( 'dragging-disabled' );
				}
			} else {

				//If this is not a boldgrid theme we will disable by default,
				//and deactivate style sheets
				IMHWPB.WP_MCE_Draggable.instance.draggable_inactive = true;
				IMHWPB.WP_MCE_Draggable.instance.addDeactivateClasses();
			}

			var buttons = [];
			buttons.push(
				tinymce.ui.Factory.create( {
					type: 'button',
					title: 'Change',
					tooltip: 'Change',
					icon: 'icon dashicons dashicons-admin-media imhwpb-icon',
					onclick: function() {
						BOLDGRID.EDITOR.CONTROLS.IMAGE.Change.openModal();
					}
				} )
			);

			// Add button to floating tinymce toolbar.
			tinymce.activeEditor.on( 'wptoolbar', function( event ) {
				if ( event.toolbar ) {
					var toolbar = event.toolbar,
						buttonPos = 3,
						buttonGroup = toolbar.items()[0].items()[0],
						buttonIndex = _.findIndex( buttonGroup.items(), function( item ) {
							return 'Change' == item.settings.title;
						} );

					toolbar.show();

					// If button doesnt exist, add it.
					if ( -1 === buttonIndex ) {

						// Toolbar/ButtonGroup.insert().
						buttonGroup.insert( buttons, buttonPos, false );
						toolbar.reposition();
					}
				}
			} );
		} );

		/*
			*
			* Used for debugging
		var all_events = [
			'AddUndo',
			'cut',
			'BeforeAddUndo',
			'BeforeExecCommand',
			'BeforeRenderUI',
			'BeforeSetContent',
			'ExecCommand',
			'GetContent',
			'SetContent',
			'LoadContent',
			'NodeChange',
			'ObjectResizeStart',
			'ObjectSelected',
			'PostProcess',
			'PreInit',
			'PreProcess',
			'ProgressState',
			'SaveContent',
			'SetAttrib',
			'activate',
			'blur',
			'change',
			'deactivate',
			'focus',
			'hide',
			'init',
			'redo',
			'remove',
			'reset',
			'submit',
			'show',
			'undo',
		];

		console.log(all_events.join());
		editor.on( all_events.join(' '), function( e ) {
			console.log(e.type);
		} );*/
	} );

	/**
	 * Check if an element is empty after being validated by mce
	 * an element is "empty" if it only has a break tag in and no text
	 * TODO: Function is not working correctly, fix
	 */
	this.mce_element_is_empty = function( $element ) {
		var $children = $element.children();
		var is_empty = false;
		if (
			$element.is( ':empty' ) ||
			( 1 == $children.length && $children.filter( 'br' ).length && ! $element.text() )
		) {
			is_empty = true;
		}

		return is_empty;
	};

	/**
	 * Wraps anchor contents in spaces to make it easier for the user to target
	 */
	this.reset_anchor_spaces = function( markup, add_spaces ) {
		var $markup = $( markup );

		//Strip out added spaces
		$markup.find( 'a:not(.wpview a)' ).each( function() {
			var $this = $( this );
			var html = $this.html();

			//Starting With nbsp? remove
			if ( '&nbsp;' == html.substr( 0, 6 ) ) {
				html = html.substr( 6 );
			}

			//Ending with nbsp? remove
			if ( '&nbsp;' == html.substr( -6, 6 ) ) {
				html = html.substr( 0, html.length - 6 );
			}

			if ( add_spaces ) {

				//Wrap all anchors in spaces
				$this.html( '&nbsp;' + html + '&nbsp;' );
			} else {
				$this.html( html );
			}
		} );

		return $markup.html();
	};

	/**
	 * Check is dragging is set to active by the user
	 */
	this.dragging_is_active = function() {
		return (
			'undefined' != typeof IMHWPB.WP_MCE_Draggable.instance &&
			false == IMHWPB.WP_MCE_Draggable.instance.draggable_inactive
		);
	};

	/**
	 * Toggle the active state of the draggable plugin
	 */
	this.toggle_draggable_plugin = function( event ) {
		console.log( 'disabled' );
	};

	/**
	 * The action that should happen once a button is clicked
	 */
	this.activate_display = function( type, $element ) {
		var $closest = $element.closest( 'div' );
		if ( $closest.hasClass( 'mce-disabled' ) ) {
			return false;
		}
		$( '.mce-displaysize-imhwpb' ).removeClass( 'boldgrid-highlighted-mce-icon' );

		if ( $closest.hasClass( 'mce-active' ) ) {
			$element.closest( 'div' ).removeClass( 'mce-active' );
			self.remove_editor_styles();
			self.currently_selected_size = null;
		} else {
			$( '.mce-displaysize-imhwpb' ).each( function() {
				$( this )
					.closest( 'div' )
					.removeClass( 'mce-active' );
			} );
			$element.closest( 'div' ).addClass( 'mce-active' );
			self.set_width( type );
			self.currently_selected_size = type;
		}

		if (
			IMHWPB.WP_MCE_Draggable.instance &&
			false == IMHWPB.WP_MCE_Draggable.instance.draggable_inactive
		) {
			IMHWPB.WP_MCE_Draggable.instance.resize_done_event();
			$window.trigger( 'resize' );
		}
	};

	/**
	 * Remove applied classes
	 */
	this.remove_editor_styles = function() {
		$( '#wp-content-editor-container' ).removeClass(
			'mce-viewsize-phone-imhwpb mce-viewsize-tablet-imhwpb mce-viewsize-monitor-imhwpb'
		);
	};

	/**
	 * Set the width of the editor
	 */
	this.set_width = function( style ) {
		self.remove_editor_styles();
		$( '#wp-content-editor-container' ).addClass( 'mce-viewsize-' + style + '-imhwpb' );
	};
};

IMHWPB.Editor.instance = new IMHWPB.Editor( jQuery );