<?php
/**
 * BoldGrid Source Code
 *
 * @package Test_Boldgrid_Editor
 * @copyright BoldGrid.com
 * @version $Id$
 * @since 1.5
 * @author BoldGrid.com <wpb@boldgrid.com>
 */

/**
 * Post and Page Builder Plugin Test class
 */
class Test_Boldgrid_Assets extends WP_UnitTestCase {

	/**
	 * Config class instance.
	 *
	 * @var Boldgrid_Editor_Config
	 */
	protected $configClass;

	/**
	 * Setup the test env
	 */
	public function setUp(): void {
		parent::setUp();
		$this->configClass = new Boldgrid_Editor_Config();
	}

	/**
	 *  @since 1.5
	 */
	public function test_conflicting_assets() {

		// Framework.
		add_action( 'wp_enqueue_scripts', function () {
			wp_enqueue_style( 'boldgrid-components', 'test-url', false, '0.0.0' );
		} );

		// Test Action
		$class = $this;
		add_action( 'wp_enqueue_scripts', function () use ( &$class ) {
			global $wp_styles;
			$class->assertTrue( $wp_styles->registered[ 'boldgrid-components' ]->ver !== '0.0.0' );
		}, 999999 );

		do_action('wp_enqueue_scripts');
	}

}
