<?php
/**
 * Class: Boldgrid_Editor_Builder_Fonts
 *
 * Customization of fonts in the Page and Post Editor.
 *
 * @since      1.3
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Builder_Fonts
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Builder_Fonts
 *
 * Customization of fonts in the Page and Post Editor.
 *
 * @since      1.3
 */
class Boldgrid_Editor_Builder_Fonts {

	/**
	 * Scan the page for fonts used.
	 *
	 * @since 1.3.
	 *
	 * @param string $html Page HTML.
	 *
	 * @return array Fonts being used.
	 */
	public function parse_fonts( $html ) {
		$dom = new DOMDocument();
		@$dom->loadHTML( $html );
		$xpath = new DOMXPath( $dom );

		return Boldgrid_Editor_Builder_Components::find_fonts( $xpath );
	}

	/**
	 * Create a google fonts url.
	 *
	 * @since 1.3.
	 *
	 * @param array $fonts Page HTML.
	 *
	 * @return string Font Url.
	 */
	public function create_font_url( $families ) {

		if ( empty( $families ) ) {
			return;
		}

		$familyParam = array();
		foreach ( $families as $familyName => $config ) {
			$param = $familyName;
			if ( ! empty( $config['weights'] ) ) {
				$param = $familyName . ':' . implode( ',', array_unique( $config['weights'] ) );
			}

			$familyParam[] = $param;
		}

		$base_url = 'https://fonts.googleapis.com/css?';
		$href = implode( '|', $familyParam );
		$href = $base_url . http_build_query( array( 'family' => $href ) );

		return $href;
	}

	/**
	 * Parse page for fonts used and print google font url.
	 *
	 * @since 1.3.
	 *
	 * @global $post.
	 *
	 * @return string $head_link Font Url.
	 */
	public function render_page_fonts() {
		global $post;

		$head_link = '';
		if ( ! empty( $post->post_content ) ) {
			$fonts = $this->parse_fonts( $post->post_content );
			$head_link = $this->create_font_url( $fonts );
		}

		if ( $head_link ) {
			wp_enqueue_style( 'boldgrid-editor-fonts', $head_link );
		}

		return $head_link;
	}

	/**
	 * Convert theme mod to class name.
	 *
	 * @since 1.3.
	 *
	 * @param string $theme_mod Theme Mod.
	 *
	 * @return string $class_name.
	 */
	public function thememod_class_name( $theme_mod ) {
		$class_name = false;

		switch ( $theme_mod ) {
			case 'alternate_headings_font_family':
				$class_name = 'bg-font-family-alt';
				break;
			case 'body_font_family':
				$class_name = 'bg-font-family-body';
				break;
			case 'headings_font_family':
				$class_name = 'bg-font-family-heading';
				break;
			case 'menu_font_family':
				$class_name = 'bg-font-family-menu';
				break;
		}

		return $class_name;
	}

	/**
	 * If the font is a sytem fonts, lowercase it.
	 *
	 * @since 1.4
	 *
	 * @param  string $font_name Font name to check against.
	 * @return string            Font name updated.
	 */
	public function update_system_font( $font_name ) {
		$updated_font = strtolower( $font_name );
		$lowercase_fonts = array(
			'monospace',
			'sans-serif',
			'serif',
		);

		if ( in_array( $updated_font, $lowercase_fonts, true ) ) {
			$font_name = $updated_font;
		}

		return $font_name;
	}

	/**
	 * Get the themes fonts.
	 *
	 * @since 1.3.
	 *
	 * @global $boldgrid_theme_framework Boldgrid_Theme_Framework.
	 *
	 * @return array $theme_fonts.
	 */
	public function get_theme_fonts() {
		global $boldgrid_theme_framework;

		$theme_mods = array(
			'body_font_family',
			'alternate_headings_font_family',
			'headings_font_family',
			// 'menu_font_family',
		);

		$theme_fonts = array();
		if ( $boldgrid_theme_framework ) {

			$configs = $boldgrid_theme_framework->get_configs();
			$defaults = ! empty( $configs['customizer-options']['typography']['defaults'] ) ?
				$configs['customizer-options']['typography']['defaults'] : array();

			foreach ( $defaults as $key => $default ) {
				if ( false !== array_search( $key, $theme_mods, true ) ) {
					$class_name = $this->thememod_class_name( $key );
					if ( $class_name ) {
						$default = $this->update_system_font( $default );
						$theme_fonts[ $class_name ] = $default;
					}
				}
			}
		}

		$theme_fonts = array_unique( $theme_fonts );

		return $theme_fonts;
	}
}
