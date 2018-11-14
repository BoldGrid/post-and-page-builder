<?php
/**
 * Class: Boldgrid_Editor_Media_Map
 *
 * Parse pages to find component usage.
 *
 * @since      1.3
 * @package    Boldgrid_Editor
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Media_Map
 *
 * Parse pages to find component usage.
 *
 * @since      1.3
 */
class Boldgrid_Editor_Media_Map {

	const DYNAMIC_MAP_VERSION = '1.3';

	/**
	 * Update google maps from static maps to dynamic maps.
	 *
	 * This is done by scanning all pages replacing the images with iframes.
	 *
	 * @since 1.3
	 */
	public function upgrade_maps() {
		if ( $this->should_update_maps() ) {
			// Save state first to make sure it doesnt happen more than once.
			$this->save_validated_state();
			$pages = Boldgrid_Layout::get_pages_all_status();
			$this->update_pages( $pages );
		}
	}

	/**
	 * On activation save plugin version.
	 *
	 * If the user has no plugin version and the plugin is active we can
	 * assume that this plugin is old and needs updates || plugin version < 1.3.
	 *
	 * @since 1.3
	 *
	 * @return boolean Should the user update their maps.
	 */
	public function should_update_maps() {
		$has_updated_maps = Boldgrid_Editor_Option::get( 'updated_maps' );
		$has_updated_maps = ! empty( $has_updated_maps );

		return false === $has_updated_maps && Boldgrid_Editor_Version::is_activated_version_older_than( self::DYNAMIC_MAP_VERSION );
	}

	/**
	 * Save the map updated state.
	 *
	 * @since 1.3
	 */
	public function save_validated_state() {
		Boldgrid_Editor_Option::update( 'updated_maps', 1 );
	}

	/**
	 * Update all pages markup.
	 *
	 * @since 1.3.
	 *
	 * array $pages All pages to be updated.
	 */
	public function update_pages( $pages ) {
		foreach( $pages as $page ) {
			$this->update_page( $page );
		}
	}

	/**
	 * Update the markup for 1 page.
	 *
	 * @since 1.3
	 *
	 * @param WP_Post $page Page to be updated.
	 */
	public function update_page( $page ) {
		$content = ! empty( $page->post_content ) ? $page->post_content : '';
		$dom = new DOMDocument();
		@$dom->loadHTML( Boldgrid_Layout::utf8_to_html( $content ) );
		$xpath = new DOMXPath( $dom );

		if ( $this->replaceElements( $xpath, $dom ) && ! empty( $page->ID ) ) {
			// Save the body from DOMDoc.
			$body = $dom->getElementsByTagName('body');
			if ( $body && 0 < $body->length && $body->item(0) ) {
				$mock = new DOMDocument;
				foreach ( $body->item(0)->childNodes as $child ){
				    $mock->appendChild( $mock->importNode( $child, true ) );
				}

				$new_html = $mock->saveHTML();
				if ( ! empty( $new_html ) ) {
					$this->save_post( $page->ID, $new_html );
				}
			}
		}
	}

	/**
	 * Update the post with the new map.
	 *
	 * @since 1.3
	 *
	 * @param page_id $page_id Page id to update.
	 * @param string $html html to save.
	 */
	public function save_post( $page_id, $html ) {
		$new_post = array (
			'ID' => $page_id,
			'post_content' => $html,
		);

		// Save Changes.
		wp_update_post( $new_post );
	}

	/**
	 * Update all pages markup.
	 *
	 * @since 1.3
	 */
	public function replaceElements( $xpath, $dom ) {

		$query_string = '//a[starts-with(@href, "http://maps.google.com/?q")]';
		$updated_content = false;

		$replacement_nodes = array();
		foreach ( $xpath->query( $query_string ) as $node ) {
			if ( $node->hasChildNodes() && 1 === sizeof( $node->childNodes ) && 'img' == $node->firstChild->tagName ) {
				$replacement_nodes[] = $node;
			}
		}

		foreach( $replacement_nodes as $node ) {
			$img = $node->firstChild;
			$iframe_html = $this->create_map_iframe( $img );
			if ( $iframe_html ) {
				$updated_content = true;

				$iframe_node = $dom->createDocumentFragment();
				$iframe_node->appendXML( $iframe_html );
				$node->parentNode->replaceChild( $iframe_node, $node );
			}
		}

		return $updated_content;
	}

