<?php
/**
 * Class: Boldgrid_Editor_Wpforms
 *
 * Integration between WPForms and Post and Page Builder.
 *
 * @since      1.4.4
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Wpforms
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Wpforms
 *
 * Integration between WPForms and Post and Page Builder.
 *
 * @since      1.4.4
 */
class Boldgrid_Editor_Wpforms {

	/**
	 * A full array of tab configurations
	 *
	 * @var array
	 */
	protected $tab_configs;

	/**
	 * Path configurations used for the plugin
	 */
	protected $path_configs;

	/**
	 * Accessor for tab configs
	 *
	 * @return array
	 */
	public function get_tab_configs() {
		return $this->tab_configs;
	}

	/**
	 * Accessor for path configs
	 *
	 * @return array
	 */
	public function get_path_configs() {
		return $this->path_configs;
	}

	/**
	 * Initialize tab configs.
	 *
	 * @since 1.4.4
	 */
	public function initiallizeConfigs() {
		$addonDir = dirname( __FILE__ );
		$this->tab_configs = include( $addonDir . '/config/layouts.php' );

		$this->path_configs = array (
			'plugin_dir' => BOLDGRID_EDITOR_PATH,
			'addon_directory' => realpath( dirname( __FILE__ ) . '/..'),
			'plugin_filename' => BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php'
		);
	}

	/**
	 * Javascript needed for editor.
	 *
	 * @since 1.4.4
	 */
	public function enqueue_header_content() {
		global $pagenow;

		if ( false == in_array( $pagenow, array (
			'post.php',
			'post-new.php'
		) ) ) {
			return;
		}

		wp_enqueue_script( 'boldgrid-form-shortcode',
			plugins_url( '/wpforms/assets/js/shortcode.js', $this->path_configs['addon_directory'] ),
			array (), BOLDGRID_EDITOR_VERSION, true );
	}

	/**
	 * Get the url to the stylesheet of
	 *
	 * WPForms 1.8.1 and later load frontend styles from a per render engine directory, and 2.0
	 * removed the old root stylesheets, so use the same path WPForms enqueues for its forms.
	 *
	 * @since 1.4.4
	 *
	 * @return string|false URL of the form stylesheet, or false when WPForms CSS is disabled.
	 */
	public static function get_stylesheet() {
		$url = false;

		if ( wpforms_setting( 'disable-css', '1' ) == '1' ) {
			$style_name = 'full';
		} else if ( wpforms_setting( 'disable-css', '1' ) == '2' ) {
			$style_name = 'base';
		} else {
			return $url;
		}

		if ( function_exists( 'wpforms_get_render_engine' ) && function_exists( 'wpforms_get_min_suffix' ) ) {
			$url = WPFORMS_PLUGIN_URL . 'assets/css/frontend/' . wpforms_get_render_engine() .
				'/wpforms-' . $style_name . wpforms_get_min_suffix() . '.css';
		} else {
			$url = WPFORMS_PLUGIN_URL . 'assets/css/wpforms-' . $style_name . '.css';
		}

		return $url;
	}

	/**
	 * Initialization hook for BoldGrid forms.
	 *
	 * @since 1.4.4
	 */
	public function init() {
		add_action( 'admin_init', array ( $this, 'admin_init' ) );
	}

	/**
	 * Check if wp forms is active and has enough functionality for us to support it.
	 *
	 * The constant checks are deps we use in the plugin.
	 *
	 * @since 1.44
	 *
	 * @return boolean Is WP forms active and supportable?
	 */
	public function isWpformsActive() {
		return function_exists('wpforms') && function_exists('wpforms_setting') && defined('WPFORMS_PLUGIN_URL')
			&& defined('WPFORMS_VERSION') && ! defined('BOLDGRID_NINJA_FORM_VERSION');
	}

