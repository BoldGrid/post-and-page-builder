var self,
	BG = BOLDGRID.EDITOR,
	$ = jQuery;

/**
 * Initializes event binds for drop down menu clicks.
 * This code is old needs to be refactored, moved from drag.js.
 */

export class GeneralActions {
	bind( popover ) {
		this.popover = popover;

		popover.$element.find( 'li[data-action="add-column"]' ).on( 'click', menuActions.add_column );
		popover.$element.find( 'li[data-action="duplicate-column"]' ).on( 'click', menuActions.duplicateColumn );
		popover.$element.find( 'li[data-action="clear"]' ).on( 'click', menuActions.clear );
		popover.$element.find( 'li[data-action="insert-layout"]' ).on( 'click', menuActions.insert_layout );
		popover.$element.find( 'li[data-action="add-row"]' ).on( 'click', menuActions.add_row );
		popover.$element.find( 'li[data-action="clone-as-row"]' ).on( 'click', menuActions.unnest_row );
		popover.$element.find( 'li[data-action]' ).on( 'click', menuActions.trigger_action_click );
		popover.$element.find( 'li[data-action="add-media"]' ).on( 'click', menuActions.add_media );
		popover.$element.find( 'li[data-action="align-top"]' ).on( 'click', menuActions.alignTop );
		popover.$element.find( 'li[data-action="Background"]' ).on( 'click', ( e ) => this.generalMacro( e ) );
		popover.$element.find( 'li[data-action="Box"]' ).on( 'click', ( e ) => this.generalMacro( e ) );
		popover.$element.find( 'li[data-action="Advanced"]' ).on( 'click', ( e ) => this.generalMacro( e ) );
		popover.$element.find( 'li[data-action="Font"]' ).on( 'click', ( e ) => this.generalMacro( e ) );
		popover.$element.find( 'li[data-action="align-default"]' ).on( 'click', menuActions.alignDefault );
		popover.$element.find( 'li[data-action="align-bottom"]' ).on( 'click', menuActions.alignBottom );
		popover.$element.find( 'li[data-action="align-center"]' ).on( 'click', menuActions.alignCenter );

		self = BG.Controls.$container;
	}

	generalMacro( e ) {
		let controlName;

		e.stopPropagation();

		controlName = $( e.target ).data( 'action' );

		BG.Service.popover.selection.$target.click();
		BG.Controls.get( controlName ).openPanel( BG.Service.popover.selection.$target, this.popover.name );
	}
}

export { GeneralActions as default };

/**
 * A list of the menu items that are added by default.
 */
let native_menu_options = [
	'duplicate',
	'add-row',
	'add-section-row',
	'add-column',
	'nest-row',
	'clear',
	'delete',
	'clone-as-row',
	'align-top',
	'align-bottom',
	'align-default',
	'align-center'
];

let alignColumn = function( $popover, alignment ) {
	var $column = BOLDGRID.EDITOR.Service.popover.selection.$target;

	$column.removeClass( 'align-column-top align-column-bottom align-column-center' );

	if ( alignment ) {
		$column.addClass( 'align-column-' + alignment );
	}

	$popover.closest( '.popover-menu-imhwpb' ).addClass( 'hidden' );
};

/**
 * Every time that we open the media modal this action should occur.
 */
let wp_media_modal_action = function( event, $clicked_element ) {
	event.preventDefault();
	$clicked_element.closest( '.popover-menu-imhwpb' ).addClass( 'hidden' );
	self.window_mouse_leave();
};

/**
 * An object with the actions that occur when a user clicks on the options
 * in the popover menu.
 */
