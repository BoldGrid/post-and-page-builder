<?php
/**
 * Class: Boldgrid_Editor_Builder_Styles
 *
 * Handle adding custom stylesheets to the editor.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Builder
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Builder_Styles
 *
 * Handle adding custom stylesheets to the editor.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Builder_Styles {

	/**
	 * Maximum CSS bytes allowed in one saved style entry.
	 *
	 * Compiled palette output (including button CSS) is stored as a single
	 * `bg-controls-colors` rule and exceeds 70KB in the default stylesheet.
	 *
	 * @since 1.27.15
	 * @var int
	 */
	const MAX_STYLE_CSS_BYTES = 512000;

	/**
	 * Maximum JSON bytes accepted for the shared style payload.
	 *
	 * @since 1.27.15
	 * @var int
	 */
	const MAX_STYLES_JSON_BYTES = 1048576;

	/**
	 * Maximum number of style entries accepted in one save.
	 *
	 * @since 1.27.15
	 * @var int
	 */
	const MAX_STYLE_ENTRIES = 100;

	/**
	 * Get the html named input for the styles values.
	 *
	 * @since 1.6
	 *
	 * @return string HTML to render.
	 */
	public function get_input() {
		return "<input id='boldgrid-control-styles' style='display:none' name='boldgrid-control-styles'>" .
			wp_nonce_field(
				'boldgrid_save_control_styles',
				'boldgrid-control-styles-nonce',
				false,
				false
			);
	}

	/**
	 * Get the path we user for uploads.
	 *
	 * @since 1.0.0
	 *
	 * @return  string Upload path.
	 */
	public static function get_upload_path( $key = 'basedir' ) {
		$upload_dir = wp_upload_dir();
		return $upload_dir[ $key ] . '/boldgrid';
	}

	/**
	 * Get url info for the saved css file.
	 *
	 * @since 1.6
	 *
	 * @return array Properties of file.
	 */
	public static function get_url_info() {
		$option = self::get_option();
		$is_bg_theme = Boldgrid_Editor_Service::get( 'main' )->get_is_boldgrid_theme();
		$url = false;

		// Currently disabled for BG themes. BG themes should use the BG color palette system (theme switching).
		if ( ! $is_bg_theme ) {
			$filename = ! empty( $option['css_filename'] ) ? $option['css_filename'] : '';

			$editor_fs = new Boldgrid_Editor_Fs();
			$wp_filesystem = $editor_fs->get_wp_filesystem();
			if ( $filename && $wp_filesystem->exists( self::get_upload_path() . $filename ) ) {
				$url = self::get_upload_path( 'baseurl' ) . $filename;
			} else {
				$url = plugins_url( '/assets/css/custom-styles.css', BOLDGRID_EDITOR_ENTRY );
			}
		}

		return array(
			'url' => $url,
			'timestamp' => ! empty( $option['timestamp'] ) ? $option['timestamp'] : false,
		);
	}

	/**
	 * Check if the theme requires the default stylesheet.
	 *
	 * @since 1.6
	 *
	 * @return boolean.
	 */
	public function requires_default_styles() {
		$option = self::get_option();
		return empty( $option['css_filename'] ) && ! Boldgrid_Editor_Service::get( 'main' )->get_is_boldgrid_theme();
	}

	/**
	 * Check if the user has saved a specific type of custom style.
	 *
	 * @since 1.6
	 *
	 * @param  string  $name Name of custom style.
	 * @return boolean       Whether or not the style has been saved.
	 */
	public function has_custom_style( $name ) {
		$has_custom_style = false;
		$option = self::get_option();
		$configs = ! empty( $option['configuration'] ) ? $option['configuration'] : array();

		foreach( $configs as $config ) {
			if ( $name === $config['id'] ) {
				$has_custom_style = true;
				break;
			}
		}

		return $has_custom_style;
	}

	/**
	 * Get the option value we use to display styles.
	 *
	 * @since 1.6
	 *
	 * @return array
	 */
	public static function get_option() {
		$option_name = 'styles';
		if ( ! is_admin() && ! empty( $_GET['preview'] ) && 'true' === $_GET['preview'] ) {
			$option_name = 'preview_styles';
		}

		return Boldgrid_Editor_Option::get( $option_name, array() );
	}

	/**
	 * Create a string of the css created in the eidtor.
	 *
	 * @since 1.6
	 *
	 * @param  array $styles List of styles.
	 * @return string        CSS.
	 */
	public function create_css_string( $styles ) {
		$css = '';
		foreach( $styles as $style ) {
			$css .= $style['css'];
		}

		return $css;
	}

	/**
	 * Create the css file.
	 *
	 * @since 1.6
	 *
	 * @param  string $css CSS to save to a file.
	 * @return string      URL to new file.
	 */
	public function create_file( $css, $filename = '/custom-styles.css' ) {
		wp_mkdir_p( self::get_upload_path() );
		$new_filename = self::get_upload_path() . $filename;
		$editor_fs = new Boldgrid_Editor_Fs();
		$editor_fs->save( $css, $new_filename );

		return $filename;
	}

	/**
	 * Validate the CSS.
	 *
	 * @since 1.6
	 *
	 * @param  array $styles Unvalidated Styles.
	 * @return array         Validated Styles.
	 */
	public function validate( $styles ) {
		$validated_styles = array();
		foreach ( $styles as $style ) {
			if ( ! is_array( $style ) ||
				! isset( $style['id'], $style['css'] ) ||
				! is_scalar( $style['id'] ) ||
				! is_scalar( $style['css'] )
			) {
				continue;
			}

			$id  = sanitize_key( $style['id'] );
			$css = (string) $style['css'];

			if ( '' === $id ||
				'' === $css ||
				false !== strpos( $css, "\0" ) ||
				strlen( $css ) > self::MAX_STYLE_CSS_BYTES ||
				preg_match( '#</?\w+#', $css )
			) {
				continue;
			}

			$style['id']        = $id;
			$style['css']       = $css;
			$validated_styles[] = $style;
		}

		return $validated_styles;
	}

	/**
	 * Save user styles created during edit process.
	 *
	 * @since 1.6
	 */
	public function save() {
		// This writes a shared, web-served stylesheet, so require site administration.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( ! current_user_can( 'manage_options' ) ||
			! Boldgrid_Editor_Nonce::verify_admin_request(
				'boldgrid_save_control_styles',
				'boldgrid-control-styles-nonce'
			) ||
			! isset( $_POST['boldgrid-control-styles'] ) ||
			! is_scalar( $_POST['boldgrid-control-styles'] )
		) {
			return;
		}

		$styles_json = wp_unslash( $_POST['boldgrid-control-styles'] );
		$is_preview  = ! empty( $_POST['wp-preview'] );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( ! is_string( $styles_json ) ||
			strlen( $styles_json ) > self::MAX_STYLES_JSON_BYTES
		) {
			return;
		}

		$styles = json_decode( $styles_json, true );
		if ( ! is_array( $styles ) ||
			array_values( $styles ) !== $styles ||
			count( $styles ) > self::MAX_STYLE_ENTRIES
		) {
			return;
		}

		$submitted_count = count( $styles );
		$styles          = $this->validate( $styles );

		if ( count( $styles ) !== $submitted_count ) {
			return;
		}

		// Create stylesheet.
		$css = $this->create_css_string( $styles );

		if ( empty( $css ) ) {
			return;
		}

		if ( $is_preview ) {
			// If previewing the page save to another option.
			$css_file = $this->create_file( $css, '/preview-custom-styles.css' );

			Boldgrid_Editor_Option::update(
				'preview_styles',
				array(
					'configuration' => $styles,
					'css_filename'  => $css_file,
					'timestamp'     => time(),
				)
			);

		} else {
			$css_file = $this->create_file( $css );

			Boldgrid_Editor_Option::update(
				'styles',
				array(
					'configuration' => $styles,
					'css_filename'  => $css_file,
					'timestamp'     => time(),
				)
			);
		}
	}
}
