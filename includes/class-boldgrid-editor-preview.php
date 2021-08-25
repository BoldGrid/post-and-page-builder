<?php
/**
 * File: class-boldgrid-editor-preview.php
 *
 * Creates a preview page used for checking content width & page styles.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Preview
 *
 * Creates a preview page used for checking content width & page styles.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Preview {

	public function __construct() {
		$this->preview_page_id = Boldgrid_Editor_Option::get( 'preview_page_id' );
	}

	/**
	 * Load all hooks.
	 *
	 * @since 1.6
	 */
	public function init() {
		add_filter( 'parse_query', array( $this, 'hide_page_listing' ) );
		add_action( 'template_redirect', array( $this, 'restrict_access' ) );

		// Wrapping in permission check to make sure it only runs for logged in users.
		if ( current_user_can( 'edit_posts' ) ) {
			add_action( 'init', array( $this, 'preload' ) );
			add_action( 'template_include', array( $this, 'set_dynamic_template' ), 5 );
			add_action( 'template_include', array( $this, 'template_via_url' ), 6 );
			add_action( 'load-post-new.php', array( $this, 'on_editor_load' ) );
			add_action( 'load-post.php', array( $this, 'on_editor_load' ) );
			add_filter( 'the_content', array(  $this, 'override_post_content' ) );
			add_filter( 'Boldgrid\Editor\Media\Layout\exludedPosts', array( $this, 'remove_gridblock' ) );
		}
	}

	/**
	 * Run hooks only on editor.
	 *
	 * @since 1.6
	 */
	public function on_editor_load() {
		$this->create_post();
	}

	/**
	 * Prevent this page from being parsed for gridblocks.
	 *
	 * @since 1.6
	 *
	 * @param  array $filtered_pages Pages to be excluded.
	 * @return array                 Pages to be excluded.
	 */
	public function remove_gridblock( $filtered_pages ) {
		$filtered_pages[] = $this->preview_page_id;

		return $filtered_pages;
	}

	/**
	 * Override the post content for this post.
	 *
	 * @global $post.
	 *
	 * @param  string $content Content.
	 * @return string          Content.
	 */
	public function override_post_content( $content ) {
		global $post;

		if ( ! empty( $post->ID ) && $post->ID === $this->preview_page_id ) {
			$file = BOLDGRID_EDITOR_PATH . '/includes/template/gridblock/sample-gridblock.html';
			$content = Boldgrid_Editor_Service::get( 'file_system' )
				->get_wp_filesystem()
				->get_contents( $file );
		}

		return $content;
	}

	/**
	 * Delete the post.
	 *
	 * @since 1.6
	 *
	 * @return mixed Deletion status.
	 */
	public static function delete_post() {
		$preview_page_id = Boldgrid_Editor_Option::get( 'preview_page_id' );

		if ( $preview_page_id ) {
			Boldgrid_Editor_Option::delete( 'preview_page_id' );
			return wp_delete_post( $preview_page_id, true );
		}
	}

	/*
	 * Create preview post.
	 *
	 * @since 1.6
	 */
	public function create_post() {
		if ( ! $this->preview_page_id ) {
			$page_id = wp_insert_post( array(
				'post_title' => 'Block Preview Page',
				'post_type'=> 'page',
				'post_status' => 'draft',
			) );

			if ( $page_id ) {
				$this->preview_page_id = $page_id;
				Boldgrid_Editor_Option::update( 'preview_page_id', $page_id );
			}
		}
	}

	/**
	 * Prevent users who are not logged in from viewing the page.
	 *
	 * @global $post.
	 *
	 * @since 1.6
	 */
	public function restrict_access() {
		global $post;

		if ( ! empty( $post->ID ) && $post->ID === $this->preview_page_id ) {
			if ( ! current_user_can( 'edit_posts' ) ) {
				wp_redirect( home_url(), 301 );
				exit;
			}
		}
	}

	/**
	 * Adjust the template used.
	 *
	 * @global $post.
	 *
	 * @since 1.6
	 *
	 * @return string Template Path.
	 */
	public function set_dynamic_template( $template ) {
		global $post;

		if ( $post && $post->ID === $this->preview_page_id && 'page' === $post->post_type ) {
			$templater = Boldgrid_Editor_Service::get( 'templater' );
			$template_choice = Boldgrid_Editor_Setup::get_template_choice();
			if ( $templater->is_custom_template( $templater->get_template_slug( $template_choice ) ) ) {
				$template = $templater->get_full_path( $template_choice );

				Boldgrid_Editor_Templater::update_content_width();
			}
		}

		return $template;
	}

	/**
	 * Set the users template via a url param. Only works if user can edit and requested via editor.
	 *
	 * @since 1.6
	 *
	 * @param  string $template
	 * @return string           Template name.
	 */
	public function template_via_url( $template ) {
		global $post;

		$template_choice = ! empty( $_GET['template_choice'] ) ? $_GET['template_choice'] : false;

		if ( $post && self::is_template_via_url() ) {
			$template_choice = ( 'default' === $template_choice ) ? 'page.php' : $template_choice;
			$template_path = locate_template( $template_choice );
			$template_path = ! ( $template_path ) ?  locate_template( 'index.php' ) : $template_path;

			if ( Boldgrid_Editor_Service::get( 'templater' )->is_custom_template( $template_choice ) ) {
				$template = $template_choice;
			} else if ( $template_path ) {
				$template = $template_path;
			}
		}

		return $template;
	}

	/**
	 * Check if the user has enabled template via url.
	 *
	 * @since 1.6
	 *
	 * @return boolean Is template via URL.
	 */
	public static function is_template_via_url() {
		$preview_page = ! empty( $_GET['bg_preview_page'] ) ? intval( $_GET['bg_preview_page'] ) : false;
		$template_choice = ! empty( $_GET['template_choice'] ) ? $_GET['template_choice'] : false;

		return $preview_page && $template_choice;
	}

	/**
	 * Before loading this page on the front end. Run this process.
	 *
	 * @since 1.6
	 */
	public function preload() {
		if ( ! is_admin() ) {

			$post_id = ! empty( $_GET['bg_post_id'] ) ? intval( $_GET['bg_post_id'] ) : false;
			$post = get_post( $post_id );

			if ( $post && $post->ID === $this->preview_page_id ) {
				$this->set_dynamic_posttype( $post );
			}
		}
	}

	/**
	 * Given a is post parameter, toggle the page to a post to simulate container widths.
	 *
	 * @since 1.6
	 */
	public function set_dynamic_posttype( $post ) {
		$is_post = ! empty( $_GET['bg_is_post'] ) ? intval( $_GET['bg_is_post'] ) : false;
		$post_type = $post->post_type;
		$new_post_type = false;

		if ( $is_post && 'page' === $post_type ) {
			$new_post_type = 'post';
		} else if ( ! $is_post && 'page' !== $post_type ) {
			$new_post_type = 'page';
		}

		if ( $new_post_type ) {
			$post->post_type = $new_post_type;
			wp_update_post( $post );
		}
	}

	/**
	 * Remove our preview page from 'All Pages'.
	 *
	 * @since 1.6
	 *
	 * @param $query The
	 *        	query object that parsed the query. @link
	 *        	https://codex.wordpress.org/Plugin_API/Action_Reference/parse_query.
	 */
	public function hide_page_listing( $query ) {
		// Get the current page filename:
		global $pagenow;

		$post_type = ! empty( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : false;

		// Abort if necessary.
		if ( 'edit.php' !== $pagenow && 'page' !== $post_type ) {
			return;
		}

		$post_not_in = $query->get( 'post__not_in' );
		$post_not_in = is_array( $post_not_in ) ? $post_not_in : array();

		// Other plugins may set 'post__not_in' as well, and override our setting below.
		// We'll use array_merge and $query->get so to play nice with other plugins.
		$query->set( 'post__not_in', array_merge( array ( $this->preview_page_id ), $post_not_in ) );
	}

	/**
	 * Preview page id.
	 *
	 * @var integer
	 *
	 * @since 1.6
	 */
	protected $preview_page_id;
}
