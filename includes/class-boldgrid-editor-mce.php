<?php
/**
 * Class: Boldgrid_Editor_MCE
 *
 * Override and extend the functionality of tinyMCE.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_MCE
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_MCE
 *
 * Override and extend the functionality of tinyMCE.
 *
 * @since      1.2
 */
class Boldgrid_Editor_MCE {

	/**
	 * Initialize class and set class properties.
	 *
	 * @since 1.4.7
	 */
	public function __construct( $configs ) {
		return $this->configs = $configs;
	}

	/**
	 * Check whether or not Drag and Drop is enabled.
	 *
	 * By default DnD (Drag and Drop) is disabled for non BG themes and enabled for BG themes.
	 * If the user explicitly chooses whether to activate or deactivate DnD, we save it as a theme mod
	 * on the theme. This means that upon activating a non BG theme for the first time, it will always
	 * be disabled, even if you have previously enabled it on another theme.
	 *
	 * @since 1.0.9
	 *
	 * @return boolean Whether or not drggable is enabled.
	 */
	public static function has_draggable_enabled() {
		return get_theme_mod( 'boldgrid_draggable_enabled', Boldgrid_Editor_Theme::is_editing_boldgrid_theme() );
	}

	/**
	 * Actions that should be triggered on media_buttons_context action
	 *
	 * @since 1.1.
	 */
	public function load_editor_hooks() {
		echo '<button type="button" id="insert-gridblocks-button" class="button gridblock-icon boldgrid-color hidden">' .
			'<span class="wp-media-buttons-icon"></span> Add Block</button>';
	}

	/**
	 * Adding tinyMCE buttons
	 *
	 * @since 1.0.
	 */
	public function add_window_size_buttons() {
		add_action( 'admin_head', array (
			$this,
			'add_mce_buttons'
		) );
	}

	/**
	 * Procedure for adding new buttons.
	 *
	 * @global $typenow.
	 *
	 * @since 1.0.
	 */
	public function add_mce_buttons() {
		global $typenow;

		// verify the post type
		if ( 'bgppb' !== Boldgrid_Editor_Service::get( 'editor_type' ) ) {
			return;
		}

		// check if WYSIWYG is enabled
		if ( 'true' == get_user_option( 'rich_editing' ) ) {
			add_filter( 'mce_external_plugins', array (
				$this,
				'add_tinymce_plugin'
			) );

			add_filter( 'mce_buttons', array (
				$this,
				'register_mce_button'
			) );
		}
	}

	/**
	 * Adding tinyMCE plugins.
	 *
	 * @since 1.0.
	 *
	 * @param array $plugin_array.
	 *
	 * @return array.
	 */
	public function add_tinymce_plugin( $plugin_array ) {
		$file = Boldgrid_Editor_Assets::get_minified_js( '/assets/js/editor/editor' );
		$file = $file . '?ver=' . BOLDGRID_EDITOR_VERSION;
		$editor_js_file = plugins_url( $file, BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );

		$plugin_array = (array) $plugin_array;
		$plugin_array['monitor_view_imhwpb'] = $editor_js_file;
		$plugin_array['tablet_view_imhwpb'] = $editor_js_file;
		$plugin_array['phone_view_imhwpb'] = $editor_js_file;
		$plugin_array['toggle_draggable_imhwpb'] = $editor_js_file;

		return $plugin_array;
	}

	/**
	 * Registering new buttons.
	 *
	 * @since 1.0.
	 *
	 * @param array $buttons.
	 *
	 * @return array.
	 */
	public function register_mce_button( $buttons ) {
		array_push( $buttons, 'monitor_view_imhwpb' );
		array_push( $buttons, 'tablet_view_imhwpb' );
		array_push( $buttons, 'phone_view_imhwpb' );
		array_push( $buttons, 'toggle_draggable_imhwpb' );

		return $buttons;
	}

	/**
	 * Add Extended valid elements.
	 *
	 * @since 1.2.7.
	 *
	 * @param array | string $init.
	 *
	 * @return array.
	 */
	public function allow_empty_tags( $init ) {
		$extra_tags = array (
			'div[*]',
			'i[*]',
		);

		$extended_valid_elements = ! empty( $init['extended_valid_elements'] ) ?
			$init['extended_valid_elements'] : array();

		if ( ! is_array( $extended_valid_elements ) ) {
			$extended_valid_elements = explode( ',', $extended_valid_elements );
		}

		// Note: Using .= here can trigger a fatal error.
		$extended_valid_elements = array_merge( $extended_valid_elements, $extra_tags );
		$init['extended_valid_elements'] = implode( ',', $extended_valid_elements );

		// Always show wordpress 2 toolbar.
		$init['wordpress_adv_hidden'] = false;

		// Remove link hovers.
		$init['inline_boundaries'] = false;

		// Add Underline to toolbar 1.
		$init = $this->addInitItem( $init, 'toolbar1', 'underline', 'italic' );

		return $init;
	}

	/**
	 * Add to an Item to a tinymce config array.
	 *
	 * @since 1.4
	 *
	 * @param array $init  Full tinymce config.
	 * @param string $key   Key of the config.
	 * @param string $item  Item to add.
	 * @param string $after Item to add after.
	 */
	public function addInitItem( $init, $key, $item, $after = null ) {
		if ( ! empty( $init[ $key ] ) && false === is_array( $init[ $key ] ) ) {
			$config = explode( ',', $init[ $key ] );

			if ( false === array_search( $item, $config ) ) {
				$curLocation = array_search( $after, $config );
				$curLocation = $curLocation && $after ? $curLocation + 1 : sizeof( $config );
				array_splice( $config, $curLocation, 0, $item );

				$init[ $key ] = implode( ',', $config );
			}
		}

		return $init;
	}

