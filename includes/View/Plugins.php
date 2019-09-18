<?php
/**
 * File: Plugins.php
 *
 * Plugins page view.
 *
 * @since      1.11.2
 * @package    Boldgrid
 * @subpackage Boldgrid\PPB\View
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */
namespace Boldgrid\PPB\View;

/**
 * Class: Plugins
 *
 * Plugins Page View.
 *
 * @since      1.11.2
 */
class Plugins {

	/**
	 * Setup Process.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		add_filter( 'plugin_action_links_post-and-page-builder/post-and-page-builder.php',
			[ $this, 'plugin_action_links' ], 10, 4 );
	}

	/**
	 * Filter the links under "Post & Page Builder" within WP Dashboard > Plugins > Installed Plugins.
	 *
	 * @since 1.11.2
	 *
	 * @param array  $actions     An array of plugin action links. By default this can include 'activate',
	 *                            'deactivate', and 'delete'. With Multisite active this can also include
	 *                            'network_active' and 'network_only' items.
	 * @param string $plugin_file Path to the plugin file relative to the plugins directory.
	 * @param array  $plugin_data An array of plugin data. See `get_plugin_data()`.
	 * @param string $context     The plugin context. By default this can include 'all', 'active', 'inactive',
	 *                            'recently_activated', 'upgrade', 'mustuse', 'dropins', and 'search'.
	 */
	public function plugin_action_links( $actions, $plugin_file, $plugin_data, $context ) {
		$config = \Boldgrid_Editor_Service::get( 'config' );

		$row_actions = [
			'settings' => '<a href="' . esc_url( admin_url('edit.php?post_type=bg_block&page=bgppb-settings' ) ) . '">' .
				esc_html__( 'Settings', 'boldgrid-editor' ) . '</a>',
		];

		if ( empty( $config['premium']['is_premium'] ) ) {
			$row_actions[] = '<a href="' . esc_url( $config['urls']['premium_key'] . '?source=bgppb-plugins-list' ) .
				 '" target="_blank">' . esc_html__( 'Get Premium', 'boldgrid-editor' ) . '</a>';
		}

		$actions = array_merge( $row_actions, $actions );

		return $actions;
	}
}
