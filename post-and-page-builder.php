<?php
/**
 * Plugin Name: Post and Page Builder
 * Plugin URI: https://www.boldgrid.com/boldgrid-editor/?utm_source=ppb-wp-repo&utm_medium=plugin-uri&utm_campaign=ppb
 * Description: Customized drag and drop editing for posts and pages. The Post and Page Builder adds functionality to the existing TinyMCE Editor to give you easier control over your content.
 * Version: 1.14.0
 * Author: BoldGrid <support@boldgrid.com>
 * Author URI: https://www.boldgrid.com/?utm_source=ppb-wp-repo&utm_medium=author-uri&utm_campaign=ppb
 * Text Domain: boldgrid-editor
 * Domain Path: /languages
 * License: GPLv2 or later
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
	define( 'BOLDGRID_EDITOR_PATH', dirname( __FILE__ ) );
}

// Define temporary path for migration.
if ( ! defined( 'BOLDGRID_PPB_PATH' ) ) {
	define( 'BOLDGRID_PPB_PATH', dirname( __FILE__ ) );
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
	$compatibility = new Boldgrid_Editor_Compatibility( array(
		'wp' => '4.7',
		'php' => '5.4',
	) );

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

	register_deactivation_hook( __FILE__,  array( 'Boldgrid_Editor_Activate', 'on_deactivate' ) );

	add_action( 'activate_boldgrid-editor/boldgrid-editor.php',
		array( 'Boldgrid_Editor_Activate', 'block_activate' ) );

	function boldgrid_editor_setup () {
		Boldgrid_Editor_Service::register(
			'main',
			new Boldgrid_Editor()
		);

		Boldgrid_Editor_Service::get( 'main' )->run();
	}

	$autoload = require plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';

	// Load Library.
	new \Boldgrid\Library\Util\Load(
		array(
			'type'            => 'plugin',
			'file'            => plugin_basename( __FILE__ ),
			'loader'          => $autoload,
			'keyValidate'     => true,
			'licenseActivate' => false,
		)
	);

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