	/**
	 * Create the iframe markup.
	 *
	 * @since 1.3
	 *
	 * @return string $html HTML to be inserted for markup.
	 */
	public function create_map_iframe( $img ) {
		$src = $img->getAttribute('src');
		$attr_width = $img->getAttribute('width');
		$attr_height = $img->getAttribute('height');

		$parsed_url = parse_url( $src );
		$query_string = ! empty( $parsed_url['query'] ) ? $parsed_url['query'] : '';
		$valid_host = ! empty( $parsed_url['host'] ) ? $parsed_url['host'] === 'maps.googleapis.com' : false;

		parse_str( $query_string, $query_vars );
		$query_vars = $this->format_required_vars( $query_vars );

		// If all required vars are presnt and the user hasnt added a key.
		$html = false;
		if ( ! empty( $query_vars ) && empty( $query_vars['key'] ) && $valid_host ) {
			$translated_params = $this->translate_vars( $query_vars );
			$width = empty( $attr_width ) ? $translated_params['width'] : $attr_width;
			$height = empty( $attr_height ) ? $translated_params['height'] : $attr_height;
			$translated_params['output'] = 'embed';

			unset( $translated_params['width'] );
			unset( $translated_params['height'] );

			$src_string = http_build_query( $translated_params );
			// Do not url encode.
			$src_string = str_replace( '&', '&amp;', $src_string );

			$html = sprintf(
				'<iframe class="boldgrid-google-maps" src="https://maps.google.com/maps?%s"' .
				' style="border:0" width="%s" height="%s" frameborder="0"></iframe>',
				$src_string, $width, $height );
		}

		return $html;
	}

	/**
	 * Validate the static maps url to ensure that we have all the needed params.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 *
	 * @return array $formatted_params Url params.
	 */
	public function format_required_vars( $query_vars ) {
		$expected = array( 'zoom' => null, 'center' => null, 'size' => null, 'maptype' => null );
		$formatted_params = array();
		foreach ( $expected as $param => $val ) {
			if ( ! empty( $query_vars[ $param ] ) ) {
				$formatted_params[ $param ] = $query_vars[ $param ];
			} else {
				return array();
			}
		}

		return $formatted_params;
	}

	/**
	 * Given static map parameters, translate them into the parameters needed for the embed API.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 *
	 * @return array $translated_params Query parameters in the emebed format.
	 */
	public function translate_vars( $query_vars ) {
		$translated_params = array();
		$translated_params = $this->translateZoom( $query_vars, $translated_params );
		$translated_params = $this->translateLocation( $query_vars, $translated_params );
		$translated_params = $this->translateType( $query_vars, $translated_params );
		$translated_params = $this->translateSize( $query_vars, $translated_params );

		return $translated_params;
	}

	/**
	 * Change size to width and height.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 * @param array $translated_params Parameters that will be passed to embed api.
	 *
	 * @return array $translated_params Query parameters in the emebed format.
	 */
	public function translateSize( $query_vars, $translated_params ) {
		$size = $query_vars['size'];
		$sizes = explode( 'x', $size );

		// 400 is the default width and height.
		$translated_params['width'] =  ! empty( $sizes[0] ) ? $sizes[0] : 400;
		$translated_params['height'] = ! empty( $sizes[1] ) ? $sizes[1] : 400;

		return $translated_params;
	}

	/**
	 * Map roadmap, satellite, hybrid and terrain to m, k, h and p.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 * @param array $translated_params Parameters that will be passed to embed api.
	 *
	 * @return array $translated_params Query parameters in the emebed format.
	 */
	public function translateType( $query_vars, $translated_params ) {
		$type = $query_vars['maptype'];
		$map = array(
			'roadmap' => 'm',
			'satellite' => 'k',
			'hybrid' => 'h',
			'terrain' => 'p',
		);

		$translated_params['t'] = ! empty( $map[ $type ] ) ? $map[ $type ] : '';

		return $translated_params;
	}

	/**
	 * Change zoom to z.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 * @param array $translated_params Parameters that will be passed to embed api.
	 *
	 * @return array $translated_params Query parameters in the emebed format.
	 */
	public function translateZoom( $query_vars, $translated_params ) {
		$translated_params['z'] = $query_vars['zoom'];
		return $translated_params;
	}

	/**
	 * Change center to q.
	 *
	 * @since 1.3
	 *
	 * @param array $query_vars Paramters found in the static maps url.
	 * @param array $translated_params Parameters that will be passed to embed api.
	 *
	 * @return array $translated_params Query parameters in the emebed format.
	 */
	public function translateLocation( $query_vars, $translated_params ) {
		$param_type = 'q';

		// If query has more than 15 numbers treat it coords, ll.
		$query = preg_replace( '/[^0-9]/', '', $query_vars['center'] );
		if ( strlen( $query ) > 15 ) {
			$param_type = 'll';
		}

		$translated_params[ $param_type ] = $query_vars['center'];
		return $translated_params;
	}

}
