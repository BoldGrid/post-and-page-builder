<?php
/**
 * Tests for image and shared stylesheet write boundaries.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Image and shared stylesheet boundary tests.
 */
class Test_Boldgrid_Editor_Upload_Style_Boundaries extends WP_UnitTestCase {

	/**
	 * Original plugin options.
	 *
	 * @var mixed
	 */
	private $original_options;

	/**
	 * Create a stylesheet service that captures writes.
	 *
	 * @return Boldgrid_Editor_Builder_Styles
	 */
	private function create_styles_capture() {
		return new class() extends Boldgrid_Editor_Builder_Styles {

			/**
			 * Last CSS passed to create_file().
			 *
			 * @var string|null
			 */
			public $written_css;

			/**
			 * Last filename passed to create_file().
			 *
			 * @var string|null
			 */
			public $written_filename;

			/**
			 * Capture a stylesheet write.
			 *
			 * @param string $css      CSS to save.
			 * @param string $filename Fixed stylesheet filename.
			 * @return string
			 */
			public function create_file( $css, $filename = '/custom-styles.css' ) {
				$this->written_css      = $css;
				$this->written_filename = $filename;

				return $filename;
			}
		};
	}

	/**
	 * Preserve plugin options before each test.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->original_options = get_option(
			Boldgrid_Editor_Option::OPTION_NAMESPACE,
			array()
		);
	}

	/**
	 * Reset request globals and plugin options.
	 */
	public function tearDown(): void {
		$_POST    = array();
		$_REQUEST = array();
		wp_set_current_user( 0 );
		update_option(
			Boldgrid_Editor_Option::OPTION_NAMESPACE,
			$this->original_options
		);
		parent::tearDown();
	}

