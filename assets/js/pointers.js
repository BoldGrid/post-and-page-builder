jQuery( document ).ready( function( $ ) {
	window.tinymce.activeEditor.on( 'init', function() {
		boldgridEditorOpenPointer( 0 );
	} );

	function boldgridEditorOpenPointer( i ) {
		pointer = boldgridEditorPointers.pointers[ i ];
		options = $.extend( pointer.options, {
			close: function() {
				$.post( ajaxurl, {
					pointer: pointer.pointer_id,
					action: 'dismiss-wp-pointer'
				} );
			}
		} );

		$( pointer.target ).pointer( options ).pointer( 'open' );
	}
} );