let menuActions = {

	alignTop: function() {
		alignColumn( $( this ), 'top' );
	},

	alignBottom: function() {
		alignColumn( $( this ), 'bottom' );
	},

	alignCenter: function() {
		alignColumn( $( this ), 'center' );
	},

	alignDefault: function() {
		alignColumn( $( this ) );
	},

	unnest_row: function( event ) {
		var $element = BOLDGRID.EDITOR.Service.popover.selection.$target;

		if ( ! $element.length ) {
			return;
		}

		$( $element[0].outerHTML ).insertBefore( $element.parent().closest( '.row' ) );
		wp_media_modal_action( event, $element );
	},

	add_row: function() {
		let $emptyRow = self.createEmptyRow();
		BOLDGRID.EDITOR.Service.popover.selection.$target.before( $emptyRow );
		self.postAddRow( $emptyRow );
	},

	/**
	 * Adding a column to a row. Available from the row popovers.
	 */
	add_column: function( event ) {
		event.preventDefault();

		var min_row_size = 0,
			$current_click = $( this ),
			$row = BOLDGRID.EDITOR.Service.popover.selection.$target,
			row_size = self.find_row_size( $row ),
			$new_column;

		//If this row is empty( only has a br tag ) make sure its blank before adding a column
		var $children = $row.find( '> *' );
		if ( 1 === $children.length && 'BR' == $children[0].tagName ) {
			$row.empty();
		}

		if ( row_size < self.max_row_size && row_size >= min_row_size ) {
			$new_column = self.fill_row( row_size, $row );
		} else if ( row_size >= self.max_row_size ) {
			var layout_format = self.get_layout_format( $row );
			var layout_transform = self.find_layout_transform( layout_format );
			if ( layout_transform && ! layout_transform.current ) {
				self.transform_layout( $row, layout_transform );
				$new_column = $(
					'<div class="col-md-' + layout_transform.new + ' col-sm-12 col-xs-12"></div>'
				);
				$row.append( $new_column );
			} else {
				self.decrease_row_size( $row );
				$new_column = $( '<div class="col-md-1 col-sm-12 col-xs-12"></div>' );
				$row.append( $new_column );
			}
		}
		$new_column.html( '<p><br> </p>' );
		$new_column.addClass( 'added-element' );
		setTimeout( function() {
			$new_column.removeClass( 'added-element' );
		}, 1000 );

		self.trigger( self.add_column_event, $new_column );
		$current_click.closest( '.popover-menu-imhwpb' ).addClass( 'hidden' );
	},

	/**
	 * Duplicating an element, available from all element types.
	 */
	duplicateColumn: function( event ) {
		event.preventDefault();
		var $element = BOLDGRID.EDITOR.Service.popover.selection.$target;
		var $row = $element.closest_context( self.row_selectors_string, self );

		var column_size = self.find_column_size( $element );
		var layout_format = self.get_layout_format( $row );
		var layout_transform = self.find_layout_transform( layout_format, column_size );
		var new_column_size = 1;

		if ( self.find_row_size( $row ) + column_size <= self.max_row_size ) {
			var $new_element = $element.before( $element[0].outerHTML );
			$new_element[0].popover = null;
		} else if ( layout_transform ) {
			if ( ! layout_transform.current ) {
				self.transform_layout( $row, layout_transform );
				new_column_size = layout_transform.new;
				var $new_element = $element.before( $element[0].outerHTML );
				$new_element[0].popover = null;
				self.change_column_size( $new_element, null, new_column_size );
			} else {

				// Transform current
				self.change_column_size( $element, null, layout_transform['current_transform'] );

				// Transform New
				new_column_size = layout_transform.new;
				var $new_element = $element.before( $element[0].outerHTML );
				$new_element[0].popover = null;
				self.change_column_size( $new_element, null, new_column_size );

				// Transform Additional
				$.each( layout_transform['additional_transform'], function( key, transform ) {
					var num_transformed = 0;
					$row
						.find( self.immediate_column_selectors_string )
						.reverse()
						.each( function() {
							if ( num_transformed < transform.count ) {
								var $column = $( this );
								if ( self.find_column_size( $column ) == transform.from ) {
									self.change_column_size( $column, null, transform.to );
									num_transformed++;
								}
							} else {
								return false;
							}
						} );
				} );
			}
		} else if ( 0 == column_size % 2 && column_size ) {
			self.change_column_size( $element, null, parseInt( column_size / 2 ) );
			var $new_element = $element.before( $element[0].outerHTML );
			$new_element[0].popover = null;
			self.change_column_size( $new_element, null, parseInt( column_size / 2 ) );
		} else if ( self.decrease_row_size( $row ) ) {
			var $new_element = $element.before( $element[0].outerHTML );
			$new_element[0].popover = null;
			self.change_column_size( $new_element, null, new_column_size );
		}

		self.trigger( self.add_column_event );
	},

	/**
	 * Remove the contents elements of an element.
	 */
	clear: function( event ) {
		event.preventDefault();
		var $current_click = $( this );
		var $element = BOLDGRID.EDITOR.Service.popover.selection.$target;
		var type = self.get_element_type( $element );

		if ( 'column' == BOLDGRID.EDITOR.Service.popover.selection.name ) {
			$element.html( '<p><br> </p>' );
			alignColumn( $current_click );
		} else {
			$element
				.find( ':not(' + self.column_selectors_string + '):not( ' + self.row_selectors_string + ')' )
				.remove();
		}

		$current_click.closest( '.popover-menu-imhwpb' ).addClass( 'hidden' );
		self.trigger( self.clear_event, $element );
	},

	/**
	 * Activate the add media modal
	 */
	add_media: function( event ) {
		self.add_media_event_handler( BOLDGRID.EDITOR.Service.popover.selection.$target[0] );
		return;
	},

	/**
	 * Activate the add media modal.
	 */
	insert_layout: function( event ) {
		self.insert_layout_event_handler( BOLDGRID.EDITOR.Service.popover.selection.$target[0] );
		return;
	},
	trigger_action_click: function( event ) {
		var $clicked_element = $( this );

		// Native Function do not need to run wp_media_modal_action,
		// However, currently nest-row is the only action that requires that
		// it isn't run.
		if ( -1 === native_menu_options.indexOf( $clicked_element.data( 'action' ) ) ) {
			self.$boldgrid_menu_action_clicked = BOLDGRID.EDITOR.Service.popover.selection.$target[0];

			wp_media_modal_action( event, $clicked_element );
		}

		self.trigger( self.boldgrid_modify_event );
	}
};
