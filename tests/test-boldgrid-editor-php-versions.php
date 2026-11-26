<?php
/**
 * Behavior that differs between PHP 7.4 and PHP 8.6.
 *
 * PHPUnit converts deprecations, warnings and notices into test errors, so each test fails on any
 * PHP version that reports one for the code under test.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Php_Versions
 */
class Test_Boldgrid_Editor_Php_Versions extends WP_UnitTestCase {

	/**
	 * Non-ASCII UTF-8 becomes numeric entities and ASCII, including markup, is untouched.
	 *
	 * This used mb_convert_encoding( $input, 'HTML-ENTITIES', 'UTF-8' ), deprecated as of PHP 8.2.
	 */
	public function test_utf8_to_html_encodes_non_ascii_only() {
		if ( ! function_exists( 'mb_encode_numericentity' ) ) {
			$this->assertSame( 'caf' . "\xc3\xa9", Boldgrid_Layout::utf8_to_html( 'caf' . "\xc3\xa9" ) );
			$this->assertSame( '', Boldgrid_Layout::utf8_to_html( null ) );
			return;
		}

		$this->assertSame(
			'<p class="a">caf&#233; &amp; &#9731; &#128512;</p>',
			Boldgrid_Layout::utf8_to_html( '<p class="a">caf' . "\xc3\xa9" . ' &amp; ' . "\xe2\x98\x83 \xf0\x9f\x98\x80" . '</p>' )
		);
		$this->assertSame( '', Boldgrid_Layout::utf8_to_html( '' ) );
		$this->assertSame( '', Boldgrid_Layout::utf8_to_html( null ) );
		$this->assertSame( '<div class="row">ascii</div>', Boldgrid_Layout::utf8_to_html( '<div class="row">ascii</div>' ) );
	}

	/**
	 * Gridblock parsing keeps the original characters after DOMDocument::loadHTML() reads the entities.
	 */
	public function test_utf8_to_html_round_trips_through_dom() {
		if ( ! function_exists( 'mb_encode_numericentity' ) ) {
			$this->markTestSkipped( 'mbstring is not available; utf8_to_html() returns its input unconverted.' );
		}

		$text = 'caf' . "\xc3\xa9 \xe2\x98\x83 \xf0\x9f\x98\x80";
		$dom  = new DOMDocument();

		@$dom->loadHTML( Boldgrid_Layout::utf8_to_html( '<div class="boldgrid-section"><p>' . $text . '</p></div>' ) );

		$this->assertSame( $text, $dom->getElementsByTagName( 'p' )->item( 0 )->textContent );
	}

	/**
	 * A null or unknown config key must not be used as an array offset (deprecated in PHP 8.5).
	 */
	public function test_get_configs_null_and_unknown_keys() {
		$config = new Boldgrid_Editor_Config();
		$all    = $config->get_configs();

		$this->assertIsArray( $all );
		$this->assertSame( $all, $config->get_configs( null ) );
		$this->assertSame( 'boldgrid-editor', $config->get_configs( 'plugin_name' ) );
		$this->assertSame( $all, $config->get_configs( 'no-such-config-key' ) );
	}

	/**
	 * URL sanitizers trim with an explicit character list, so PHP 8.6 (which also trims a form feed by
	 * default) returns what PHP 7.4 through 8.5 return.
	 */
	public function test_url_sanitizers_do_not_depend_on_the_trim_default() {
		$this->assertSame( " \n\r\t\v\x00", Boldgrid_Editor_Url::TRIM_CHARS );

		$url = 'http://93.184.216.34/image.png';

		$this->assertSame( $url, Boldgrid_Editor_Url::sanitize_http_url( "  \t" . $url . "\n " ) );
		$this->assertSame( $url, Boldgrid_Editor_Url::sanitize_http_url( "\f" . $url . "\f" ) );
		$this->assertSame( $url, Boldgrid_Editor_Url::sanitize_redirect_location( "\r\n" . $url . "\x00" ) );
		$this->assertFalse( Boldgrid_Editor_Url::sanitize_http_url( " \t\n" ) );
		$this->assertFalse( Boldgrid_Editor_Url::sanitize_redirect_location( '' ) );
	}

	/**
	 * Every trim() in the sanitizers passes the explicit list, not only the ones in Boldgrid_Editor_Url.
	 *
	 * The AJAX redirect and upload handlers and the component CSS filter read the same constant. A bare
	 * trim( $x ) in any of them would behave differently on PHP 8.6, and a behavior test cannot see that
	 * for CSS because wp_strip_all_tags() trims with the PHP default before this code runs.
	 */
	public function test_sanitizer_files_never_call_trim_with_the_default_list() {
		$files = array(
			BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-url.php',
			BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-ajax.php',
			BOLDGRID_EDITOR_PATH . '/components/class-boldgrid-components-shortcode.php',
		);
		$total = 0;

		foreach ( $files as $file ) {
			$tokens = token_get_all( file_get_contents( $file ) );
			$count  = count( $tokens );

			for ( $i = 0; $i < $count; $i++ ) {
				if ( ! is_array( $tokens[ $i ] ) || T_STRING !== $tokens[ $i ][0] || ! in_array( strtolower( $tokens[ $i ][1] ), array( 'trim', 'ltrim', 'rtrim' ), true ) ) {
					continue;
				}

				$j = $i + 1;
				while ( $j < $count && is_array( $tokens[ $j ] ) && T_WHITESPACE === $tokens[ $j ][0] ) {
					++$j;
				}

				// Skip names that are not calls, such as the word "trim" inside a comment (a different token).
				if ( '(' !== ( $tokens[ $j ] ?? null ) ) {
					continue;
				}

				++$total;
				$depth     = 0;
				$arguments = 1;

				for ( ; $j < $count; $j++ ) {
					$token = $tokens[ $j ];

					if ( '(' === $token || '[' === $token ) {
						++$depth;
					} elseif ( ')' === $token || ']' === $token ) {
						--$depth;
						if ( 0 === $depth ) {
							break;
						}
					} elseif ( ',' === $token && 1 === $depth ) {
						++$arguments;
					}
				}

				$this->assertGreaterThanOrEqual( 2, $arguments, basename( $file ) . ' calls ' . $tokens[ $i ][1] . '() near line ' . $tokens[ $i ][2] . ' without a character list.' );
			}
		}

		$this->assertGreaterThanOrEqual( 8, $total, 'The scan found fewer trim() calls than expected.' );
	}

	/**
	 * The component form CSS filter keeps plain declarations and drops anything that can load or run code.
	 */
	public function test_form_css_filter_keeps_plain_css_and_drops_unsafe_css() {
		$component = new Boldgrid_Components_Shortcode();
		$method    = new ReflectionMethod( $component, 'sanitize_form_css' );
		if ( PHP_VERSION_ID < 80100 ) {
			$method->setAccessible( true );
		}

		$this->assertSame( '.a{color:red}', $method->invoke( $component, "  \n.a{color:red}\t " ) );
		$this->assertSame( '.a{color:red}', $method->invoke( $component, '/* note */.a{color:red}' ) );
		$this->assertSame( '', $method->invoke( $component, ".a{background:url('http://example.com/x.png')}" ) );
		$this->assertSame( '', $method->invoke( $component, '@import "x.css";' ) );
		$this->assertSame( '', $method->invoke( $component, " \n\t " ) );
	}
}
