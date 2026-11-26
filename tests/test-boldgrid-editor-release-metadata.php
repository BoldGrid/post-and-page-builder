<?php
/**
 * Release metadata agrees across the plugin header, readme.txt, package.json and the coding standards ruleset.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Release_Metadata
 */
class Test_Boldgrid_Editor_Release_Metadata extends WP_UnitTestCase {

	/**
	 * Contents of a file in the plugin checkout.
	 *
	 * @param string $relative Path relative to the plugin root.
	 * @return string
	 */
	private function read( $relative ) {
		$path = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/' . $relative;
		$this->assertFileExists( $path );

		return (string) file_get_contents( $path );
	}

	/**
	 * Plugin header fields.
	 *
	 * @return array
	 */
	private function header() {
		return get_file_data(
			BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/post-and-page-builder.php',
			array(
				'Version'    => 'Version',
				'TextDomain' => 'Text Domain',
			)
		);
	}

	/**
	 * The plugin version, readme Stable tag, newest changelog entry and package.json version are the same.
	 */
	public function test_version_is_consistent() {
		$version = $this->header()['Version'];
		$this->assertMatchesRegularExpression( '/^\d+\.\d+\.\d+$/', $version );

		$readme = $this->read( 'readme.txt' );
		$this->assertSame( 1, preg_match( '/^Stable tag:\s*(\S+)\s*$/m', $readme, $stable ) );
		$this->assertSame( $version, $stable[1], 'readme.txt Stable tag' );

		$this->assertSame( 1, preg_match( '/^== Changelog ==\s*^= ([^=\s]+) =/m', $readme, $changelog ) );
		$this->assertSame( $version, $changelog[1], 'Newest readme.txt changelog entry' );

		$package = json_decode( $this->read( 'package.json' ), true );
		$this->assertSame( $version, $package['version'], 'package.json version' );
	}

	/**
	 * Requires at least and Tested up to are WordPress versions, oldest first.
	 */
	public function test_wordpress_versions_are_ordered() {
		$readme = $this->read( 'readme.txt' );
		$this->assertSame( 1, preg_match( '/^Requires at least:\s*(\d+\.\d+(?:\.\d+)?)\s*$/m', $readme, $requires ) );
		$this->assertSame( 1, preg_match( '/^Tested up to:\s*(\d+\.\d+)\s*$/m', $readme, $tested ) );
		$this->assertTrue( version_compare( $requires[1], $tested[1], '<=' ) );
	}

	/**
	 * The packaging script and the release workflow reject the same development-only paths in the zip.
	 */
	public function test_zip_leak_patterns_match() {
		$pattern = '#grep -E ["\'](\^post-and-page-builder/\([^"\']+)["\']#';

		$this->assertSame( 1, preg_match( $pattern, $this->read( 'bin/package.sh' ), $package ) );

		$workflow = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/.github/workflows/release.yml';
		if ( ! is_readable( $workflow ) ) {
			$this->markTestSkipped( 'Release workflow is not part of this checkout.' );
		}

		$this->assertSame( 1, preg_match( $pattern, (string) file_get_contents( $workflow ), $release ) );
		$this->assertSame( $package[1], $release[1] );
		$this->assertStringContainsString( '\.git(/|$)', $package[1] );
		$this->assertStringContainsString( 'phpcs\.ruleset\.xml$', $package[1] );
	}

	/**
	 * The packaging script and the release workflow require the same runtime files in the zip.
	 */
	public function test_zip_required_files_match() {
		$pattern = '/for required in ([^;]+); do/';

		$this->assertSame( 1, preg_match( $pattern, $this->read( 'bin/package.sh' ), $package ) );

		$workflow = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/.github/workflows/release.yml';
		if ( ! is_readable( $workflow ) ) {
			$this->markTestSkipped( 'Release workflow is not part of this checkout.' );
		}

		$this->assertSame( 1, preg_match( $pattern, (string) file_get_contents( $workflow ), $release ) );
		$this->assertSame( $package[1], $release[1] );
		$this->assertStringContainsString( 'post-and-page-builder.php', $package[1] );
		$this->assertStringContainsString( 'vendor/autoload.php', $package[1] );

		$this->assertStringContainsString( 'set -euo pipefail', $this->read( 'bin/package.sh' ) );
		$this->assertStringContainsString( 'Boldgrid\\\\Library\\\\Util\\\\Load', $this->read( 'bin/package.sh' ) );
		$this->assertStringContainsString( 'Boldgrid\\\\Library\\\\Util\\\\Load', (string) file_get_contents( $workflow ) );
	}

