<?php
/**
 * Minimum version notices are translatable in the plugin text domain and escape the version.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Compatibility
 */
class Test_Boldgrid_Editor_Compatibility extends WP_UnitTestCase {

	/**
	 * Text domain and original text of every string translated while a notice renders.
	 *
	 * @var array
	 */
	private $translated = array();

	/**
	 * Record translations.
	 */
	public function setUp(): void {
		parent::setUp();
		add_filter( 'gettext', array( $this, 'record_gettext' ), 10, 3 );
	}

	/**
	 * Stop recording translations.
	 */
	public function tearDown(): void {
		remove_filter( 'gettext', array( $this, 'record_gettext' ), 10 );
		parent::tearDown();
	}

	/**
	 * Record one translation.
	 *
	 * @param string $translation Translated text.
	 * @param string $text        Original text.
	 * @param string $domain      Text domain.
	 * @return string
	 */
	public function record_gettext( $translation, $text, $domain ) {
		$this->translated[] = array( $domain, $text );

		return $translation;
	}

	/**
	 * Render a notice method.
	 *
	 * @param string $method Notice method name.
	 * @return string
	 */
	private function render( $method ) {
		$compatibility = new Boldgrid_Editor_Compatibility(
			array(
				'wp'  => '9.9<b>',
				'php' => '9.9<b>',
			)
		);

		ob_start();
		$compatibility->$method();

		return ob_get_clean();
	}

	/**
	 * Data for test_notice().
	 *
	 * @return array
	 */
	public function notice_provider() {
		return array(
			'WordPress' => array(
				'invalidWPVersion',
				'Failed to activate the Post and Page Builder! Your WordPress version is not compatible. This plugin requires at least WordPress %s',
			),
			'PHP'       => array(
				'invalidPHPVersion',
				'Failed to activate the Post and Page Builder! Your PHP version is not compatible. This plugin requires at least PHP %s',
			),
		);
	}

	/**
	 * The notice translates one fixed string in the plugin text domain and fills in the escaped version.
	 *
	 * @dataProvider notice_provider
	 *
	 * @param string $method Notice method name.
	 * @param string $text   Translatable text.
	 */
	public function test_notice( $method, $text ) {
		$output    = $this->render( $method );
		$text_only = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( $output ) ), ' ' );

		$this->assertStringContainsString( '9.9&lt;b&gt;', $output );
		$this->assertSame( sprintf( $text, '9.9<b>' ), html_entity_decode( $text_only, ENT_QUOTES ) );
		$this->assertContains( array( 'boldgrid-editor', $text ), $this->translated );
	}
}
