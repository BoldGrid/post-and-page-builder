<?php
/**
 * File: class-boldgrid-editor-templater.php
 *
 * Registers custom templates.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Templater
 *
 * Registers custom templates.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Templater {

	/**
	 * A reference to an instance of this class.
	 */
	private static $instance;

	/**
	 * The array of templates that this plugin tracks.
	 *
	 * @since 1.6
	 */
	public $templates = array(
		'template/page/fullwidth.php' => 'BoldGrid - Full Width',
		'template/page/left-sidebar.php' => 'BoldGrid - Left Sidebar',
		'template/page/right-sidebar.php' => 'BoldGrid - Right Sidebar',
		'template/page/content-only.php' => 'Content Only'
	);

	/**
	 * Initializes the plugin by setting filters and administration functions.
	 *
	 * @since 1.6
	 */
	public function init() {

		// Add a filter to the attributes metabox to inject template into the cache.
		if ( version_compare( floatval( get_bloginfo( 'version' ) ), '4.7', '<' ) ) {

			// 4.6 and older
			add_filter(
				'page_attributes_dropdown_pages_args',
				array( $this, 'register_project_templates' )
			);

		} else {

			// Add a filter to the wp 4.7 version attributes metabox
			add_filter(
				'theme_page_templates', array( $this, 'add_new_template' )
			);

		}

		// Add a filter to the save post to inject out template into the page cache
		add_filter(
			'wp_insert_post_data',
			array( $this, 'register_project_templates' )
		);

		// Add a filter to the template include to determine if the page has our
		// template assigned and return it's path
		add_filter( 'template_include', array( $this, 'view_project_template') );

		add_action( 'add_meta_boxes_page', array( $this, 'set_default_metabox' ), 1 );
		add_action( 'posts_selection', array( $this, 'set_content_width' ) );
	}

	/**
	 * If editting a post that has the template set to an editor template, set content width.
	 *
	 * @since 1.7.0
	 */
	public function set_content_width() {
		global $post;
		global $pagenow;

		if ( is_admin() &&
			$pagenow &&
			'post.php' === $pagenow &&
			! empty( $post ) &&
			in_array( $post->post_type, array( 'page', 'bg_block' ) ) ) {

			if ( $this->is_custom_template( $post->page_template ) || 'bg_block' === $post->post_type ) {
				self::update_content_width();
			}
		}
	}

	/**
	 * Update content width.
	 *
	 * @since 1.7.0
	 */
	public static function update_content_width() {
		global $content_width;

		$config = Boldgrid_Editor_Service::get( 'config' );
		$content_width = $config['templates']['default_content_width'];
	}

	/**
	 * Is the passed template a custom template?
	 *
	 * @since 1.6
	 * @param  string  $name Name of template.
	 * @return boolean       Is the passed template a custom template?
	 */
	public function is_custom_template( $name ) {
		return ! empty( $this->templates[ $name ] );
	}

	/**
	 * Set the page meta box default value to the users choice.
	 *
	 * @since 1.6
	 */
	public function set_default_metabox() {
		global $post;
		global $pagenow;

		$template_choice = Boldgrid_Editor_Setup::get_template_choice();

		if ( 'page' === $post->post_type
			&& $template_choice
			&& 'default' !== $template_choice
			&& 'post-new.php' === $pagenow
			&& 0 !== count( get_page_templates( $post ) )

			// Not the page for listing posts.
			&& get_option( 'page_for_posts' ) != $post->ID
			&& '' == $post->page_template // Only when page_template is not set
		) {
			$post->page_template = $this->get_template_slug( $template_choice );
			self::update_content_width();
		}
	}

	/**
	 * Get template path, given name.
	 *
	 * @since 1.6
	 *
	 * @param  string $template_name Name of template.
	 * @return string                Template name.
	 */
	public function get_template_slug( $template_name ) {
		return 'template/page/' . $template_name . '.php';
	}

	/**
	 * Get full path to a template file given name.
	 *
	 * @since 1.6
	 *
	 * @param  string $template_name Name of template.
	 * @return string                Template ppath.
	 */
	public function get_full_path( $template_name ) {
		$template_path = BOLDGRID_EDITOR_PATH . '/includes/';
		return $template_path . $this->get_template_slug( $template_name );
	}

	/**
	 * Adds our template to the page dropdown for v4.7+
	 *
	 */
	public function add_new_template( $posts_templates ) {
		$posts_templates = array_merge( $posts_templates, $this->templates );
		return $posts_templates;
	}

	/**
	 * Adds our template to the pages cache in order to trick WordPress
	 * into thinking the template file exists where it doens't really exist.
	 */
	public function register_project_templates( $atts ) {

		// Create the key used for the themes cache
		$cache_key = 'page_templates-' . md5( get_theme_root() . '/' . get_stylesheet() );

		// Retrieve the cache list.
		// If it doesn't exist, or it's empty prepare an array
		$templates = wp_get_theme()->get_page_templates();
		if ( empty( $templates ) ) {
			$templates = array();
		}

		// New cache, therefore remove the old one
		wp_cache_delete( $cache_key , 'themes' );

		// Now add our template to the list of templates by merging our templates
		// with the existing templates array from the cache.
		$templates = array_merge( $templates, $this->templates );

		// Add the modified cache to allow WordPress to pick it up for listing
		// available templates
		wp_cache_add( $cache_key, $templates, 'themes', 1800 );

		return $atts;

	}

	/**
	 * Checks if the template is assigned to the page
	 */
	public function view_project_template( $template ) {

		// Get global post
		global $post;
		global $wp_query;

		if ( ! empty( $wp_query->is_search ) ) {
			return $template;
		}

		$is_custom_template = $this->is_custom_template( $template );

		// We rendered this page automatically in an iframe for window width && it is not a BG template.
		if ( ! $is_custom_template && Boldgrid_Editor_Preview::is_template_via_url() ) {
			return $template;
		}

		// Return template if post is empty
		if ( ! $post || ! $post->ID ) {
			return $template;
		}

		$post_id = $post->ID;
		$post_meta = get_page_template_slug( $post_id );

		if ( ! empty( $_GET['preview'] ) && 'true' === $_GET['preview'] ) {
			$preview_meta = Boldgrid_Editor_Option::get( 'preview_meta' );
			$post_meta = isset( $preview_meta['template'] ) ? $preview_meta['template'] : false;
		}

		// If this template passed in by the hook is one of our templates, override post meta.
		if ( $is_custom_template ) {
			$post_meta = $template;
		}

		// Return default template if we don't have a custom one defined
		if ( ! isset( $this->templates[ $post_meta ] ) ) {
			return $template;
		}

		$file = BOLDGRID_EDITOR_PATH . '/includes/' . $post_meta;

		// Just to be safe, we check if the file exist first
		if ( file_exists( $file ) ) {
			$template = $file;
			$this->add_template_filters();
		}

		// Return template
		return $template;

	}

	/**
	 * Add filters and hooks that only occur when a BG template is used.
	 *
	 * @since 1.6
	 */
	public function add_template_filters() {
		self::update_content_width();

		add_filter( 'body_class', array( $this, 'add_body_class' ), 30 );
		add_filter( 'wp_calculate_image_sizes', array( $this, 'default_srcset' ), 40 );

		do_action( 'boldgrid_editor_template' );
	}

	/**
	 * Return the default size attribute set for out templates.
	 *
	 * @since 1.6
	 *
	 * @param string $sizes
	 */
	public function default_srcset( $sizes ) {
		return '';
	}

	/**
	 * Add body class when editor template is used.
	 *
	 * @since 1.6
	 *
	 * @param array $classes array of classes.
	 */
	public function add_body_class( $classes ) {
		$classes[] = 'boldgrid-editor-template';
		return $classes;
	}

}
