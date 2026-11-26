<?php
/**
 * Smoke tests: the plugin loads under the WordPress test suite.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Plugin_Load
 */
class Test_Boldgrid_Editor_Plugin_Load extends WP_UnitTestCase {

	/**
	 * The bootstrap constants point at this checkout and match the plugin header.
	 */
	public function test_constants_are_defined() {
		$this->assertSame( 'bgppb', BOLDGRID_EDITOR_KEY );
		$this->assertSame( realpath( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR ), realpath( BOLDGRID_EDITOR_PATH ) );
		$this->assertSame( BOLDGRID_EDITOR_PATH . '/post-and-page-builder.php', BOLDGRID_EDITOR_ENTRY );

		$header = get_file_data(
			BOLDGRID_EDITOR_ENTRY,
			array(
				'Version'     => 'Version',
				'RequiresPHP' => 'Requires PHP',
			)
		);
		$this->assertSame( $header['Version'], BOLDGRID_EDITOR_VERSION );
		$this->assertSame( '7.4', $header['RequiresPHP'] );
	}

	/**
	 * The multisite CI leg really runs multisite, and the others really run single site.
	 *
	 * The WordPress test library reads WP_MULTISITE, so this fails if a leg's name and behavior drift apart.
	 */
	public function test_multisite_mode_matches_the_requested_environment() {
		$this->assertSame( '1' === getenv( 'WP_MULTISITE' ), is_multisite() );
	}

	/**
	 * The plugin passed its version and build checks and hooked its setup.
	 */
	public function test_setup_is_hooked() {
		$this->assertTrue( function_exists( 'boldgrid_editor_setup' ) );
		$this->assertTrue( class_exists( 'Boldgrid_Editor' ) );
		$this->assertTrue( class_exists( '\Boldgrid\Library\Util\Load' ) );
		$this->assertNotFalse( has_action( 'setup_theme', 'boldgrid_editor_setup' ) );
	}

	/**
	 * Setup ran on the front-end path and registered the shared services.
	 */
	public function test_services_are_registered() {
		$this->assertInstanceOf( 'Boldgrid_Editor', Boldgrid_Editor_Service::get( 'main' ) );
		$this->assertTrue( class_exists( 'Boldgrid_Editor_Setting' ) );

		$config = Boldgrid_Editor_Service::get( 'config' );
		$this->assertIsArray( $config );
		$this->assertSame( 'boldgrid-editor', $config['plugin_name'] );
		$this->assertContains( 'bgppb', $config['valid_editors'] );
	}
}
