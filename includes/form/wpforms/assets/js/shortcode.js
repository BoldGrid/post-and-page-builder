( function( window, views, $ ) {
	var postID = $( '#post_ID' ).val() || 0,
		media, boldgrid_form;

    var boldgrid_edit_form = jQuery.Event( 'boldgrid_edit_form' ),
		pluginName = 'wpforms';

	media = {
		state: [],

		edit: function( text, update ) {

			wp.media.editor.open();

			IMHWPB.editform = this;
			wp.media.frame.setState( 'iframe:boldgrid_form' );

			//This value will be read from within an iframe, but should be reset to null
			//to prevent going into edit mode.
			//
			setTimeout( function() {
				IMHWPB.editform = null;
			}, 10000 );

			$( window ).trigger( boldgrid_edit_form, this );
		}
	};

	/**
	 * Define how boldgrid forms should display in the editor
	 */
	boldgrid_form = _.extend( {}, media, {

		initialize: function() {
			var options = this.shortcode.attrs.named;
			var desc = options.description == 'true' ? '1' : '0';
			var title = options.title == 'true' ? '1' : '0';

			var current_selector = 'editor-boldgrid-form-' + options.id;
			if ( $( '#tmpl-' + current_selector ).length ) {
				this.template = wp.media.template( current_selector );

				this.render( '<div class="boldgrid-' + pluginName + '"' + 'data-id=\'' +
					options.id + '\' data-description=' + desc +
					' data-title=' + title + '>' + this.template() + '</div>' );

				setTimeout( function() {
					if ( tinymce && tinymce.activeEditor ) {
						$( tinymce.activeEditor.iframeElement ).contents()
							.find( '.boldgrid-' + pluginName + '[data-id="' + options.id + '"]' )
							.closest( '.wpview-body' )
							.attr( 'contentEditable', true );
					}
				} );

			} else {
				this.template = wp.media.template( 'editor-boldgrid-not-found' );
				this.render( this.template() );
			}
		}
	} );

	views.register( 'ninja_forms', _.extend( {}, boldgrid_form ) );

	/**
	 * Before Bold grid Initializes add the menu items
	 */
	jQuery( document ).on( 'BoldGridPreInit', function( event, wp_mce_draggable ) {
		wp_mce_draggable.add_menu_item( 'Insert Form', 'column', function() {
			//On click of the new form, Open the media modal to the forms tab
			wp_mce_draggable.insert_from_media_modal_tab( 'iframe:boldgrid_form' );
		} );
	});

} )( window, window.wp.mce.views, window.jQuery );