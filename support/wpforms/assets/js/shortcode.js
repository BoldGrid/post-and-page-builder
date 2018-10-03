( function( window, $ ) {
	var postID = $( '#post_ID' ).val() || 0,
		media, boldgrid_form;

    var boldgrid_edit_form = $.Event( 'boldgrid_edit_form' ),
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

			this.getNodes( function( editor, node ) {
				editor.selection.select( node );
			} );

			$( window ).trigger( boldgrid_edit_form, this );
		}
	};

	/**
	 * Define how boldgrid forms should display in the editor
	 */
	boldgrid_form = _.extend( {}, media, {

		initialize: function() {
			var options = this.shortcode.attrs.named,
				desc = 'true' == options.description ? '1' : '0',
				title = 'true' == options.title  ? '1' : '0',
				currentSelector = 'editor-boldgrid-form-' + options.id;

			if ( $( '#tmpl-' + currentSelector ).length ) {
				this.template = wp.media.template( currentSelector );

				this.render( '<div class="boldgrid-' + pluginName + '"' + 'data-id=\'' +
					options.id + '\' data-description=' + desc +
					' data-title=' + title + '>' + this.template() + '</div>' );

				setTimeout( function() {
					if ( tinymce && tinymce.activeEditor && BOLDGRID.EDITOR.mce ) {
						let $form = $( BOLDGRID.EDITOR.mce.iframeElement ).contents()
							.find( '.boldgrid-' + pluginName + '[data-id="' + options.id + '"]' );

						$form.each( function() {
							var $this = $( this );

							$this.closest( '.wpview-body' ).attr( 'contentEditable', true );

							if ( ! $this.closest( '.boldgrid-shortcode' ).length ) {
								$this.closest( '.wpview' )
									.wrapAll( '<div class="boldgrid-shortcode wpforms-shortcode" data-imhwpb-draggable="true"></div>' );
							}
						} );
					}
				} );

			} else {
				this.template = wp.media.template( 'editor-boldgrid-not-found' );
				this.render( this.template() );
			}
		}
	} );

	if ( wp.mce ) {
		wp.mce.views.register( 'wpforms', _.extend( {}, boldgrid_form ) );
	}

	/**
	 * Before Bold grid Initializes add the menu items
	 */
	$( document ).on( 'BoldGridPreInit', function( event, wp_mce_draggable ) {
		wp_mce_draggable.add_menu_item( 'Insert Form', 'column', function() {
			//On click of the new form, Open the media modal to the forms tab
			wp_mce_draggable.insert_from_media_modal_tab( 'iframe:boldgrid_form' );
		} );
	});

} )( window, window.jQuery );