	/**
	 * The root .htaccess is a tracked runtime file: both packaging paths require it and neither strips it.
	 */
	public function test_htaccess_is_packaged_and_not_stripped() {
		$this->assertSame( 'Options -Indexes', trim( $this->read( '.htaccess' ), " \t\n\r\0\x0B" ) );

		$package = $this->read( 'bin/package.sh' );
		$this->assertSame( 1, preg_match( '/for required in ([^;]+); do/', $package, $required ) );
		$this->assertContains( '.htaccess', preg_split( '/\s+/', trim( $required[1], " \t\n\r\0\x0B" ) ) );

		$this->assertSame( 1, preg_match( '#grep -E ["\']\^post-and-page-builder/\(([^"\']+)\)["\']#', $package, $leak ) );
		$this->assertSame( 0, preg_match( '#^(?:' . $leak[1] . ')#', 'post-and-page-builder/.htaccess' ) );

		$this->assertDoesNotMatchRegularExpression( '/\brm\b[^\n]*\.htaccess/', $package );

		$workflow = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/.github/workflows/release.yml';
		if ( ! is_readable( $workflow ) ) {
			$this->markTestSkipped( 'Release workflow is not part of this checkout.' );
		}

		$release = (string) file_get_contents( $workflow );
		$this->assertSame( 1, preg_match( '/for required in ([^;]+); do/', $release, $release_required ) );
		$this->assertSame( $required[1], $release_required[1] );

		$this->assertSame( 1, preg_match( '#grep -E \'\^post-and-page-builder/\(([^\']+)\)\'#', $release, $release_leak ) );
		$this->assertSame( $leak[1], $release_leak[1] );
		$this->assertDoesNotMatchRegularExpression( '/\brm\b[^\n]*\.htaccess/', $release );
	}

	/**
	 * The wordpress-tag-sync release.sh copies the checkout with an extglob that skips dotfiles, so the workflow must
	 * run it with dotglob around the copy only, and must refuse to deploy other root dotfiles.
	 */
	public function test_release_workflow_copies_htaccess_to_svn() {
		$workflow = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/.github/workflows/release.yml';
		if ( ! is_readable( $workflow ) ) {
			$this->markTestSkipped( 'Release workflow is not part of this checkout.' );
		}

		$release = (string) file_get_contents( $workflow );

		$this->assertStringContainsString( 's/^shopt -s extglob$/shopt -s extglob dotglob/', $release );
		$this->assertStringContainsString( 's/^shopt -u extglob$/shopt -u extglob dotglob/', $release );
		$this->assertStringContainsString( "grep -qxF 'shopt -s extglob dotglob'", $release );
		$this->assertStringContainsString( "grep -qxF 'shopt -u extglob dotglob'", $release );
		$this->assertStringNotContainsString( "\n          ./node_modules/@boldgrid/wordpress-tag-sync/release.sh\n", $release );

		$this->assertStringContainsString( 'Check .htaccess is the only runtime dotfile', $release );
		$this->assertStringContainsString( '.htaccess|.git|.github|', $release );
		$this->assertStringNotContainsString( '.sec-project.yaml|', $release );
		$this->assertStringNotContainsString( '.nvmrc|', $release );
	}

	/**
	 * GitHub workflows use the built-in github.token with least-privilege permissions for releases.
	 */
	public function test_workflows_use_builtin_github_token() {
		$workflow_dir = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/.github/workflows';
		if ( ! is_dir( $workflow_dir ) ) {
			$this->markTestSkipped( 'Workflow directory is not part of this checkout.' );
		}

		$files = glob( $workflow_dir . '/*.yml' );
		$this->assertNotEmpty( $files );

		foreach ( $files as $file ) {
			$content = (string) file_get_contents( $file );
			$this->assertDoesNotMatchRegularExpression( '/secrets\.(?:GH|GITHUB|RELEASE)_?[A-Z_]*/', $content, basename( $file ) );
			$this->assertStringNotContainsString( 'GITHUB_TOKEN', $content, basename( $file ) );
		}

		$release = (string) file_get_contents( $workflow_dir . '/release.yml' );
		$this->assertStringContainsString( 'token: ${{ github.token }}', $release );
		$this->assertSame( 1, preg_match_all( '/contents:\s*write/', $release, $matches ) );
	}

	/**
	 * The text domain the coding standards enforce is the one the plugin header declares.
	 */
	public function test_text_domain_matches_ruleset() {
		$text_domain = $this->header()['TextDomain'];
		$this->assertSame( 'boldgrid-editor', $text_domain );

		$ruleset = $this->read( 'phpcs.ruleset.xml' );
		$this->assertSame( 1, preg_match( '#<property name="text_domain" type="array">\s*<element value="([^"]+)"/>\s*</property>#', $ruleset, $match ) );
		$this->assertSame( $text_domain, $match[1] );
	}
}
