<?php
/**
 * BoldGrid Source Code
 *
 * @package Boldgrid_Editor
 * @copyright BoldGrid.com
 * @version $Id$
 * @author BoldGrid.com <wpb@boldgrid.com>
 */
include __DIR__ . '/loader.php';

/**
 * Post and Page Builder class
 */
class Boldgrid_Editor {

	/**
	 * Post and Page Builder Config object
	 *
	 * @var Boldgrid_Editor_Config
	 */
	private $config;

	/**
	 * A full array of tab configurations
	 *
	 * @var array
	 */
	private $tab_configs;

	/**
	 * Path configurations used for the plugin
	 */
	private $path_configs;

	/**
	 * Is the current page theme a BoldGrid theme?
	 *
	 * @var bool
	 */
	private $is_boldgrid_theme = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->is_boldgrid_theme = Boldgrid_Editor_Theme::is_editing_boldgrid_theme();

		$config = new Boldgrid_Editor_Config();
		$this->set_config( $config );
		$tab_configs = require BOLDGRID_EDITOR_PATH . '/includes/config/layouts.php';
		$tab_configs = apply_filters( 'boldgrid-media-modal-config', $tab_configs );
		$this->set_tab_configs( $tab_configs );

		$plugin_filename = BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php';

		$path_configs = array (
			'plugin_dir' => BOLDGRID_EDITOR_PATH,
			'plugin_filename' => $plugin_filename
		);
		$this->set_path_configs( $path_configs );

