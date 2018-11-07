<?php
/**
 * Class: Boldgrid_Editor_Setting
 *
 * Handle settings.
 *
 * @since      1.9.0
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Setting
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Setting
 *
 * Handle settings.
 *
 * @since      1.9.0
 */
class Boldgrid_Editor_Setting {

	/**
	 *  Save the default editor used for the post.
	 *
	 * @since 1.9.0
	 *
	 * @param  WP_Post $post Post Object.
	 */
	public function save_meta_editor( $post ) {
		$default_editor = ! empty( $_POST['bgppb_default_editor_post'] ) ?
			sanitize_text_field( $_POST['bgppb_default_editor_post'] ) : null;

		if ( $default_editor && $post ) {
			update_post_meta(
				$post->ID,
				'_bgppb_default_editor',
				$default_editor
			);
		}
	}

	/**
	 * Get the Default Editor.
	 *
	 * @since 1.9.0
	 *
	 * @return string Name of the default editor.
	 */
	public function get_default_editor() {
		return 'bgppb';
	}

	/**
	 * Get all saved settings.
	 *
	 * @since 1.9.0
	 *
	 * @return array Settings
	 */
	public function getAll() {
		return [
			'current_editor' => $this->get_current_editor()
		];
	}

	/**
	 * Are we using gutenberg?
	 *
	 * @since 1.9.0
	 *
	 * @return boolean
	 */
	public function is_block_editor() {
		$editor = $this->get_current_editor();
		return ! in_array( $editor, [ 'classic', 'bgppb' ] );
	}

	/**
	 * Get the editor chosen for the current post.
	 *
	 * @since 1.9.0
	 *
	 * @return string editor.
	 */
	public function get_current_editor() {
		global $post;

		$default_editor = ! empty( $_POST['bgppb_default_editor_post'] ) ?
			sanitize_text_field( $_POST['bgppb_default_editor_post'] ) : null;

		$default_editor = $this->get_default_editor();
		if ( $post ) {
			$default_editor = get_post_meta( $post->ID, '_bgppb_default_editor', true ) ?: $default_editor;
		}

		return $default_editor;
	}
}
