<?php
/**
 * Class: Boldgrid_Editor_Option
*
* Helper methods for organizing wordpress options.
*
* @since      1.3
* @package    Boldgrid_Editor
* @subpackage Boldgrid_Editor_Option
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

/**
 * Class: Boldgrid_Editor_Option
*
* Parse pages to find component usage.
*
* @since      1.3
*/
class Boldgrid_Editor_Option {

	const OPTION_NAMESPACE = 'boldgrid_editor';

	/**
	 * Retrieve an option from the stored list of editor options.
	 *
	 * @since 1.3
	 *
	 * @param string $key Index of value.
	 * @param mixed  $default Default value if not found.
	 *
	 * @return mixed editor option
	 */
	public static function get( $key, $default = null ) {
		$boldgrid_editor = get_option( self::OPTION_NAMESPACE, array() );
		return ! empty( $boldgrid_editor[ $key ] ) ? $boldgrid_editor[ $key ] : $default;
	}

	/**
	 * Store an option for the plugin in a single option.
	 *
	 * @since 1.3
	 *
	 * @param string $key Name of value of value.
	 * @param mixed  $value Value to store.
	 */
	public static function update( $key, $value ) {
		$boldgrid_editor = get_option( self::OPTION_NAMESPACE, array() );
		$boldgrid_editor = is_array( $boldgrid_editor ) ? $boldgrid_editor : array();
		$boldgrid_editor[ $key ] = $value;
		update_option( self::OPTION_NAMESPACE, $boldgrid_editor );
	}

	/**
	 * Delete key from options array.
	 *
	 * @since 1.6
	 *
	 * @param  string $key
	 */
	public static function delete( $key ) {
		$boldgrid_editor = get_option( self::OPTION_NAMESPACE, array() );
		if ( isset( $boldgrid_editor[ $key ] ) ) {
			unset( $boldgrid_editor[ $key ] );
			update_option( self::OPTION_NAMESPACE, $boldgrid_editor );
		}
	}

	/**
	 * Delete the BoldGrid Editor Option.
	 *
	 * @since 1.6
	 */
	public static function clear_all() {
		delete_option( self::OPTION_NAMESPACE );
	}
}