		Boldgrid_Editor_Service::register( 'config', $config->get_configs() );
	}

	/**
	 * Run the plugin hooks and registration process.
	 *
	 * @since 1.6
	 */
	public function run() {
		$this->add_hooks();
		$this->prepare_plugin_update();
	}

	/**
	 * Bind hooks, admin or otherwise.
	 *
	 * @since 1.2.7
	 */
	public function add_hooks() {
		Boldgrid_Editor_Service::register( 'templater', new Boldgrid_Editor_Templater() );

		if ( ! $this->is_boldgrid_theme ) {
			Boldgrid_Editor_Service::get( 'templater' )->init();

			$widget = new Boldgrid_Editor_Widget();
			$widget->init();
		} else {

			// Load boldgrid theme framework hooks.
			$bgtfw_template = new Boldgrid_Editor_BGTFW_Template();
			$bgtfw_template->init();
		}

		$boldgrid_gridblock_post = new Boldgrid_Editor_Gridblock_Post( $this->config->get_configs() );
		$boldgrid_gridblock_post->add_hooks();

		$boldgrid_gridblock_postmeta = new Boldgrid_Editor_Postmeta();
		$boldgrid_gridblock_postmeta->init();

		Boldgrid_Editor_Service::register( 'preview_page', new Boldgrid_Editor_Preview() );
		Boldgrid_Editor_Service::get( 'preview_page' )->init();

		Boldgrid_Editor_Service::register( 'file_system', new Boldgrid_Editor_Fs() );

		$this->setup_components();
		$this->setup_page_title();

		if ( is_admin() && current_user_can( 'edit_pages' ) ) {
			$this->add_admin_hooks();
		}

		if ( ! is_admin() ) {
			$this->front_end_hooks();
		}

	}

	public function setup_components() {
		$shortcode = new Boldgrid_Components_Shortcode();
		$shortcode->init();
	}

	/**
	 * Setup the page title control.
	 *
	 * @since 1.6
	 */
	public function setup_page_title() {
		$configs = $this->config->get_configs();

		$configs['controls']['page_title']['enabled'] = ! $this->is_boldgrid_theme;

		Boldgrid_Editor_Service::register(
			'page_title',
			new Boldgrid_Controls_Page_Title( $configs['controls']['page_title'] )
		);

		Boldgrid_Editor_Service::get( 'page_title' )->init();
	}

	/**
	 * Attach all front end hooks.
	 *
	 * @since 1.2.7
	 */
	public function front_end_hooks() {
		$builder_fonts          = new Boldgrid_Editor_Builder_Fonts();
		$theme                  = new Boldgrid_Editor_Theme();
		$boldgrid_editor_assets = new Boldgrid_Editor_Assets( $this->config->get_configs() );

		add_action( 'wp_enqueue_scripts', array( $boldgrid_editor_assets,'front_end' ), 999 );
		add_filter( 'boldgrid_theme_framework_config', array( 'Boldgrid_Editor_Theme', 'remove_theme_container' ), 50 );
		add_action( 'wp_head', array ( $builder_fonts, 'render_page_fonts' ) );
		add_action( 'body_class', array ( $theme, 'add_body_class' ) );
	}

	/**
	 * Attach all admin hooks.
	 *
	 * @since 1.0
	 *
	 * @global $wp_customize.
	 */
	public function add_admin_hooks() {
		global $wp_customize;

		$boldgrid_editor_ajax      = new Boldgrid_Editor_Ajax();
		$boldgrid_editor_assets    = new Boldgrid_Editor_Assets( $this->config->get_configs() );
		$boldgrid_editor_builder   = new Boldgrid_Editor_Builder();
		$builder_styles            = new Boldgrid_Editor_Builder_Styles();
		$boldgrid_editor_mce       = new Boldgrid_Editor_MCE( $this->config );
		$boldgrid_editor_media     = new Boldgrid_Editor_Media();
		$boldgrid_editor_theme     = new Boldgrid_Editor_Theme();
		$boldgrid_editor_version   = new Boldgrid_Editor_Version();
		$boldgrid_editor_media_map = new Boldgrid_Editor_Media_Map();
		$boldgrid_editor_wpforms   = new Boldgrid_Editor_Wpforms();
		$boldgrid_editor_setup     = new Boldgrid_Editor_Setup();
		$boldgrid_editor_premium   = new Boldgrid_Editor_Premium();

		// Init Form deps.
		$boldgrid_editor_wpforms->init();
		$boldgrid_editor_premium->init();

		// Upgrade old versions of maps.
		add_action( 'admin_init', array( $boldgrid_editor_media_map, 'upgrade_maps' ) );

		$valid_pages = array (
			'post.php',
			'post-new.php',
			'media-upload.php'
		);

		$script_name = ! empty( $_SERVER['SCRIPT_NAME'] ) ? $_SERVER['SCRIPT_NAME'] : false;
		$page_name = basename( $script_name );
		$edit_post_page = in_array( $page_name, $valid_pages );
		if ( $edit_post_page ) {
			$current_post_id = ! empty( $_REQUEST['post'] ) ? $_REQUEST['post'] : null;
			$current_post = get_post( $current_post_id );

			/*
			 * Determine the current post type.
			 *
			 * The post type is "post", unless specified by $current_post->post_type or
			 * $_GET['post_type'].
			 */
			if( ! empty( $current_post->post_type ) ) {
				$current_post_type = $current_post->post_type;
			} elseif( isset( $_GET['post_type'] ) ) {
				$current_post_type = $_GET['post_type'];
			} else {
				$current_post_type = 'post';
			}

			// Currently only pages and posts are supported. @since 1.3.1
			if ( ! in_array( $current_post_type, $this->config->get_configs( 'allowed_post_types' ) ) ) {
				return false;
			}

			$is_boldgrid_theme = Boldgrid_Editor_Theme::is_editing_boldgrid_theme();
			$this->set_is_boldgrid_theme( $is_boldgrid_theme );

			add_action( 'load-post.php', array( $boldgrid_editor_builder, 'add_help_tab' ) );
			add_action( 'load-post-new.php', array( $boldgrid_editor_builder, 'add_help_tab' ) );

			add_action( 'save_post', array( $boldgrid_editor_builder, 'save_colors' ), 10, 2  );
			add_action( 'save_post', array( $boldgrid_editor_builder, 'record_feedback' ), 10, 2  );
			add_action( 'edit_form_after_title', array( $boldgrid_editor_builder, 'post_inputs' ) );
			add_action( 'save_post', array( $boldgrid_editor_builder, 'save_container_meta' ), 10, 2  );
			add_action( 'save_post', array( $builder_styles, 'save' ), 10, 2  );

			add_action( 'media_buttons', array( $boldgrid_editor_mce, 'load_editor_hooks' ) );
			add_action( 'media_buttons', array( $boldgrid_editor_builder, 'enqueue_styles' ) );

			// Display and save admin notice state.
			add_action( 'admin_init', array( $boldgrid_editor_setup, 'reset_editor_action' ) );
			add_action( 'shutdown', array ( $boldgrid_editor_version, 'save_notice_state' ) );

			// Create media modal tabs.
			$configs = array_merge( $this->get_path_configs(), $this->get_tab_configs() );
			$boldgrid_editor_media->create_tabs( $configs, $is_boldgrid_theme );

			// Add screen display buttons.
			$boldgrid_editor_mce->add_window_size_buttons();

			// This has a high priority to override duplicate files in other boldgrid plugins.
			add_action( 'admin_enqueue_scripts', array( $boldgrid_editor_assets, 'enqueue_scripts_action' ), 5 );

			// Add ?boldgrid-editor-version=$version_number to each added file.
			add_filter( 'mce_css', array ( $boldgrid_editor_mce, 'add_cache_busting' ) );

			if ( 'media-upload.php' !== $page_name ) {
				add_action( 'admin_print_footer_scripts', array ( $boldgrid_editor_builder, 'print_scripts' ), 25 );
			}
		}

		if ( $edit_post_page || isset( $wp_customize ) ) {
			// Append Editor Styles.
			add_filter( 'tiny_mce_before_init', array ( $boldgrid_editor_mce, 'allow_empty_tags' ), 29 );
		}

		add_action( 'wp_ajax_boldgrid_canvas_image', array( $boldgrid_editor_ajax, 'upload_image_ajax' ) );
		add_action( 'wp_ajax_boldgrid_editor_setup', array( $boldgrid_editor_setup, 'ajax' ) );
		add_action( 'wp_ajax_boldgrid_editor_save_gridblock', array( $boldgrid_editor_ajax, 'save_gridblock' ) );
		add_action( 'wp_ajax_boldgrid_redirect_url', array( $boldgrid_editor_ajax, 'get_redirect_url' ) );
		add_action( 'wp_ajax_boldgrid_generate_blocks', array( $boldgrid_editor_ajax, 'generate_blocks' ) );
		add_action( 'wp_ajax_boldgrid_editor_save_key', array( $boldgrid_editor_ajax, 'save_key' ) );
		add_action( 'wp_ajax_boldgrid_get_saved_blocks', array( $boldgrid_editor_ajax, 'get_saved_blocks' ) );

		// Add Loading Graphic.
		add_filter( 'the_editor', function ( $html ) {
			$active = 'tinymce' ===  wp_default_editor() ? 'active' : 'disabled';
			return '<div class="bg-editor-loading-main ' . $active . '"><div class="bg-editor-loading"></div>' . $html . '</div>';
		} );

		// Save a users selection for enabling draggable.
		add_action( 'wp_ajax_boldgrid_draggable_enabled', array ( $boldgrid_editor_ajax, 'ajax_draggable_enabled' ) );

		$boldgrid_editor_crop = new Boldgrid_Editor_Crop();
		$boldgrid_editor_crop->add_hooks();
	}

	/**
	 * Get the Post and Page Builder configuration array.
	 *
	 * @since 1.3.3
	 *
	 * @static
	 *
	 * @return array
	 */
	public static function get_editor_configs() {
		require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-config.php';

		$config = new Boldgrid_Editor_Config();

		return $config->get_configs();
	}

	/**
	 * Prepare for the update class.
	 *
	 * @since 1.3.4
	 */
	public function prepare_plugin_update() {
		$is_cron = ( defined( 'DOING_CRON' ) && DOING_CRON );
		$is_wpcli = ( defined( 'WP_CLI' ) && WP_CLI );
		$file = BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-update.php';

		if ( file_exists( $file ) ) {
			if ( $is_cron || $is_wpcli || is_admin() ) {
				require_once $file;
				$plugin_update = new Boldgrid_Editor_Update( $this->config->get_configs() );
				$plugin_update->add_hooks();
			}
		}
	}

	/**
	 * Get $this->settings
	 *
	 * @return array
	 */
	public function get_config() {
		return $this->config;
	}

	/**
	 * Set $this->settings
	 *
	 * @return bool
	 */
	public function set_config( $config ) {
		$this->config = $config;
		return true;
	}

	/**
	 * Get $this->tab_configs
	 *
	 * @return array
	 */
	public function get_tab_configs() {
		return $this->tab_configs;
	}

	/**
	 * Set $this->tab_configs
	 *
	 * @return array
	 */
	public function set_tab_configs( $tab_configs ) {
		$this->tab_configs = $tab_configs;
		return true;
	}

	/**
	 * Get $this->path_configs
	 *
	 * @return array
	 */
	public function get_path_configs() {
		return $this->path_configs;
	}

	/**
	 * Set $this->path_configs
	 *
	 * @return bool
	 */
	public function set_path_configs( $path_configs ) {
		$this->path_configs = $path_configs;
		return true;
	}

	/**
	 * Get $this->is_boldgrid_theme
	 *
	 * @return array
	 */
	public function get_is_boldgrid_theme() {
		return $this->is_boldgrid_theme;
	}

	/**
	 * Set $this->is_boldgrid_theme
	 *
	 * @return bool
	 */
	public function set_is_boldgrid_theme( $is_boldgrid_theme ) {
		$this->is_boldgrid_theme = $is_boldgrid_theme;
		return true;
	}
}