	/**
	 * Initialization process for administration section of forms.
	 *
	 * @since 1.4.4
	 */
	public function admin_init() {
		if ( ! $this->isWpformsActive() ) {
			return;
		}

		$valid_pages = array (
			'post.php',
			'post-new.php',
			'media-upload.php'
		);

		$edit_post_page = in_array( basename( $_SERVER['SCRIPT_NAME'] ), $valid_pages );
		if ( is_admin() && $edit_post_page ) {

			// Create Media Modal Tabs
			$this->initiallizeConfigs();
			$this->create_tabs();

			// Print preview markup for all forms.
			add_action( 'print_media_templates', array ( $this, 'print_media_templates' ) );
			add_filter( 'wpforms_display_media_button', array( $this, 'remove_media_button' ) );

			// load up any css / js we need
			add_action( 'admin_enqueue_scripts', array ( $this, 'enqueue_header_content' ), 15 );
			// After Boldgrid_Editor_MCE::add_cache_busting (10), which rebuilds the list.
			add_filter( 'mce_css', array( $this, 'mce_css' ), 11 );
		}
	}

	/**
	 * Add stylesheet to editor.
	 *
	 * @since 1.6
	 *
	 * @param  string $stylehsheets All stylsheets.
	 * @return string               All stylsheets.
	 */
	public function mce_css( $stylehsheets ) {
		$stylesheet = self::get_stylesheet();
		if ( ! is_string( $stylesheet ) || '' === $stylesheet ) {
			return $stylehsheets;
		}

		$stylehsheets = explode( ',', $stylehsheets );
		$stylehsheets[] = $stylesheet;
		return implode( ',', $stylehsheets );
	}

	/**
	 * Get form markup.
	 *
	 * @since 1.4.4
	 *
	 * @param int $form_id ID of Form.
	 * @return string Markup of form.
	 */
	public static function get_form_markup( $form_id ) {
		return do_shortcode( '[wpforms id="' . absint( $form_id ) . '" title="true" description="true"]' );
	}

	/**
	 * Get all wpforms.
	 *
	 * @since 1.4.4
	 *
	 * @return array
	 */
	public static function get_forms() {
		$results = get_posts( array(
			'post_type' => 'wpforms',
			'orderby'       => 'id',
			'order'         => 'ASC',
			'no_found_rows' => true,
			'nopaging'      => true,
		) );

		// Initialize $form_ids array.
		$form_ids = array();

		// Populate the $form_ids array.
		foreach ( $results as $result ) {
			if ( ! empty( $result->ID ) ) {
				$form_ids[] = array (
					'id' => $result->ID
				);
			}
		}

		// Return the resulting array.
		return $form_ids;
	}

	/**
	 * Remove the WPForms TinyMCE media button.
	 *
	 * In the function below we disable displaying the media button
	 * on pages. You can replace 'page' with your desired post type.
	 *
	 *  @since 1.4.4
	 *
	 * @param boolean $display
	 * @return boolean
	 */
	public function remove_media_button( $display ) {
		$screen = get_current_screen();
		$config =  Boldgrid_Editor_Service::get( 'config' );

		if ( in_array( $screen->post_type, $config[ 'allowed_post_types' ] ) ) {
			return false;
		}

		return $display;
	}

	/**
	 * Create Tabs based on configurations.
	 *
	 * @since 1.4.4
	 */
	public function create_tabs() {
		require_once dirname( __FILE__ ) . '/class-boldgrid-editor-wpforms-media.php';

		$boldgrid_configs = $this->get_tab_configs();

		$configs = $boldgrid_configs['tabs'];

		/*
		 * Create each tab specified from the configuration.
		 */
		foreach ( $configs as $tab ) {
			$media_tab = new Boldgrid_Editor_Wpforms_Media( $tab, $this->get_path_configs(), '/' );
			$media_tab->create();
		}
	}

	/**
	 * Get preview markup for all forms and print it to the page.
	 *
	 * Markup is printed as JSON data, keyed by form id, so that the editor can insert it as a
	 * plain string. It must never be compiled as a template.
	 *
	 * @since 1.4.4
	 */
	public function print_media_templates() {
		$flags       = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
		$form_markup = array();

		$forms = self::get_forms();

		foreach ( $forms as $form ) {
			$markup = '<div>' . self::get_form_markup( $form['id'] ) . '</div>';

			if ( false !== wp_json_encode( $markup, $flags ) ) {
				$form_markup[ (string) $form['id'] ] = $markup;
			}
		}

		require $this->path_configs['addon_directory'] . '/templates/form-not-found.php';

		$json = wp_json_encode( (object) $form_markup, $flags );

		if ( false === $json ) {
			$json = '{}';
		}

		?>
<script type="application/json" id="boldgrid-wpforms-preview-markup"><?php echo $json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON with HTML-significant characters hex-escaped. ?></script>
<?php
	}

}
