<?php
/**
 * The supported PHP range is stated the same way everywhere it is declared.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Php_Range
 */
class Test_Boldgrid_Editor_Php_Range extends WP_UnitTestCase {

	/**
	 * Absolute path to a file in the plugin checkout.
	 *
	 * @param string $relative Path relative to the plugin root.
	 * @return string
	 */
	private function path( $relative ) {
		return BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/' . $relative;
	}

	/**
	 * The plugin header, composer.json, readme.txt and the PHPCompatibility lower bound agree on 7.4.
	 */
	public function test_minimum_php_version_is_consistent() {
		$header = get_file_data( $this->path( 'post-and-page-builder.php' ), array( 'RequiresPHP' => 'Requires PHP' ) );
		$this->assertSame( '7.4', $header['RequiresPHP'] );

		$composer = json_decode( (string) file_get_contents( $this->path( 'composer.json' ) ), true );
		$this->assertSame( '>=7.4', $composer['require']['php'] );
		$this->assertSame( '7.4.0', $composer['config']['platform']['php'] );

		$readme = (string) file_get_contents( $this->path( 'readme.txt' ) );
		$this->assertSame( 1, preg_match( '/^Requires PHP:\s*(\S+)/m', $readme, $match ) );
		$this->assertSame( '7.4', $match[1] );

		$this->assertGreaterThanOrEqual( 70400, PHP_VERSION_ID );
		$this->assertSame( 1, preg_match( '/name="testVersion" value="([0-9.]+)-([0-9.]+)"/', (string) file_get_contents( $this->path( 'phpcompat.xml.dist' ) ), $scan ) );
		$this->assertSame( '7.4', $scan[1] );
	}

	/**
	 * CI runs PHPUnit on every PHP minor from the minimum through the same ceiling the static scan checks.
	 */
	public function test_ci_matrix_covers_every_supported_minor() {
		$workflow = $this->path( '.github/workflows/ci.yml' );

		if ( ! is_readable( $workflow ) ) {
			$this->markTestSkipped( 'CI workflow is not part of this checkout.' );
		}

		$this->assertSame( 1, preg_match( '/^\s+php:\s*\[([^\]]+)\]/m', (string) file_get_contents( $workflow ), $matrix ) );
		$versions = array_map(
			function ( $version ) {
				return trim( $version, " '\"" );
			},
			explode( ',', $matrix[1] )
		);

		$this->assertSame( 1, preg_match( '/name="testVersion" value="[0-9.]+-([0-9.]+)"/', (string) file_get_contents( $this->path( 'phpcompat.xml.dist' ) ), $scan ) );
		$ceiling  = explode( '.', $scan[1] );
		$expected = array( '7.4' );

		for ( $minor = 0; $minor <= (int) $ceiling[1]; $minor++ ) {
			$expected[] = '8.' . $minor;
		}

		$this->assertSame( $expected, $versions, 'The CI PHP matrix must list every minor from 7.4 to the testVersion ceiling.' );
	}

	/**
	 * PHPStan analyses for the same range: phpVersion min is 7.4.0 and max is the last patch of the testVersion ceiling.
	 */
	public function test_phpstan_range_matches_testversion() {
		$config = (string) file_get_contents( $this->path( 'tests/phpstan/phpstan.neon.dist' ) );
		$this->assertSame( 1, preg_match( '/^\s+min:\s*(\d+)\s*$/m', $config, $min ) );
		$this->assertSame( 1, preg_match( '/^\s+max:\s*(\d+)\s*$/m', $config, $max ) );

		$this->assertSame( 1, preg_match( '/name="testVersion" value="[0-9.]+-(\d+)\.(\d+)"/', (string) file_get_contents( $this->path( 'phpcompat.xml.dist' ) ), $scan ) );

		$this->assertSame( '70400', $min[1] );
		$this->assertSame( (string) ( (int) $scan[1] * 10000 + (int) $scan[2] * 100 + 99 ), $max[1] );
	}
}
