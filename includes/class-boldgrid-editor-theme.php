<?php
/**
 * Class: Boldgrid_Editor_Theme
 *
 * Gather more information about a theme so that we know how to display the editor tools.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Theme
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Theme
 *
 * Gather more information about a theme so that we know how to display the editor tools.
 *
 * @since      1.2
 */
class Boldgrid_Editor_Theme {

	/**
	 * Body class for plugin.
	 *
	 * This is essentially a flag to determine that the plugin is active.
	 *
	 * @since 1.8.0
	 *
	 * @var string
	 */
	public static $plugin_body_class = 'boldgrid-ppb';

	/**
	 * Default palette.
	 *
	 * @since 1.6
	 *
	 * @return array          Default palette to used when theme doesn't define one.
	 */
	public static $default_palette = array(
		'defaults' => array( 'rgb(33, 150, 243)', 'rgb(13, 71, 161)', 'rgb(187, 222, 251)', 'rgb(238, 238, 238)', 'rgb(19, 19, 19)' ),
		'neutral' => 'white',
	);

	/**
	 * Check if theme supports a feature.
	 *
	 * @since 1.0
	 *
	 * @param WP_Theme $wp_theme
	 *
	 * @return string.
	 */
	public static function has_feature( $feature = null ) {
		$features = Boldgrid_Editor_Builder::get_theme_features();
		return in_array( $feature, $features );
	}

	/**
	 * Returns the name of a theme if and only if the theme is a boldgrid theme.
	 *
	 * @since 1.0
	 *
	 * @param WP_Theme $wp_theme
	 *
	 * @return string.
	 */
	public static function get_boldgrid_theme_name( $wp_theme ) {
		$current_boldgrid_theme = '';

		$current_theme = $wp_theme;

		if ( is_a( $current_theme, 'WP_Theme' ) ) {
			$author = $current_theme->get( 'Author' );
			$author = strtolower( $author );

			if ( strpos( $author, 'boldgrid' ) !== false ) {
				$current_boldgrid_theme = $current_theme->get( 'Name' );
			} elseif ( get_template_directory() !== get_stylesheet_directory() ) {
				$parent = $current_theme->get( 'Template' );

				$parent = wp_get_theme( $parent );
				$author = $parent->get( 'Author' );
				$author = strtolower( $author );

				if ( strpos( $author, 'boldgrid' ) !== false ) {
					$current_boldgrid_theme = $current_theme->get( 'Name' );
				}
			}
		}

		return $current_boldgrid_theme;
	}

	/**
	 * Add filters to the BGTFW.
	 *
	 * This is done at an earlier hook, configs or main service are unavailable.
	 *
	 * @since 1.6.1
	 *
	 * @param array $configs Copnfigurations.
	 *
	 * @return array configs.
	 */
	public function BGTFW_config_filters( $configs ) {
		$configs = $this->update_tgm( $configs );
		$configs = $this->body_color_links( $configs );

		return $configs;
	}

	/**
	 * Shortcodes now inherit from theme body color links.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $configs BGTFW Configs.
	 * @return array          BGTFW Configs.
	 */
	public function body_color_links( $configs ) {
		if ( ! empty( $configs['customizer']['controls']['bgtfw_body_link_color']['choices']['selectors'] ) ) {
			$configs['customizer']['controls']['bgtfw_body_link_color']['choices']['selectors'][] = '.boldgrid-shortcode .widget a';
		}

		return $configs;
	}

	/**
	 * Add Body classes to editor to hide.
	 *
	 * @since 1.8.0
	 *
	 * @return array Classes.
	 */
	public function add_body_class( $classes ) {
		$classes[] = self::$plugin_body_class;
		return $classes;
	}

	/**
	 * Remove boldgrid-editor slug from the reccomended plugins.
	 *
	 * @since 1.6.1
	 *
	 * @param  array $configs BGTFW Configurations.
	 * @return array          BGTFW Configurations.
	 */
	public function update_tgm( $configs ) {
		$plugins = array();

		if ( empty( $configs['tgm']['plugins'] ) ) {
			return $configs;
		}

		foreach( $configs['tgm']['plugins'] as $plugin ) {
			if ( 'boldgrid-editor' !== $plugin['slug'] ) {
				$plugins[] = $plugin;
			}
		}
		$configs['tgm']['plugins'] = $plugins;

		return $configs;
	}

	/**
	 * Remove theme container if previewing a post or page.
	 *
	 * We dont need to know if this is a page or post because the filter only applies to pages.
	 * So even though this filter alters configs on posts, it has no effect.
	 *
	 * @since 1.2.7
	 *
	 * @param array $configs BGTFW Configs.
	 *
	 * @return array $configs BGTFW Configs.
	 */
	public static function remove_theme_container( $configs ) {

		$is_preview = ! empty ( $_REQUEST['preview'] ) ? $_REQUEST['preview'] : null;

		// If this is a preview of a post, remove the container.
		if ( $is_preview ) {
			$configs['template']['pages'][ 'page_home.php' ]['entry-content'] = '';
			$configs['template']['pages'][ 'default' ]['entry-content'] = '';
		}

		return $configs;
	}

