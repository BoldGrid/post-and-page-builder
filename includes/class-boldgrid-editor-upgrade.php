<?php
/**
 * File: class-boldgrid-editor-upgrade.php
 *
 * Handle plugin update events.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Upgrade
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Upgrade
 *
 * Handle plugin update events.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Upgrade {

	/**
	 * On upgrader_process_complete check to see if the editor plugin updated.
	 *
	 * @since 1.6
	 */
	public function plugin_update_check( $upgrader_object, $options ) {
		$editor_plugin = plugin_basename( BOLDGRID_EDITOR_ENTRY );

		if ( $options['action'] == 'update' && $options['type'] == 'plugin' ) {
			$plugins = ! empty( $options['plugins'] ) ? $options['plugins'] : array();
			foreach( $plugins as $plugin ) {
				if ( $plugin === $editor_plugin ) {
					$this->on_plugin_update();
					break;
				}
			}
		}
	}

	/**
	 * Opperation to occur when the plugin updates.
	 *
	 * @since 1.6
	 */
	public function on_plugin_update() {
		Boldgrid_Editor_Option::update( 'has_checked_version', 0 );
		Boldgrid_Editor_Option::update( 'has_flushed_rewrite', 0 );
	}
}