	/**
	 * If a bootstrap css file does not already exists in the list of css files, enqueue it.
	 *
	 * @since 1.2.7
	 *
	 * @param array $styles
	 *
	 * @return array
	 */
	public function prepend_bootstrap_styles( $styles ) {

		$editor_boostrap = plugins_url( '/assets/css/mce-fe.min.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );

		$boostrap_included = false;
		foreach ( $styles as $style ) {
			if ( -1 !== stripos( $style, 'bootstrap.min.css' ) ) {
				$boostrap_included = true;
			}
		}

		if ( ! $boostrap_included ) {
			// Bootsrap not added by the theme, prepend the styles.
			array_unshift( $styles, $editor_boostrap );
		} else {
			// Bootsrap added by the theme, append bootstrap styles to overwrite break points.
			$styles[] = $editor_boostrap;
		}

		return $styles;
	}

	/**
	 * If a css file does not already exists in the list of css files, enqueue it.
	 *
	 * @since 1.3
	 *
	 * @param array $styles
	 *
	 * @return array
	 */
	public function add_styles_conflict( $styles ) {
		$configs = $this->configs->get_configs();

		foreach( $configs['conflicting_assets'] as $conditional_style ) {

			$included = false;
			$replacement_index = sizeof( $styles );
			foreach ( $styles as $i => $style ) {
				if ( false !== stripos( $style, $conditional_style['mce_str_match'] ) ) {
					$parts = parse_url( $style );
					$queryPart = ! empty( $parts['query'] ) ? $parts['query'] : '';
					parse_str( $queryPart, $query );

					$version = ! empty( $query['version'] ) ? $query['version'] : false;
					$replacement_index = $i;

					if ( $version && version_compare( $version, $conditional_style['version'], '>=' ) ) {
						$included = true;
					}
				}
			}

			if ( ! $included ) {
				$styles[ $replacement_index ] = $conditional_style['src'] . '?version=' . $conditional_style['version'];
			}

		}

		return $styles;
	}

	/**
	 * Add an additional query arg to each css file included in the tinymce iframe.
	 * E.g. boldgrid-editor-version=1.0.0.
	 *
	 * @since 1.0.2
	 *
	 * @param string $css.
	 *
	 * @return string.
	 */
	public function add_cache_busting( $css ) {
		global $wp_styles;

		if ( empty( $css ) ) {
			return $css;
		}

		$styles = explode( ',', $css );

		/*
		 * Filter the styles to be enqueued into the editor iframe before the editor reorders.
		 *
		 * @since 1.8.0
		 *
		 * @param array $styles List of styles to enqueue.
		 */
		$styles = apply_filters( 'boldgrid_editor_before_editor_styles', $styles );

		$styles = $this->prepend_bootstrap_styles( $styles );

		array_unshift( $styles, plugins_url( '/assets/js/builder/css/before-theme.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' ) );

		array_unshift( $styles, '//fonts.googleapis.com/css?family=Open+Sans:600' );

		// Add a couple of styles that need to append the iframe head.
		$styles[] = plugins_url( '/assets/css/genericons.min.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );

		$styles[] = plugins_url( '/assets/js/builder/css/draggable.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );

		$styles[] = plugins_url( '/assets/css/animate.min.css',
			BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );

		$gutenberg_styles = [
			'wp-block-library',
			'wp-block-library-theme'
		];

		foreach ( $gutenberg_styles as $style ) {
			if ( ! empty( $wp_styles->registered[ $style ]->src ) ) {
				$styles[] = $wp_styles->_css_href(
					$wp_styles->registered[ $style ]->src,
					$wp_styles->default_version,
					$style );
			}
		}

		$styles[] = Boldgrid_Editor_Assets::editor_css_url();

		$builder_styles = new Boldgrid_Editor_Builder_Styles();
		if ( $builder_styles->requires_default_styles() ) {
			$styles[] = plugins_url( '/assets/css/custom-styles.css', BOLDGRID_EDITOR_ENTRY );
		}

		$builder = new Boldgrid_Editor_Builder();
		if ( $builder->requires_deprecated_buttons() ) {
			$styles[] = plugins_url( '/assets/css/buttons.min.css',
				BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php' );
		}

		// Add styles that could conflict.
		$styles = $this->add_styles_conflict( $styles );

		// Add Query Args.
		$mce_css = array ();
		foreach ( $styles as $editor_style ) {
			$query_arg = BOLDGRID_EDITOR_VERSION;
			if ( defined( 'BGEDITOR_SCRIPT_DEBUG' ) && BGEDITOR_SCRIPT_DEBUG ) {
				$query_arg = time();
			}

			$mce_css[] = add_query_arg( 'boldgrid-editor-version', $query_arg, $editor_style );
		}

		/*
		 * Filter the styles to be enqueued into the editor iframe after the editor reorders.
		 *
		 * @since 1.8.0
		 *
		 * @param array $styles List of styles to enqueue.
		 */
		$mce_css = apply_filters( 'boldgrid_editor_after_editor_styles', $mce_css );

		return implode( ',', $mce_css );
	}

}
