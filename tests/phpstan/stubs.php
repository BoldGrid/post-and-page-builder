<?php
/**
 * Symbols from optional plugins the editor integrates with. Callers check that each one exists first.
 *
 * @package Boldgrid_Editor
 */

/**
 * WPForms main instance.
 *
 * @return object
 */
function wpforms() {}

/**
 * WPForms setting value.
 *
 * @param string $key     Setting key.
 * @param mixed  $default Default value.
 * @return mixed
 */
function wpforms_setting( $key, $default = false ) {}

define( 'WPFORMS_PLUGIN_URL', '' );

/**
 * BoldGrid Inspirations asset manager.
 */
class Boldgrid_Inspirations_Asset_Manager {

	/**
	 * Find an asset.
	 *
	 * @param array $params Lookup parameters.
	 * @return array|false
	 */
	public function get_asset( $params ) {}
}
