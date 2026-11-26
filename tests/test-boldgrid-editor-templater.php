<?php
/**
 * BoldGrid Source Code
 *
 * @package Test_Boldgrid_Editor
 * @copyright BoldGrid.com
 * @author BoldGrid.com <wpb@boldgrid.com>
 */

/**
 * Templater template lookups with empty and unknown template names.
 */
class Test_Boldgrid_Editor_Templater extends WP_UnitTestCase {

	/**
	 * A tracked template is a custom template.
	 */
	public function test_is_custom_template_known_name() {
		$this->assertTrue(
			Boldgrid_Editor_Service::get( 'templater' )->is_custom_template( 'template/page/fullwidth.php' )
		);
	}

	/**
	 * Unknown and empty names are not custom templates. A null name must not be used as an
	 * array offset, which PHP 8.5 reports as a deprecation.
	 */
	public function test_is_custom_template_unknown_empty_and_null_names() {
		$templater  = Boldgrid_Editor_Service::get( 'templater' );
		$deprecated = array();

		set_error_handler(
			function ( $errno, $errstr ) use ( &$deprecated ) {
				$deprecated[] = $errstr;
				return true;
			},
			E_DEPRECATED
		);

		$this->assertFalse( $templater->is_custom_template( 'theme/page.php' ) );
		$this->assertFalse( $templater->is_custom_template( '' ) );
		$this->assertFalse( $templater->is_custom_template( null ) );

		restore_error_handler();

		$this->assertSame( array(), $deprecated );
	}
}
