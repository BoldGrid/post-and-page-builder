<?php
/**
 * BoldGrid Source Code
 *
 * @package Test_Boldgrid_Editor
 * @copyright BoldGrid.com
 * @author BoldGrid.com <wpb@boldgrid.com>
 */

/**
 * Constructors must not return a value. PHP 8.6 deprecates that, and PHPUnit
 * reports the deprecation as a test error.
 */
class Test_Boldgrid_Editor_Constructors extends WP_UnitTestCase {

	/**
	 * Building the assets, MCE, and filesystem helpers does not emit E_DEPRECATED.
	 */
	public function test_constructors_do_not_return_a_value() {
		$deprecated = array();

		set_error_handler(
			function ( $errno, $errstr ) use ( &$deprecated ) {
				$deprecated[] = $errstr;
				return true;
			},
			E_DEPRECATED
		);

		$configs = array( 'key' => 'value' );
		$assets  = new Boldgrid_Editor_Assets( $configs );
		$mce     = new Boldgrid_Editor_MCE( $configs );
		$fs      = new Boldgrid_Editor_Fs();

		restore_error_handler();

		$this->assertSame( $configs, $assets->configs );
		$this->assertSame( $configs, $mce->configs );
		$this->assertNotNull( $fs->get_wp_filesystem() );
		$this->assertSame( array(), $deprecated );
	}

	/**
	 * No shipped class returns a value from __construct(), including classes the other tests never build.
	 *
	 * Scans the plugin tree and the BoldGrid library it ships; other Composer packages are development-only.
	 */
	public function test_no_shipped_constructor_returns_a_value() {
		$offenders = array();
		$skip      = array( 'vendor', 'node_modules', 'tests', 'build', 'tmp', '.git', '.github', '.cursor', '.claude' );
		$roots     = array( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR );

		if ( is_dir( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/vendor/boldgrid' ) ) {
			$roots[] = BOLDGRID_EDITOR_TESTS_PLUGIN_DIR . '/vendor/boldgrid';
		}

		foreach ( $roots as $root ) {
			$files = new RecursiveIteratorIterator(
				new RecursiveCallbackFilterIterator(
					new RecursiveDirectoryIterator( $root, FilesystemIterator::SKIP_DOTS ),
					function ( $current ) use ( $skip ) {
						return ! $current->isDir() || ! in_array( $current->getFilename(), $skip, true );
					}
				)
			);

			foreach ( $files as $file ) {
				if ( 'php' !== $file->getExtension() ) {
					continue;
				}

				foreach ( $this->constructors_returning_values( (string) file_get_contents( $file->getPathname() ) ) as $line ) {
					$offenders[] = substr( $file->getPathname(), strlen( BOLDGRID_EDITOR_TESTS_PLUGIN_DIR ) + 1 ) . ':' . $line;
				}
			}
		}

		$this->assertSame( array(), $offenders, 'These constructors return a value, which PHP 8.6 deprecates.' );
	}

	/**
	 * The scanner flags a returned value and ignores a bare return and returns inside closures.
	 */
	public function test_scanner_detects_returned_values() {
		$this->assertSame( array( 3 ), $this->constructors_returning_values( "<?php\nclass A {\n function __construct() { return \$this; }\n}" ) );
		$this->assertSame( array( 3 ), $this->constructors_returning_values( "<?php\nclass A {\n public function __CONSTRUCT( \$c ) { return \$this->c = \$c; }\n}" ) );
		$this->assertSame( array(), $this->constructors_returning_values( "<?php\nclass A {\n function __construct() { if ( ! \$x ) { return; } }\n}" ) );
		$this->assertSame( array(), $this->constructors_returning_values( "<?php\nclass A {\n function __construct() { \$f = function () use ( \$a ) { return \$a; }; \$s = \"{\$a}\"; }\n}" ) );
		$this->assertSame( array(), $this->constructors_returning_values( "<?php\nclass A {\n function run() { return 1; }\n}" ) );
	}

	/**
	 * Line numbers of `return <value>;` statements inside __construct() methods.
	 *
	 * @param string $code PHP source.
	 * @return int[]
	 */
	private function constructors_returning_values( $code ) {
		$tokens = token_get_all( $code );
		$count  = count( $tokens );
		$lines  = array();

		for ( $i = 0; $i < $count; $i++ ) {
			if ( ! is_array( $tokens[ $i ] ) || T_FUNCTION !== $tokens[ $i ][0] ) {
				continue;
			}

			$name = $this->next_significant( $tokens, $i + 1 );

			if ( ! is_array( $tokens[ $name ] ) || '__construct' !== strtolower( $tokens[ $name ][1] ) ) {
				continue;
			}

			// Skip the parameter list to the body; an abstract or interface method ends in a semicolon.
			$open = $name;
			while ( $open < $count && '{' !== $tokens[ $open ] && ';' !== $tokens[ $open ] ) {
				++$open;
			}

			if ( $open >= $count || ';' === $tokens[ $open ] ) {
				continue;
			}

			$depth        = 0;
			$nested_from  = null;
			$nested_start = false;

			for ( $k = $open; $k < $count; $k++ ) {
				$token = $tokens[ $k ];
				$type  = is_array( $token ) ? $token[0] : $token;

				if ( '{' === $type || T_CURLY_OPEN === $type || T_DOLLAR_OPEN_CURLY_BRACES === $type ) {
					++$depth;

					if ( $nested_start && '{' === $type ) {
						$nested_from  = $depth;
						$nested_start = false;
					}
				} elseif ( '}' === $type ) {
					--$depth;

					if ( null !== $nested_from && $depth < $nested_from ) {
						$nested_from = null;
					}

					if ( 0 === $depth ) {
						break;
					}
				} elseif ( T_FUNCTION === $type && $k > $open ) {
					$nested_start = true;
				} elseif ( T_RETURN === $type && null === $nested_from ) {
					$next = $this->next_significant( $tokens, $k + 1 );

					if ( ';' !== $tokens[ $next ] ) {
						$lines[] = $token[2];
					}
				}
			}
		}

		return $lines;
	}

	/**
	 * Index of the next token that is not whitespace or a comment.
	 *
	 * @param array $tokens Result of token_get_all().
	 * @param int   $from   Index to start at.
	 * @return int
	 */
	private function next_significant( array $tokens, $from ) {
		$count = count( $tokens );

		for ( $i = $from; $i < $count; $i++ ) {
			if ( ! is_array( $tokens[ $i ] ) || ! in_array( $tokens[ $i ][0], array( T_WHITESPACE, T_COMMENT, T_DOC_COMMENT ), true ) ) {
				return $i;
			}
		}

		return $count - 1;
	}
}
