<?php
/**
 * Plugin Name: Post and Page Builder
 * Plugin URI: https://www.boldgrid.com/boldgrid-editor/?utm_source=ppb-wp-repo&utm_medium=plugin-uri&utm_campaign=ppb
 * Description: Customized drag and drop editing for posts and pages. The Post and Page Builder adds functionality to the existing TinyMCE Editor to give you easier control over your content.
 * Version: 1.27.15
 * Author: BoldGrid <support@boldgrid.com>
 * Author URI: https://www.boldgrid.com/?utm_source=ppb-wp-repo&utm_medium=author-uri&utm_campaign=ppb
 * Text Domain: boldgrid-editor
 * Domain Path: /languages
 * Requires PHP: 7.4
 * License: GPLv2 or later
 *
 * @package Boldgrid_Editor
 */

// Prevent direct calls.
if ( ! defined( 'WPINC' ) ) {
	die();
}

// Define Editor version.
if ( ! defined( 'BOLDGRID_EDITOR_VERSION' ) ) {
	define( 'BOLDGRID_EDITOR_VERSION', implode( get_file_data( __FILE__, array( 'Version' ), 'plugin' ) ) );
}

// Define boldgrid-backup key.
if ( ! defined( 'BOLDGRID_EDITOR_KEY' ) ) {
	define( 'BOLDGRID_EDITOR_KEY', 'bgppb' );
}

// Define Editor path.
if ( ! defined( 'BOLDGRID_EDITOR_PATH' ) ) {
	define( 'BOLDGRID_EDITOR_PATH', __DIR__ );
}

// Define temporary path for migration.
if ( ! defined( 'BOLDGRID_PPB_PATH' ) ) {
	define( 'BOLDGRID_PPB_PATH', __DIR__ );
}

// Define Editor entry.
if ( ! defined( 'BOLDGRID_EDITOR_ENTRY' ) ) {
	define( 'BOLDGRID_EDITOR_ENTRY', __FILE__ );
}

// Define Editor configuration directory.
if ( ! defined( 'BOLDGRID_EDITOR_CONFIGDIR' ) ) {
	define( 'BOLDGRID_EDITOR_CONFIGDIR', BOLDGRID_EDITOR_PATH . '/includes/config' );
}

/**
* Initialize the editor plugin for Editors and Administrators in the admin section.
*/
if ( ! function_exists( 'boldgrid_editor_setup' ) && false === strpos( BOLDGRID_EDITOR_VERSION, '1.6.0.' ) ) {

	// BEFORE LOADING CHECK - WP & PHP Versions.
	require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-compatibility.php';
	$compatibility = new Boldgrid_Editor_Compatibility(
		array(
			'wp' => '4.7',
			'php' => '7.4',
		)
	);

	if ( ! $compatibility->checkVersions() ) {
		return;
	}

	// BEFORE LOADING CHECK - Build Files exist.
	require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-development.php';
	$development = new Boldgrid_Editor_Development();
	if ( ! $development->checkValidBuild() ) {
		return;
	}

	// Load the editor class.
	require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor.php';

	register_activation_hook( __FILE__, array( 'Boldgrid_Editor_Activate', 'on_activate' ) );
	register_activation_hook( __FILE__, 'boldgrid_editor_deactivate' );

	register_deactivation_hook( __FILE__, array( 'Boldgrid_Editor_Activate', 'on_deactivate' ) );

	add_action(
		'activate_boldgrid-editor/boldgrid-editor.php',
		array( 'Boldgrid_Editor_Activate', 'block_activate' )
	);

	/**
	 * Instantiate and run the Post and Page Builder plugin.
	 *
	 * @since 1.0
	 *
	 * @return void
	 */
	function boldgrid_editor_setup() {
		Boldgrid_Editor_Service::register(
			'main',
			new Boldgrid_Editor()
		);

		Boldgrid_Editor_Service::get( 'main' )->run();
	}

	$autoload = require plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';

	/**
	 * Register BoldGrid Library version before Load (Composer 2 installed.json format).
	 */
	$plugin_file = plugin_basename( __FILE__ );
	\Boldgrid\Library\Util\Option::init();
	$libraries = \Boldgrid\Library\Util\Option::get( 'library' );
	if ( empty( $libraries[ $plugin_file ] ) ) {
		$installed_file = plugin_dir_path( __FILE__ ) . 'vendor/composer/installed.json';
		if ( is_readable( $installed_file ) ) {
			$installed = json_decode( file_get_contents( $installed_file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			if ( is_array( $installed ) ) {
				$packages = isset( $installed['packages'] ) ? $installed['packages'] : $installed;
				foreach ( $packages as $package ) {
					if (
						! empty( $package['name'] ) &&
						'boldgrid/library' === $package['name'] &&
						! empty( $package['version_normalized'] )
					) {
						\Boldgrid\Library\Util\Option::set( $plugin_file, $package['version_normalized'] );
						break;
					}
				}
			}
		}
	}

	// Load Library.
	new \Boldgrid\Library\Util\Load(
		array(
			'type'            => 'plugin',
			'file'            => $plugin_file,
			'loader'          => $autoload,
			'keyValidate'     => true,
			'licenseActivate' => false,
		)
	);

	/**
	 * Drop Library's activation register callback.
	 *
	 * The callback only supports Composer 1's installed.json format and would
	 * overwrite the Composer 2 library version registered above with null.
	 */
	$activate_hook = 'activate_' . $plugin_file;
	global $wp_filter;
	if ( isset( $wp_filter[ $activate_hook ] ) ) {
		foreach ( $wp_filter[ $activate_hook ]->callbacks as $priority => $callbacks ) {
			foreach ( $callbacks as $callback ) {
				if (
					is_array( $callback['function'] ) &&
					isset( $callback['function'][0], $callback['function'][1] ) &&
					$callback['function'][0] instanceof \Boldgrid\Library\Util\Registration\Plugin &&
					'register' === $callback['function'][1]
				) {
					remove_action( $activate_hook, $callback['function'], $priority );
				}
			}
		}
	}

	/**
	 * Deactivate the legacy BoldGrid Editor plugin if it is still installed.
	 *
	 * @since 1.0
	 *
	 * @return void
	 */
	function boldgrid_editor_deactivate() {
		deactivate_plugins( array( 'boldgrid-editor/boldgrid-editor.php' ), true );
	}

	if ( ! class_exists( 'Boldgrid_Editor_Upgrade' ) ) {
		require_once BOLDGRID_PPB_PATH . '/includes/class-boldgrid-editor-upgrade.php';
	}

	// Plugin update checks.
	$upgrade = new Boldgrid_Editor_Upgrade();
	add_action( 'upgrader_process_complete', array( $upgrade, 'plugin_update_check' ), 10, 2 );


	$theme = new Boldgrid_Editor_Theme();
	add_filter( 'boldgrid_theme_framework_config', array( $theme, 'BGTFW_config_filters' ) );

	// Load on an early hook so we can tie into framework configs.
	if ( is_admin() ) {
		add_action( 'init', 'boldgrid_editor_setup' );
	} else {
		add_action( 'setup_theme', 'boldgrid_editor_setup' );
	}
}
