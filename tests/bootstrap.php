<?php
/**
 * File: bootstrap.php
 *
 * Bootstrap file for PHPUnit tests.
 *
 * @package Boldgrid_Editor
 * @subpackage Boldgrid_Editor/tests
 * @author BoldGrid <support@boldgrid.com>
 */

$_tests_dir = rtrim( (string) getenv( 'WP_TESTS_DIR' ), '/' );

if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

if ( ! defined( 'BOLDGRID_EDITOR_TESTS_PLUGIN_DIR' ) ) {
	define( 'BOLDGRID_EDITOR_TESTS_PLUGIN_DIR', dirname( __DIR__ ) );
}

/*
 * Yoast/PHPUnit-Polyfills lets the WP core test suite run on every PHPUnit
 * version this plugin's PHP range needs (PHPUnit 8.5 on PHP 7.4 through 8.6).
 */
if ( ! defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/vendor/yoast/phpunit-polyfills' );
}

require_once $_tests_dir . '/includes/functions.php';

/**
 * Plugin-file diagnostics raised while the plugin loads.
 *
 * PHPUnit turns deprecations, warnings and notices into test errors only while a test runs. Compile-time
 * and include-time diagnostics (for example a constructor that returns a value, or an implicitly nullable
 * parameter) happen before that, so they would only be printed and the run would still pass. This handler
 * records them for files that ship with the plugin, and the check below fails the run.
 *
 * @global string[] $boldgrid_editor_load_diagnostics
 */
$GLOBALS['boldgrid_editor_load_diagnostics'] = array();

// PHP reports resolved paths, so compare against the resolved plugin directory.
$boldgrid_editor_plugin_real_dir = realpath( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR );

if ( false === $boldgrid_editor_plugin_real_dir ) {
	$boldgrid_editor_plugin_real_dir = rtrim( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR, '/' );
}

set_error_handler(
	function ( $errno, $errstr, $errfile, $errline ) use ( $boldgrid_editor_plugin_real_dir ) {
		// Respect the @ operator.
		if ( ! ( error_reporting() & $errno ) ) {
			return false;
		}

		$plugin_prefix = $boldgrid_editor_plugin_real_dir . '/';

		if ( 0 !== strpos( $errfile, $plugin_prefix ) ) {
			return false;
		}

		$relative = substr( $errfile, strlen( $plugin_prefix ) );

		// Development-only Composer packages are not shipped; the BoldGrid library is.
		if ( 0 === strpos( $relative, 'vendor/' ) && 0 !== strpos( $relative, 'vendor/boldgrid/' ) ) {
			return false;
		}

		$GLOBALS['boldgrid_editor_load_diagnostics'][] = sprintf( '%s:%d: [%d] %s', $relative, $errline, $errno, $errstr );

		// Let PHP's standard handler print it too.
		return false;
	}
);

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	require BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/post-and-page-builder.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';

if ( ! empty( $GLOBALS['boldgrid_editor_load_diagnostics'] ) ) {
	fwrite(
		STDERR,
		"\nPHP diagnostics raised by plugin files while loading on PHP " . PHP_VERSION . ":\n  " .
		implode( "\n  ", array_unique( $GLOBALS['boldgrid_editor_load_diagnostics'] ) ) . "\n"
	);
	exit( 1 );
}
