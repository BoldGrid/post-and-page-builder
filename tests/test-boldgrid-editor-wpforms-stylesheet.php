<?php
/**
 * Tests for the WPForms stylesheet loaded in the editor.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Wpforms_Stylesheet
 *
 * WPForms functions and constants are stubbed per test. Functions cannot be undefined once
 * declared, so each test runs in its own process to cover both current and legacy WPForms
 * without leaking stubs into other tests.
 *
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class Test_Boldgrid_Editor_Wpforms_Stylesheet extends WP_UnitTestCase {

	/**
	 * Stubbed WPForms plugin URL.
	 *
	 * @var string
	 */
	const PLUGIN_URL = 'https://example.org/wp-content/plugins/wpforms/';

	/**
	 * Load the class under test.
	 */
	public function setUp(): void {
		parent::setUp();

		require_once BOLDGRID_EDITOR_PATH . '/support/wpforms/includes/class-boldgrid-editor-wpforms.php';
	}

	/**
	 * Stub the WPForms settings API and plugin URL.
	 *
	 * @param string|null $disable_css Value of the disable-css setting, null for unset.
	 */
	protected function stub_wpforms( $disable_css ) {
		$GLOBALS['ppb_test_wpforms_settings'] = null === $disable_css ? array() : array( 'disable-css' => $disable_css );

		if ( ! defined( 'WPFORMS_PLUGIN_URL' ) ) {
			define( 'WPFORMS_PLUGIN_URL', self::PLUGIN_URL );
		}

		if ( ! function_exists( 'wpforms_setting' ) ) {
			/**
			 * Stub the WPForms settings helper.
			 *
			 * @param string $key           Setting key.
			 * @param mixed  $default_value Default value when the setting is unset.
			 * @return mixed
			 */
			function wpforms_setting( $key, $default_value = false ) {
				return isset( $GLOBALS['ppb_test_wpforms_settings'][ $key ] ) ? $GLOBALS['ppb_test_wpforms_settings'][ $key ] : $default_value;
			}
		}
	}

	/**
	 * Stub the render engine helpers available in WPForms 1.8.1 and later.
	 *
	 * @param bool $with_min_suffix Whether to also stub wpforms_get_min_suffix().
	 */
	protected function stub_render_engine( $with_min_suffix = true ) {
		if ( ! function_exists( 'wpforms_get_render_engine' ) ) {
			/**
			 * Stub the WPForms render engine helper.
			 *
			 * @return string
			 */
			function wpforms_get_render_engine() {
				return 'modern';
			}
		}

		if ( $with_min_suffix && ! function_exists( 'wpforms_get_min_suffix' ) ) {
			/**
			 * Stub the WPForms minified asset suffix helper.
			 *
			 * @return string
			 */
			function wpforms_get_min_suffix() {
				return '.min';
			}
		}
	}

	/**
	 * Full styles use the render engine directory on WPForms 1.8.1 and later.
	 */
	public function test_full_styles_render_engine_path() {
		$this->stub_wpforms( '1' );
		$this->stub_render_engine();

		$this->assertSame(
			self::PLUGIN_URL . 'assets/css/frontend/modern/wpforms-full.min.css',
			Boldgrid_Editor_Wpforms::get_stylesheet()
		);
	}

	/**
	 * Base styles use the render engine directory on WPForms 1.8.1 and later.
	 */
	public function test_base_styles_render_engine_path() {
		$this->stub_wpforms( '2' );
		$this->stub_render_engine();

		$this->assertSame(
			self::PLUGIN_URL . 'assets/css/frontend/modern/wpforms-base.min.css',
			Boldgrid_Editor_Wpforms::get_stylesheet()
		);
	}

	/**
	 * Full styles use the root stylesheet on older WPForms.
	 */
	public function test_full_styles_legacy_path() {
		$this->stub_wpforms( '1' );

		$this->assertFalse( function_exists( 'wpforms_get_render_engine' ) );
		$this->assertSame( self::PLUGIN_URL . 'assets/css/wpforms-full.css', Boldgrid_Editor_Wpforms::get_stylesheet() );
	}

	/**
	 * Base styles use the root stylesheet on older WPForms.
	 */
	public function test_base_styles_legacy_path() {
		$this->stub_wpforms( '2' );

		$this->assertFalse( function_exists( 'wpforms_get_render_engine' ) );
		$this->assertSame( self::PLUGIN_URL . 'assets/css/wpforms-base.css', Boldgrid_Editor_Wpforms::get_stylesheet() );
	}

	/**
	 * Both render engine helpers are required to use the render engine directory.
	 */
	public function test_partial_render_engine_helpers_use_legacy_path() {
		$this->stub_wpforms( '1' );
		$this->stub_render_engine( false );

		$this->assertSame( self::PLUGIN_URL . 'assets/css/wpforms-full.css', Boldgrid_Editor_Wpforms::get_stylesheet() );
	}

	/**
	 * An unset setting defaults to full styles.
	 */
	public function test_unset_setting_uses_full_styles() {
		$this->stub_wpforms( null );

		$this->assertSame( self::PLUGIN_URL . 'assets/css/wpforms-full.css', Boldgrid_Editor_Wpforms::get_stylesheet() );
	}

	/**
	 * Disabled WPForms CSS returns no stylesheet.
	 */
	public function test_disabled_css_returns_false() {
		$this->stub_wpforms( '3' );
		$this->stub_render_engine();

		$this->assertFalse( Boldgrid_Editor_Wpforms::get_stylesheet() );
	}

	/**
	 * The stylesheet is appended to the editor stylesheet list.
	 */
	public function test_mce_css_appends_stylesheet() {
		$this->stub_wpforms( '1' );
		$this->stub_render_engine();

		$wpforms = new Boldgrid_Editor_Wpforms();

		$this->assertSame(
			'one.css,two.css,' . self::PLUGIN_URL . 'assets/css/frontend/modern/wpforms-full.min.css',
			$wpforms->mce_css( 'one.css,two.css' )
		);
	}

	/**
	 * Disabled WPForms CSS leaves the editor stylesheet list unchanged.
	 */
	public function test_mce_css_disabled_leaves_list_unchanged() {
		$this->stub_wpforms( '3' );

		$wpforms = new Boldgrid_Editor_Wpforms();

		$this->assertSame( 'one.css,two.css', $wpforms->mce_css( 'one.css,two.css' ) );
		$this->assertSame( '', $wpforms->mce_css( '' ) );
	}
}
