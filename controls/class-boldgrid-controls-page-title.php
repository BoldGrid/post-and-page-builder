<?php
/**
 * File: class-boldgrid-controls-page-title.php
 *
 * Control the visibility of the page title.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Theme
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Controls_Page_Title
 *
 * Control the visibility of the page title.
 *
 * @since      1.6
 */
class Boldgrid_Controls_Page_Title {

	public static $default_configs = array(
		'visible_by_default' => true,
		'enabled' => true,
	);

	public function __construct( $configs = array() ) {
		$this->configs = array_merge( self::$default_configs, $configs );
	}

	/**
	 * Load all hooks.
	 *
	 * @since 1.6
	 */
	public function init() {
		if ( $this->configs['enabled'] ) {
			add_action( 'save_post', array( $this, 'update' ), 10, 2 );
			add_action( 'load-post.php', array( $this, 'add_checkbox' ) );
			add_action( 'load-post-new.php', array( $this, 'add_checkbox' ) );
		}
	}

	/**
	 * Whether or not the page title is configured to be displayed.
	 *
	 * @since 1.6
	 *
	 * @return boolean
	 */
	public function has_title_displayed( $post = null ) {
		$post = $post ? $post : get_post();
		$has_title_displayed = $this->configs['visible_by_default'];

		if ( $post ) {
			$post_meta = get_post_meta( $post->ID );
			$post_meta_val = ! empty( $post_meta['boldgrid_hide_page_title'][0] );

			if ( $post_meta_val ) {
				$has_title_displayed = $post_meta_val;
			}
		}

		return $has_title_displayed;
	}

	/**
	 * Save page title toggle on page save.
	 *
	 * @since 1.6
	 */
	public function update( $post_id, $post ) {
		$post_id = ! empty( $post_id ) ? $post_id : null;

		// If this is a revision, get real post ID.
		if ( $parent_id = wp_is_post_revision( $post_id ) ) {
			$post_id = $parent_id;
		}

		$status = isset( $_POST['boldgrid-display-post-title'] ) ?
			intval( $_POST['boldgrid-display-post-title'] ) : null;

		if ( $post_id && false === is_null( $status ) ) {
			$post_meta = get_post_meta( $post_id );
			if ( ! empty( $post_meta ) ) {

				// Save post meta.
				update_post_meta( $post_id, 'boldgrid_hide_page_title', $status );
			}
		}
	}

	/**
	 * Display a post title display control on the page and post editor.
	 *
	 * @since 1.6
	 */
	public function add_checkbox() {
		global $pagenow;

		if ( 'bgppb' !== Boldgrid_Editor_Service::get( 'editor_type' ) ) {
			return;
		}

		$post_id = ! empty( $_REQUEST['post'] ) ? $_REQUEST['post'] : null;

		$template_file = null;
		if ( false == empty( $post_id ) ) {
			$post = get_post( $post_id );
			if ( ! $post ) {
				return;
			}
			// If the post type is not page or post that do not display.
			if ( false == in_array( $post->post_type, array( 'post', 'page' ) ) ) {
				return;
			}

			$post_meta = get_post_meta( $post->ID );
			$display_page_title = ! empty( $post_meta['boldgrid_hide_page_title'][0] ) || ! isset( $post_meta['boldgrid_hide_page_title'] );
			$template_file = get_post_meta( $post->ID, '_wp_page_template', true );

			// Don't allow modification on home page.
			$disabled = '';
			if ( 'page_home.php' == $template_file ) {
				$display_page_title = false;
				$disabled = 'disabled="disabled"';
			}
			$post_type = 'page';
			if ( 'post' == $post->post_type ) {
				$post_type = 'post';
			}

		} else {
			$post_type = ! empty( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : null;
			if ( 'page' != $post_type ) {
				$post_type = 'post';
			}

			$display_page_title = $this->configs['visible_by_default'];
			$disabled = '';
		}

		add_action( 'edit_form_after_title',
			function () use ( $post_type, $display_page_title, $disabled, $template_file ) {
				$checked = checked( $display_page_title, true, false );
				$message = "The {$post_type} title displays as a heading at the top of your {$post_type}.";
				if ( 'page_home.php' === $template_file ) {
					$message = 'The Home template does not support adding a page title.  You can change the template from the dropdown box in the Page Attributes section.';
				}
				echo <<<HTML
					<div id="boldgrid-hide-post-title" class="boldgrid-controls">
						<input style='display:none' type='checkbox' value='0' checked='checked' name='boldgrid-display-post-title'>
						<label>
						<input value="1" name="boldgrid-display-post-title" {$checked} {$disabled} type='checkbox'> Display
						 $post_type  title </label><span class="dashicons dashicons-editor-help"></span>
						<div class='boldgrid-tooltip'>
							<div class="boldgrid-tooltip-arrow">
							</div>
							<div class="boldgrid-tooltip-inner">
								{$message}
							</div>
						</div>
					</div>
HTML;
		} );
	}
}
?>
