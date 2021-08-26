<?php
/**
 * Class: Boldgrid_Editor_Assets
 *
 * Handle enqueues of styles and scripts.
 *
 * @since	  1.2.3
 * @package	Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Assets
 * @author	 BoldGrid <support@boldgrid.com>
 * @link	   https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Assets
 *
 * Handle enqueues of styles and scripts.
 *
 * @since	  1.2.3
 */
class Boldgrid_Editor_Assets {

	public function __construct( $configs ) {
		return $this->configs = $configs;
	}

	/**
	 * Get minified or unminified asset suffix.
	 *
	 * @since 1.2.3
	 *
	 * @return string Minified or empty string.
	 */
	public static function get_asset_suffix() {
		return defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
	}

	/**
	 * Append min.js or .js to a string depending on whether or not script debug is on.
	 *
	 * @since 1.2.3
	 *
	 * @param string $script_name Path to file.
	 * @param string $type File Type.
	 *
	 * @return string Minified or empty string.
	 */
	public static function get_minified_js( $script_name, $type = '.js' ) {
		return $script_name . self::get_asset_suffix() . $type;
	}

	/**
	 * This is the action occur on the enqueue scripts action.
	 * Enqueues stylesheets and script for the editor page.
	 *
	 * @since 1.0
	 */
	public function enqueue_scripts_action() {
		global $pagenow;

		// "Not media-upload.php".
		if ( false === in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		$this->enqueue_scripts();
		$this->add_styles();
	}

	/**
	 * Get the site url or permalink whichever is found.
	 *
	 * @since 1.0
	 *
	 * @return string url.
	 */
	public function get_post_url() {
		global $pagenow;
		global $post;

		$is_post = false;
		$post_id = ! empty( $_REQUEST['post'] ) ? $_REQUEST['post'] : null;
		$post_type = ! empty( $_REQUEST['post_type'] ) ? $_REQUEST['post_type'] : null;

		// If this is a new page, use the preview page.
		if ( 'post-new.php' === $pagenow ) {
			$post_id = Boldgrid_Editor_Option::get( 'preview_page_id' );
			$is_post = ! intval( $post_type );
		}

		if ( $post ) {
			$is_post = ( 'post' === $post->post_type );
		}

		$permalink = ! empty( $post_id ) ? get_permalink( intval( $post_id ) ) : null;
		$permalink = ( $permalink ? $permalink : get_site_url() );

		$permalink = add_query_arg( array(
			'bg_preview_page' => 1,
			'bg_post_id' => $post_id,
			'bg_is_post' => $is_post,
		), $permalink );

		// Remove protocal.
		$permalink = self::remove_url_protocal( $permalink );

		return $permalink;
	}

	/**
	 * Remove protocal from the url.
	 *
	 * @since 1.6
	 *
	 * @param  string $permalink URL.
	 * @return string            Url with protocal removed.
	 */
	public static function remove_url_protocal( $permalink ) {
		return str_ireplace( array( 'http://', 'https://' ), '//', $permalink );
	}

	/**
	 * Get the URL for a weboack script.
	 *
	 * @since 1.9.0
	 *
	 * @param  string $name Filename.
	 * @return string       URL to file.
	 */
	public static function get_webpack_script( $name ) {
		$configs = Boldgrid_Editor_Service::get( 'config' );
		$script_url = plugins_url( '/assets/dist/' . $name . '.min.js', BOLDGRID_EDITOR_ENTRY );
		if ( self::is_webpack() ) {
			$script_url = $configs['development_server'] . '/' . $name . '.js';
		}

		return $script_url;
	}

	/**
	 * Enqueue a style added by webpack.
	 *
	 * @since 1.9.0
	 *
	 * @param  string $name Name of style.
	 */
	public static function enqueue_webpack_style( $name ) {
		if ( ! self::is_webpack() ) {
			wp_enqueue_style( 'bgppb-style-' . $name,
				plugins_url( '/assets/dist/' . $name . '.min.css', BOLDGRID_EDITOR_ENTRY ),
				array(), BOLDGRID_EDITOR_VERSION );
		}
	}

	/**
	 * Are we running in webpack?
	 *
	 * @since 1.9.0
	 *
	 * @return boolean Is this a webpack build?
	 */
	public static function is_webpack() {
		return ( defined( 'BGEDITOR_SCRIPT_DEBUG' ) && BGEDITOR_SCRIPT_DEBUG );
	}

	/**
	 * Enqueue Styles to the front end of the site.
	 *
	 * @since 1.2.7
	 */
	public function front_end() {
		// Parallax.
		// @TODO only enqueue if the user is using this.
		wp_enqueue_script( 'boldgrid-parallax',
			plugins_url( '/assets/js/jquery-stellar/jquery.stellar.js', BOLDGRID_EDITOR_ENTRY ),
		array( 'jquery' ),BOLDGRID_EDITOR_VERSION, true );

		wp_enqueue_script(
			'boldgrid-editor-public', self::get_webpack_script( 'public' ),
		array( 'jquery' ), BOLDGRID_EDITOR_VERSION, true );

		wp_enqueue_style( 'animatecss',
			plugins_url( '/assets/css/animate.min.css', BOLDGRID_EDITOR_ENTRY ),
			array(), BOLDGRID_EDITOR_VERSION );

		// Enqueue Styles that which depend on version.
		$this->enqueue_latest();

		if ( ! Boldgrid_Editor_Service::get( 'main' )->get_is_boldgrid_theme() ) {
			wp_enqueue_style( 'boldgrid-fe',
				plugins_url( '/assets/css/editor-fe.min.css', BOLDGRID_EDITOR_ENTRY ),
				array(), BOLDGRID_EDITOR_VERSION );

			// The editor bundle includes base bootstrap styles.
			wp_dequeue_style( 'bootstrap-styles' );
		}

		// Control Styles.
		$style_url = Boldgrid_Editor_Builder_Styles::get_url_info();
		if ( $style_url['url'] ) {
			wp_enqueue_style( 'boldgrid-custom-styles', $style_url['url'], array(), $style_url['timestamp'] );
		}

		// Buttons.
		$builder = new Boldgrid_Editor_Builder();
		if ( $builder->requires_deprecated_buttons() ) {
			wp_enqueue_style( 'boldgrid-buttons',
			plugins_url( '/assets/css/buttons.min.css', BOLDGRID_EDITOR_ENTRY ),
			array(), BOLDGRID_EDITOR_VERSION );
		}

		/*
		 * Fired after the Post and Page Builder enqueues it's public scripts.
		 *
		 * @since 1.8.0
		 */
		do_action( 'boldgrid_editor_scripts_public' );
	}

	/**
	 * Check the version of an already enqueued stylesheet to make sure the latest version is enqueued.
	 *
	 * @since 1.5.
	 */
	public function enqueue_latest() {
		global $wp_styles;

		foreach ( $this->configs['conflicting_assets'] as $component ) {

			$version = ! empty( $wp_styles->registered[ $component['handle'] ]->ver )
				? $wp_styles->registered[ $component['handle'] ]->ver : false;

			if ( $version && version_compare( $version, $component['version'], '<' ) ) {
				wp_deregister_style( $component['handle'] );
			}

			wp_enqueue_style(
				$component['handle'],
				$component['src'],
				$component['deps'],
				$component['version']
			);
		}
	}

	/**
	 * Get the JS var's to be passed into the builder.
	 *
	 * @since 1.6
	 *
	 * @global $is_IE.
	 * @global $post.
	 * @global $pagenow.
	 *
	 * @return array List of variables to be passed.
	 */
	public function get_js_vars() {
		global $is_IE, $post, $pagenow, $shortcode_tags;

		$fs = Boldgrid_Editor_Service::get( 'file_system' )->get_wp_filesystem();
		$post_type = $post ? $post->post_type : '';
		$default_tab = wp_default_editor();
		$is_bg_theme = Boldgrid_Editor_Theme::is_editing_boldgrid_theme();

		$builder = new Boldgrid_Editor_Builder();
		$config = Boldgrid_Editor_Service::get( 'config' );
		$boldgrid_settings = Boldgrid_Editor_Config::get_mixed_option( 'boldgrid_settings' );
		$boldgrid_settings = $boldgrid_settings ? $boldgrid_settings : array();
		$boldgrid_settings['api_key'] = $config['api_key'];

		/*
		 * Since we are removing the 'Add Block' functionality from Crio Page Headers,
		 * we need to make sure to also bypass the 'display_gridblock_lead' on Crio Page Header
		 * post types
		 */
		$display_gridblock_lead = 'post-new.php' === $pagenow && 'tinymce' === $default_tab;
		$screen = get_current_screen();
		if ( $screen && isset( $screen->post_type ) && 'crio_page_header' === $screen->post_type ) {
			$display_gridblock_lead = false;
		}

		/*
		 * Contributors are not able to see the Add Block button.
		 * due to a wp_core bug. Until that gets fixed, we need to bypass the
		 * 'display_gridblock_lead' for contributors.
		 */
		if ( ! current_user_can( 'upload_files' ) ) {
			$display_gridblock_lead = false;
		}

		$shortcode_keys = array_keys( $shortcode_tags );

		if ( ! in_array( 'weforms', $shortcode_keys ) ) {
			$shortcode_keys[] = 'weforms';
		}

		$vars = array(
			'is_boldgrid_theme' => $is_bg_theme,
			'is_add_new' => 'post-new.php' === $pagenow,
			'body_class' => Boldgrid_Editor_Theme::theme_body_class(),
			'post' => ( array ) $post,
			'post_id' => $this->get_post_id(),
			'post_type' => $post_type,
			'is_boldgrid_template' => Boldgrid_Editor_Service::get( 'templater' )->is_custom_template( $post->page_template ),
			'site_url' => $this->get_post_url(),
			'claim_envato_key' => apply_filters( 'Boldgrid\Library\Library\Notice\ClaimPremiumKey_enable', false ),
			'is_IE' => $is_IE,
			'version' => BOLDGRID_EDITOR_VERSION,
			//'hasDraggableEnabled' => Boldgrid_Editor_MCE::has_draggable_enabled(),
			'hasDraggableEnabled' => true,
			'inspiration_active' => defined( 'BOLDGRID_INSPIRATIONS_VERSION' ),
			'default_tab' => wp_default_editor(),
			'draggableEnableNonce' => wp_create_nonce( 'boldgrid_draggable_enable' ),
			'setupNonce' => wp_create_nonce( 'boldgrid_editor_setup' ),
			'icons' => json_decode( $fs->get_contents( BOLDGRID_EDITOR_PATH . '/assets/json/font-awesome.json' ), true ),
			'images' => Boldgrid_Editor_Builder::get_post_images(),
			'colors' => Boldgrid_Editor_Theme::get_color_palettes(),
			'saved_colors' => Boldgrid_Editor_Option::get( 'custom_colors', array() ),
			'block_default_industry' => Boldgrid_Editor_Option::get( 'block_default_industry' ),
			'internalPageTemplates' => Boldgrid_Editor_Service::get( 'templater' )->templates,
			'sample_backgrounds' => Boldgrid_Editor_Builder::get_background_data(),
			'builder_config' => Boldgrid_Editor_Builder::get_builder_config(),
			'boldgrid_settings' => $boldgrid_settings,
			'default_container' => Boldgrid_Editor_Builder::get_page_container(),
			'shortcodes' => $shortcode_keys,
			'current_theme' => get_stylesheet(),

			//'display_update_notice' => Boldgrid_Editor_Version::should_display_notice(),
			'display_update_notice' => false,
			'display_gridblock_lead' => $display_gridblock_lead,
			'notices' => Boldgrid_Editor_Setup::get_notice_status(),
			'setup_settings' => Boldgrid_Editor_Option::get( 'setup' ),
			'control_styles' => ! $is_bg_theme ? Boldgrid_Editor_Builder_Styles::get_option() : array(),
			'admin-url' => get_admin_url(),
			'inspiration' => get_option( 'boldgrid_install_options' ),
			'grid_block_nonce' => wp_create_nonce( 'boldgrid_gridblock_image_ajax_nonce' ),
			'nonce_gridblock_save' => wp_create_nonce( 'boldgrid_editor_gridblock_save' ),
			'components' => [
				'buttons' =>  Boldgrid_Editor_Option::get( 'components_buttons', true ),
			],
			'features' => array(
				'template_via_url' => ! $is_bg_theme,
				'button_colors' => ! $builder->requires_deprecated_buttons(),
			),
		);

		$vars = array_merge( $vars, $this->get_shared_vars() );

		/**
		 * Overrdie any of the variables sent to the front end application.
		 *
		 * @since 1.6.0
		 *
		 * @param type  $var Array of variables to be passed to editor scripts.
		 */
		return apply_filters( 'BoldgridEditor\PageBuilder', $vars );
	}

	/**
	 * JS varaiables to be added with all admin page scrips.
	 *
	 * @since 1.9.0
	 *
	 * @return array JS Variables.
	 */
	public function get_shared_vars() {
		return [
			'plugin_url' => plugins_url( '', BOLDGRID_EDITOR_ENTRY ),
			'plugin_configs' => Boldgrid_Editor_Service::get( 'config' ),
			'globalSettings' => Boldgrid_Editor_Service::get( 'settings' )->get_all(),
			'customPostTypes' => Boldgrid_Editor_Service::get( 'settings' )->get_custom_post_types(),
			'pluginVersion' => BOLDGRID_EDITOR_VERSION,
			'editor_override' => Boldgrid_Editor_Setting::get_editor_override(),
		];
	}

	/**
	 * Get the query arg post, if not found, get home page post id.
	 *
	 * @since 1.4
	 *
	 * @return integer Post id.
	 */
	public function get_post_id() {
		$frontpage_id = get_option( 'page_on_front' );
		$post_id = ! empty( $_REQUEST['post'] ) ? intval( $_REQUEST['post'] ) : null;
		if ( ! $post_id ) {
			$post_id = $frontpage_id;
		}

		return $post_id;
	}

	/**
	 * Enqueue all scripts.
	 *
	 * @since 1.2.3
	 */
	public function enqueue_scripts() {

		$plugin_file = BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php';

		wp_enqueue_script( 'media-imhwpb',
			plugins_url( self::get_minified_js( '/assets/js/media/media' ), $plugin_file ),
		array(), BOLDGRID_EDITOR_VERSION, true );

		wp_enqueue_script( 'boldgrid-editor-suggest-crop',
			plugins_url( Boldgrid_Editor_Assets::get_minified_js( '/assets/js/media/crop' ), $plugin_file ),
		array(), BOLDGRID_EDITOR_VERSION, true );

		wp_enqueue_style( 'boldgrid-editor-css-suggest-crop',
		plugins_url( '/assets/css/crop.css', $plugin_file ), array(), BOLDGRID_EDITOR_VERSION );

		$this->enqueue_drag_scripts();

		wp_enqueue_script( 'boldgrid-editor-caman',
			plugins_url( '/assets/js/camanjs/caman.full.min.js', $plugin_file ), array(),
		BOLDGRID_EDITOR_VERSION, true );

		wp_enqueue_style( 'boldgrid-editor-fonts',
			'https://fonts.googleapis.com/css?family=Open+Sans|Josefin+Sans:300,400,600',
		false, BOLDGRID_EDITOR_VERSION, false );
	}

	/**
	 * Enqueue scripts to be used on the page and post editor.
	 *
	 * @since 1.2.3
	 *
	 * @global string $wp_version Current WordPress version.
	 */
	public function enqueue_drag_scripts() {
		global $wp_version;

		$plugin_file = BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php';

		// Dependencies.
		$deps = array(
			'jquery',
			'media-views',
			'mce-view',
			'jquery-ui-draggable',
			'jquery-ui-resizable',
			'jquery-ui-slider',
			'jquery-ui-droppable',
			'jquery-ui-selectmenu',
			'wp-color-picker',
			'jquery-masonry',
			'wp-util',
		);

		wp_register_script( 'boldgrid-editor-drag',
			self::get_webpack_script( 'editor' ), $deps, BOLDGRID_EDITOR_VERSION, true );

		// Send Variables to the view.
		wp_localize_script(
			'boldgrid-editor-drag',
			'BoldgridEditor = BoldgridEditor || {}; BoldgridEditor',
			$this->get_js_vars()
		);

		/*
		 * Localize wp-color-picker.
		 *
		 * This is only needed in WordPress >= 5.5 because wpColorPickerL10n has been removed.
		 * @see https://github.com/WordPress/WordPress/commit/7e7b70cd1ae5772229abb769d0823411112c748b
		 *
		 * This is only needed until the wp-color-picker-alpha repo has been updated.
		 * @see https://github.com/kallookoo/wp-color-picker-alpha/issues/35
		 */
		if ( version_compare( $wp_version, '5.4.99', '>=' ) ) {
			wp_localize_script(
				'wp-color-picker',
				'wpColorPickerL10n',
				array(
					'clear'            => __( 'Clear' ),
					'clearAriaLabel'   => __( 'Clear color' ),
					'defaultString'    => __( 'Default' ),
					'defaultAriaLabel' => __( 'Select default color' ),
					'pick'             => __( 'Select Color' ),
					'defaultLabel'     => __( 'Color value' ),
			) );
		}

		wp_enqueue_script( 'boldgrid-editor-drag' );


		/*
		 * Fired after the Post and Page Builder enqueues it's editor scripts.
		 *
		 * @since 1.8.0
		 */
		do_action( 'boldgrid_editor_scripts_builder' );
	}

	/**
	 * Get the url for css to the editor.
	 *
	 * Check for a unique constant. Reason for this is in order for dev scripts to be used
	 * webpack dev server must be running.
	 *
	 * @since 1.0
	 *
	 * @return string url to editor css file.
	 */
	public static function editor_css_url() {
		$suffix = '.min';

		if ( defined( 'BGEDITOR_SCRIPT_DEBUG' ) && BGEDITOR_SCRIPT_DEBUG ) {
			$suffix = '';
		}

		return plugins_url( '/assets/css/editor' . $suffix . '.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );
	}

	/**
	 * Add All Styles needed for the editor in the the wordpress doc.
	 *
	 * @since 1.0
	 */
	public function add_styles() {
		$plugin_file = BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php';

		$suffix = self::get_asset_suffix();

		wp_register_style( 'genericons-imhwpb',
		plugins_url( '/assets/css/genericons.min.css', $plugin_file ), array(), BOLDGRID_EDITOR_VERSION );

		wp_register_style( 'editor-css-imhwpb', self::editor_css_url(), array(), BOLDGRID_EDITOR_VERSION );

		wp_enqueue_style( 'animatecss',
		plugins_url( '/assets/css/animate.min.css', $plugin_file ), array(), BOLDGRID_EDITOR_VERSION );

		wp_enqueue_style( 'boldgrid-components',
			plugins_url( '/assets/css/components' . $suffix . '.css', $plugin_file ), array(),
			$this->configs['conflicting_assets']['boldgrid-components']['version'] );

		$builder_styles = new Boldgrid_Editor_Builder_Styles();
		if ( $builder_styles->requires_default_styles() ) {
			wp_enqueue_style( 'boldgrid-custom-styles',
				plugins_url( '/assets/css/custom-styles.css', BOLDGRID_EDITOR_ENTRY ), array(), BOLDGRID_EDITOR_VERSION );
		}

		// If theme does not support BGTFW buttons, enqueue buttons.
		$builder = new Boldgrid_Editor_Builder();
		if ( $builder->requires_deprecated_buttons() ) {
			wp_enqueue_style( 'boldgrid-buttons',
			plugins_url( '/assets/css/buttons.min.css', $plugin_file ), array(), BOLDGRID_EDITOR_VERSION );
		}

		wp_enqueue_style( 'editor-css-imhwpb' );

		wp_register_style( 'font-awesome', plugins_url( '/assets/css/font-awesome.min.css', $plugin_file ), '4.7' );
	}

}
