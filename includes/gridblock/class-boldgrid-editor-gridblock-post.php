<?php
/**
* Class: Boldgrid_Editor_Gridblock_Post
*
* Manage GridBlock as a custom post type.
*
* @since      1.6
* @package    Boldgrid_Editor
* @subpackage Boldgrid_Editor_Gridblock
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

/**
 * Class: Boldgrid_Editor_Gridblock_Post
*
* Manage GridBlock as a custom post type.
*
* @since      1.6
*/
class Boldgrid_Editor_Gridblock_Post {

	public function __construct( $configs ) {
		$this->configs = $configs;
	}

	/**
	 * Add page menu items to Post and Page Builder Menu.
	 *
	 * @since 1.7.0
	 */
	public function add_menu_items() {
		add_submenu_page(
			'edit.php?post_type=bg_block',
			__( 'All Pages', 'boldgrid-editor' ),
			__( 'All Pages', 'boldgrid-editor' ),
			'edit_pages',
			'edit.php?post_type=page'
		);

		add_submenu_page(
			'edit.php?post_type=bg_block',
			__( 'Add New Page', 'boldgrid-editor' ),
			__( 'Add New Page', 'boldgrid-editor' ),
			'edit_pages',
			'post-new.php?post_type=page'
		);
	}

	/**
	 * UI Labels.
	 *
	 * @since 1.6
	 *
	 * @return array Labels of the GridBlocks.
	 */
	protected function get_type_labels() {
		return array(
			'name'                => _x( 'Block Library', 'Post Type General Name', 'boldgrid-editor' ),
			'singular_name'       => _x( 'Block', 'Post Type Singular Name', 'boldgrid-editor' ),
			'menu_name'           => __( 'Post and Page Builder', 'boldgrid-editor' ),
			'parent_item_colon'   => __( 'Parent Block', 'boldgrid-editor' ),
			'all_items'           => __( 'Block Library', 'boldgrid-editor' ),
			'view_item'           => __( 'View Block', 'boldgrid-editor' ),
			'add_new_item'        => __( 'Add New Block', 'boldgrid-editor' ),
			'add_new'             => __( 'Add New Block', 'boldgrid-editor' ),
			'edit_item'           => __( 'Edit Block', 'boldgrid-editor' ),
			'update_item'         => __( 'Update Block', 'boldgrid-editor' ),
			'search_items'        => __( 'Search Block', 'boldgrid-editor' ),
			'not_found'           => __( 'Not Found', 'boldgrid-editor' ),
			'not_found_in_trash'  => __( 'Not found in Trash', 'boldgrid-editor' ),
		);
	}

	/**
	 * Get the arguments used to create the custom post type.
	 *
	 * @since 1.6
	 *
	 * @return array Custom post type args, See: https://codex.wordpress.org/Function_Reference/register_post_type.
	 */
	protected function get_type_args() {
		return array(
			'label'               => __( 'bg-block', 'boldgrid-editor' ),
			'description'         => __( 'My Blocks', 'boldgrid-editor' ),
			'labels'              => $this->get_type_labels(),
			'menu_icon'           => 'dashicons-edit',
			'rewrite'             => array( 'slug' => 'bg-block' ),
			'supports'            => array(
				'title',
				'editor',
				// 'author',
				'revisions',
				'custom-fields'
			),
			'taxonomies'          => array( 'bg_block_type' ),
			'hierarchical'        => false,
			'show_ui'             => true,
			'show_in_rest'        => true,
			// 'show_in_menu'        => false,
			// 'show_in_admin_bar'   => false,
			'menu_position'       => 60,
			'public'              => true,
			// 'query_var'           => true,
			// 'publicly_queryable'  => true,
			'exclude_from_search' => true,
		);
	}

	/**
	 * Grab post type args and register the post.
	 *
	 * @since 1.6
	 */
	public function register_post_type() {
		$args = $this->get_type_args();

		// create a new taxonomy
		register_taxonomy(
			'bg_block_type',
			'bg_block',
			array(
				'rewrite' => array( 'slug' => 'bg-block-types' ),
				'label' => __( 'Block Types' ),
				'show_admin_column' => true,
				'show_in_menu' => false,
				'show_in_rest' => true,
				'show_in_nav_menus' => false,
				'description' => 'Block Types'
			)
		);

		// Registering your Custom Post Type
		register_post_type( 'bg_block', $args );

		// Flush rewrite rules if we haven't done so already.
		if ( ! Boldgrid_Editor_Option::get( 'has_flushed_rewrite' ) ) {
			Boldgrid_Editor_Option::update( 'has_flushed_rewrite', true );
			flush_rewrite_rules();
		}
	}

	/**
	 * When viewing a gridblock, set the post type to full width.
	 *
	 * @since 1.6
	 *
	 * @param string $template
	 */
	public function set_template( $template ) {
		global $post;

		if ( $post && 'bg_block' === $post->post_type ) {

			if ( ! Boldgrid_Editor_Service::get( 'main' )->get_is_boldgrid_theme()  ) {
				$templater = Boldgrid_Editor_Service::get( 'templater' );
				$template = $templater->get_full_path( 'fullwidth' );
				$templater->add_template_filters();
			} else {
				add_filter( 'boldgrid/display_sidebar', '__return_false' );
			}
		}

		return $template;
	}

	/**
	 * Prevent non authors from viewing GridBlocks.
	 *
	 * @since 1.6
	 */
	public function restrict_public_access() {
		global $post;
		$post_type = ! empty( $post->post_type ) ? $post->post_type : false;
		if ( 'bg_block' === $post_type && ! current_user_can( 'edit_posts' ) ) {
			wp_redirect( home_url(), 301 );
			exit;
		}
	}

	/**
	* Check the filter we are currently running through and hook in if needed.
	*
	* Reason: This plugin loads in different hooks depending on were it's running from. In admin
	* it runs on init and cannot be added to the init hook. Will not change load order because
	* it may cause some hard to track down bugs.
	*
	* @since 1.6
	*/
	public function add_hooks() {
		if ( 'init' === current_filter() ) {
			$this->register_post_type();
		} else {
			add_action( 'init', array ( $this, 'register_post_type' ) );
		}

		add_action( 'admin_menu', array( $this, 'add_menu_items' ) );
		add_action( 'template_include', array( $this, 'set_template' ) );
		add_action( 'template_redirect', array( $this, 'restrict_public_access' ) );
	}
}
