<?php
/**
 * BoldGrid Source Code
 *
 * @package Test_Boldgrid_Editor
 * @copyright BoldGrid.com
 * @version $Id$
 * @since 1.0.3
 * @author BoldGrid.com <wpb@boldgrid.com>
 */

/**
 * Post and Page Builder Plugin Test class
 */
class Test_Boldgrid_Editor extends WP_UnitTestCase {

	/**
	 * Class property $testClass
	 */
	protected $testClass;

	/**
	 * Class property $settings
	 */
	protected $settings = array(
		'configDir' => 'includes/config',
	);

	/**
	 * Setup the test env
	 */
	public function setUp() {

		$this->testClass = new Boldgrid_Editor( $this->settings );
		$this->configClass = new Boldgrid_Editor_Config();

	}

	/**
	 *  Override of empty tags allowed as an array
	 *  @since 1.0.3
	 */
	public function test_allow_empty_tags() {

		$testClass = new Boldgrid_Editor_MCE( $this->configClass );
		$allow_empty_tags = $testClass->allow_empty_tags( array() );
		$this->assertEquals( 'div[*],i[*]', $allow_empty_tags['extended_valid_elements'] );

	}

	/**
	 *  Testing check to see if this is a BG theme
	 *  @since 1.0.3
	 */
	public function test_is_boldgrid_theme_non_bg() {

		$is_boldgrid_theme = Boldgrid_Editor_Theme::is_editing_boldgrid_theme();
 		$this->assertEquals( false, $is_boldgrid_theme );

	}

	/**
	 *  Testing get name of theme on non BG theme
	 *  @since 1.0.3
	 */
	public function test_get_boldgrid_theme_name_non_bg ( ) {

		$get_boldgrid_theme = Boldgrid_Editor_Theme::get_boldgrid_theme_name( wp_get_theme() );
		$this->assertEquals( '', $get_boldgrid_theme );

	}

	/**
	 *  Testing the retrieval of post id through global request var's
	 *  @since 1.0.3
	 */
	public function test_get_post_url_post_not_found() {
		$testClass = new Boldgrid_Editor_Assets( array() );
		$get_post_url = $testClass->get_post_url();
		$expected = Boldgrid_Editor_Assets::remove_url_protocal( get_site_url() . '?bg_preview_page=1' );
		$this->assertEquals( $expected, $get_post_url );
	}

	/**
	 *  Testing the body class that will be added to the editor
	 *  @since 1.0.3
	 */
	public function test_theme_body_class_default(){
		$theme_body_class = Boldgrid_Editor_Theme::theme_body_class();
		$this->assertEquals( 'palette-primary boldgrid-ppb', $theme_body_class );

	}

}