	/**
	 * Image validation must reject both PHP opening-tag forms.
	 */
	public function test_image_validation_rejects_php_polyglot_tags() {
		$file = wp_tempnam( 'boldgrid-polyglot.gif' );
		$gif  = hex2bin(
			'474946383961010001000000002c000000000100010080000000ffffff02024401003b'
		);

		file_put_contents( $file, $gif ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$this->assertIsArray( Boldgrid_Editor_Upload::validate_image_file( $file ) );

		file_put_contents( $file, $gif . '<?php echo 1; ?>' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$this->assertWPError( Boldgrid_Editor_Upload::validate_image_file( $file ) );

		file_put_contents( $file, $gif . '<?=1;?>' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$this->assertWPError( Boldgrid_Editor_Upload::validate_image_file( $file ) );

		wp_delete_file( $file );
	}

	/**
	 * A genuine image must round-trip through the WordPress sideload pipeline.
	 */
	public function test_valid_image_round_trips_through_sideload() {
		$file = wp_tempnam( 'boldgrid-valid.gif' );
		$gif  = hex2bin(
			'474946383961010001000000002c000000000100010080000000ffffff02024401003b'
		);

		file_put_contents( $file, $gif ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$validation = Boldgrid_Editor_Upload::validate_image_file( $file );
		$result     = Boldgrid_Editor_Upload::create_attachment_from_temp_file(
			$file,
			$validation
		);

		$this->assertTrue( $result['success'] );
		$this->assertSame( 'image/gif', get_post_mime_type( $result['attachment_id'] ) );
		$this->assertMatchesRegularExpression(
			'/^[A-Za-z0-9]{20}\.gif$/',
			basename( get_attached_file( $result['attachment_id'] ) )
		);

		wp_delete_attachment( $result['attachment_id'], true );
	}

	/**
	 * Shared styles require administrator capability, nonce, and bounded schema.
	 */
	public function test_shared_styles_require_capability_nonce_and_schema() {
		$administrator_id = self::factory()->user->create(
			array( 'role' => 'administrator' )
		);
		$contributor_id   = self::factory()->user->create(
			array( 'role' => 'contributor' )
		);
		$styles           = $this->create_styles_capture();
		$payload          = wp_slash(
			wp_json_encode(
				array(
					array(
						'id'  => 'safe-style',
						'css' => '.safe-style{color:#123456}',
					),
				)
			)
		);

		Boldgrid_Editor_Option::update( 'styles', array( 'marker' => 'unchanged' ) );

		wp_set_current_user( $contributor_id );
		$_POST    = array(
			'boldgrid-control-styles'       => $payload,
			'boldgrid-control-styles-nonce' => wp_create_nonce( 'boldgrid_save_control_styles' ),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();
		$this->assertNull( $styles->written_css );
		$this->assertSame(
			array( 'marker' => 'unchanged' ),
			Boldgrid_Editor_Option::get( 'styles' )
		);

		wp_set_current_user( $administrator_id );
		$_POST    = array( 'boldgrid-control-styles' => $payload );
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();
		$this->assertNull( $styles->written_css );

		$_POST['boldgrid-control-styles-nonce'] = wp_create_nonce(
			'boldgrid_save_control_styles'
		);
		$_REQUEST                               = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();
		$this->assertSame( '.safe-style{color:#123456}', $styles->written_css );
		$this->assertSame( '/custom-styles.css', $styles->written_filename );
		$this->assertSame(
			'safe-style',
			Boldgrid_Editor_Option::get( 'styles' )['configuration'][0]['id']
		);

		$styles->written_css              = null;
		$_POST['boldgrid-control-styles'] = wp_slash(
			wp_json_encode(
				array(
					array(
						'id'  => array( 'nested' ),
						'css' => '.nested{color:red}',
					),
				)
			)
		);
		$_REQUEST                         = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();
		$this->assertNull( $styles->written_css );
	}

	/**
	 * Compiled palette CSS must persist without flattening or partial writes.
	 */
	public function test_palette_css_persists_with_sibling_rules() {
		$administrator_id = self::factory()->user->create(
			array( 'role' => 'administrator' )
		);
		$styles           = $this->create_styles_capture();
		$palette_css      = file_get_contents( // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			BOLDGRID_EDITOR_PATH . '/assets/css/custom-styles.css'
		);
		$payload          = wp_slash(
			wp_json_encode(
				array(
					array(
						'id'  => 'bg-controls-colors',
						'css' => $palette_css,
					),
					array(
						'id'  => 'safe-style',
						'css' => ".safe-style{\ncolor:#123456;\n}",
					),
				)
			)
		);

		$this->assertNotFalse( $palette_css );
		$this->assertGreaterThan( 10000, strlen( $palette_css ) );
		$this->assertStringContainsString( "\n", $palette_css );

		wp_set_current_user( $administrator_id );
		$_POST    = array(
			'boldgrid-control-styles'       => $payload,
			'boldgrid-control-styles-nonce' => wp_create_nonce(
				'boldgrid_save_control_styles'
			),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();

		$this->assertStringContainsString( $palette_css, $styles->written_css );
		$this->assertStringContainsString( ".safe-style{\ncolor:#123456;\n}", $styles->written_css );
		$this->assertSame(
			'bg-controls-colors',
			Boldgrid_Editor_Option::get( 'styles' )['configuration'][0]['id']
		);

		Boldgrid_Editor_Option::update( 'styles', array( 'marker' => 'unchanged' ) );
		$styles->written_css              = null;
		$_POST['boldgrid-control-styles'] = wp_slash(
			wp_json_encode(
				array(
					array(
						'id'  => 'bg-controls-colors',
						'css' => str_repeat( 'a', Boldgrid_Editor_Builder_Styles::MAX_STYLE_CSS_BYTES + 1 ),
					),
					array(
						'id'  => 'safe-style',
						'css' => '.safe-style{color:#123456}',
					),
				)
			)
		);
		$_REQUEST                         = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();
		$this->assertNull( $styles->written_css );
		$this->assertSame(
			array( 'marker' => 'unchanged' ),
			Boldgrid_Editor_Option::get( 'styles' )
		);
	}

	/**
	 * Preview stylesheet writes keep the fixed preview filename.
	 */
	public function test_preview_styles_keep_fixed_css_filename() {
		$administrator_id = self::factory()->user->create(
			array( 'role' => 'administrator' )
		);
		$styles           = $this->create_styles_capture();

		wp_set_current_user( $administrator_id );
		$_POST    = array(
			'boldgrid-control-styles'       => wp_slash(
				wp_json_encode(
					array(
						array(
							'id'  => 'preview-style',
							'css' => '.preview-style{display:block}',
						),
					)
				)
			),
			'boldgrid-control-styles-nonce' => wp_create_nonce(
				'boldgrid_save_control_styles'
			),
			'wp-preview'                    => 'dopreview',
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$styles->save();

		$this->assertSame( '/preview-custom-styles.css', $styles->written_filename );
		$this->assertSame(
			'/preview-custom-styles.css',
			Boldgrid_Editor_Option::get( 'preview_styles' )['css_filename']
		);
	}
}
