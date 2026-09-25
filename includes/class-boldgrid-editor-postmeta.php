<?php
/**
 * Class: Boldgrid_Editor_Postmeta
 *
 * Save post meta for previews, in lue of post meta revisions.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Postmeta
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Postmeta
 *
 * Save post meta for previews, in lue of post meta revisions.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Postmeta {

	/**
	 * Init the class.
	 *
	 * @since 1.6
	 */
	public function init() {
		add_action( 'save_post', array( $this, 'save' ), 10, 2 );
	}

	/**
	 * When saving posts save post post meta associated with the post.
	 *
	 * @since 1.6
	 *
	 * @param int $post_id Post ID.
	 */
	public function save( $post_id ) {
		$saved_id  = (int) $post_id;
		$parent_id = wp_is_post_revision( $saved_id );
		$post_id   = $parent_id ? (int) $parent_id : $saved_id;

		if ( ! $post_id || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// WordPress verifies the post-edit nonce before invoking save_post.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$is_preview_submit = ! empty( $_POST['wp-preview'] ) && is_scalar( $_POST['wp-preview'] );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$is_autosave = ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			|| wp_is_post_autosave( $saved_id );

		if ( ! $is_preview_submit && ! $is_autosave ) {
			delete_post_meta( $post_id, '_boldgrid_editor_preview_meta' );
			return;
		}

		if ( ! $is_preview_submit ) {
			return;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$template      = isset( $_POST['page_template'] ) && is_scalar( $_POST['page_template'] )
			? sanitize_text_field( wp_unslash( $_POST['page_template'] ) )
			: null;
		$templater     = Boldgrid_Editor_Service::get( 'templater' );
		$template      = $templater->is_custom_template( $template ) ? $template : null;
		$display_title = isset( $_POST['boldgrid-display-post-title'] ) &&
			is_scalar( $_POST['boldgrid-display-post-title'] )
			? (int) ( 1 === absint( $_POST['boldgrid-display-post-title'] ) )
			: null;
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		update_post_meta(
			$post_id,
			'_boldgrid_editor_preview_meta',
			array(
				'template'                 => $template,
				'boldgrid_hide_page_title' => $display_title,
			)
		);
	}
}