	/**
	 * Get the themes color palette theme mod.
	 *
	 * @since 1.2.7
	 *
	 * @return array $colors Array of colors.
	 */
	public static function get_color_palettes() {

		$color_palettes = get_theme_mod( 'boldgrid_color_palette', array() );
		$color_palettes_decoded = is_array( $color_palettes ) ? $color_palettes : json_decode( $color_palettes, 1 );
		$active_palette = ! empty( $color_palettes_decoded['state']['active-palette'] ) ?
			$color_palettes_decoded['state']['active-palette'] : '';

		$colors = ! empty( $color_palettes_decoded['state']['palettes'][ $active_palette ]['colors'] ) ?
			$color_palettes_decoded['state']['palettes'][ $active_palette ]['colors'] : array();

		/*
		 * Disable Neutral colors. Wont work on client side w/o mods to JS.
		 */
		$neutral = ! empty( $color_palettes_decoded['state']['palettes'][ $active_palette ]['neutral-color'] ) ?
			$color_palettes_decoded['state']['palettes'][ $active_palette ]['neutral-color'] : false;

		$palette = array(
			'defaults' => $colors,
			'neutral' => $neutral,
		);

		if ( ! $palette['defaults'] ) {
			$palette = self::$default_palette;
		}

		return $palette;
	}

	/**
	 * Get the correct theme body class
	 *
	 * @param int $_REQUEST['post']
	 *
	 * @return string
	 */
	public static function theme_body_class() {
		$post_id = ! empty( $_REQUEST['post'] ) ? intval( $_REQUEST['post'] ) : null;

		$stylesheet = get_stylesheet();

		$staging_theme_stylesheet = get_option( 'boldgrid_staging_stylesheet' );

		if ( $staging_theme_stylesheet ) {
			$staged_theme = wp_get_theme( $staging_theme_stylesheet );

			$post_status = get_post_status( $post_id );

			if ( 'staging' == $post_status && is_object( $staged_theme ) ) {
				$stylesheet = $staging_theme_stylesheet;
			}
		}

		//$this->theme_stylesheet = $stylesheet;

		$theme_mods = get_option( 'theme_mods_' . $stylesheet );

		$boldgrid_palette_class = ! empty( $theme_mods['boldgrid_palette_class'] ) ?
			$theme_mods['boldgrid_palette_class'] : 'palette-primary';

		$boldgrid_palette_class .= ' ' . self::$plugin_body_class;

		return $boldgrid_palette_class;
	}


	/**
	 * Check to see if we are editing a boldgrid theme page
	 * Keeping in mind that if this is a staged page it will be using the staged theme.
	 * If the staged theme is not a Boldgrid theme, and this is a staged page return false
	 *
	 * @return boolean
	 */
	public static function is_editing_boldgrid_theme() {
		global $boldgrid_theme_framework;
		$post_id = ! empty( $_REQUEST['post'] ) ? intval( $_REQUEST['post'] ) : null;

		$is_editing_boldgrid_theme = ( bool ) self::get_boldgrid_theme_name( wp_get_theme() );

		if ( $post_id ) {
			$post_status = get_post_status( $post_id );

			$staging_theme_stylesheet = get_option( 'boldgrid_staging_stylesheet' );

			$staged_theme = wp_get_theme( $staging_theme_stylesheet );

			if ( 'staging' == $post_status && is_object( $staged_theme ) ) {
				$is_editing_boldgrid_theme = ( bool ) self::get_boldgrid_theme_name( $staged_theme );
			}
		}

		// Check the framework global.
		$is_editing_boldgrid_theme = $is_editing_boldgrid_theme ?
			$is_editing_boldgrid_theme : ! empty( $boldgrid_theme_framework );

		// Check boldgrid theme.
		$is_editing_boldgrid_theme = $is_editing_boldgrid_theme ?
			$is_editing_boldgrid_theme : ( bool ) get_theme_mod( 'boldgrid_color_palette' );

		/**
		 * Allow other theme developers to indicate that they would like all BG edit tools enabled.
		 *
		 * @since 1.0.9
		 *
		 * @param boolean $is_editing_boldgrid_theme Whether or not the user is editing a BG theme.
		 */
		$is_editing_boldgrid_theme = apply_filters( 'is_editing_boldgrid_theme', $is_editing_boldgrid_theme );

		return $is_editing_boldgrid_theme;
	}

}
