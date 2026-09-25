<?php
/**
 * Tests for editor save boundaries.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Editor save boundary tests.
 */
class Test_Boldgrid_Editor_Save_Boundaries extends WP_UnitTestCase {

	/**
	 * Original plugin options.
	 *
	 * @var mixed
	 */
	private $original_options;

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
	 * Reset request globals after each test.
	 */
	public function tearDown(): void {
		$_POST    = array();
		$_REQUEST = array();
		$_GET     = array();
		wp_set_current_user( 0 );
		update_option(
			Boldgrid_Editor_Option::OPTION_NAMESPACE,
			$this->original_options
		);
		parent::tearDown();
	}

	/**
	 * Ensure only administrators can update a schema-validated color list.
	 */
	public function test_custom_colors_require_capability_nonce_and_schema() {
		$administrator_id = self::factory()->user->create(
			array( 'role' => 'administrator' )
		);
		$contributor_id   = self::factory()->user->create(
			array( 'role' => 'contributor' )
		);
		$builder          = new Boldgrid_Editor_Builder();

		Boldgrid_Editor_Service::register(
			'assets',
			new Boldgrid_Editor_Assets( Boldgrid_Editor_Service::get( 'config' ) )
		);
		Boldgrid_Editor_Option::update( 'custom_colors', array( '#111111' ) );

		wp_set_current_user( $contributor_id );
		$_POST    = array(
			'boldgrid-custom-colors'       => wp_json_encode( array( '#222222' ) ),
			'boldgrid-custom-colors-nonce' => wp_create_nonce( 'boldgrid_save_custom_colors' ),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$builder->save_colors();
		$this->assertSame(
			array( '#111111' ),
			Boldgrid_Editor_Option::get( 'custom_colors' )
		);

		wp_set_current_user( $administrator_id );
		$_POST    = array(
			'boldgrid-custom-colors'       => wp_json_encode(
				array( '#abcdef', 'not-a-color', array( 'nested' => true ) )
			),
			'boldgrid-custom-colors-nonce' => wp_create_nonce( 'boldgrid_save_custom_colors' ),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$builder->save_colors();
		$this->assertSame(
			array( '#abcdef' ),
			Boldgrid_Editor_Option::get( 'custom_colors' )
		);

		$_POST    = array(
			'boldgrid-custom-colors' => wp_json_encode( array( '#333333' ) ),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$builder->save_colors();
		$this->assertSame(
			array( '#abcdef' ),
			Boldgrid_Editor_Option::get( 'custom_colors' )
		);
	}

	/**
	 * Ensure preview state is constrained to an editable post and known template.
	 */
	public function test_preview_metadata_is_scoped_and_allowlisted() {
		$contributor_id = self::factory()->user->create(
			array( 'role' => 'contributor' )
		);
		$editor_id      = self::factory()->user->create(
			array( 'role' => 'editor' )
		);
		$own_post_id    = self::factory()->post->create(
			array(
				'post_author' => $contributor_id,
				'post_status' => 'draft',
			)
		);
		$other_post_id  = self::factory()->post->create(
			array(
				'post_author' => $editor_id,
				'post_status' => 'draft',
			)
		);
		$postmeta       = new Boldgrid_Editor_Postmeta();

		Boldgrid_Editor_Option::update(
			'preview_meta',
			array( 'template' => 'legacy-global-marker.php' )
		);
		wp_set_current_user( $contributor_id );
		$_POST = array(
			'wp-preview'                  => 'dopreview',
			'page_template'               => 'template/page/fullwidth.php',
			'boldgrid-display-post-title' => '1',
		);

		$postmeta->save( $other_post_id );
		$this->assertSame(
			'',
			get_post_meta( $other_post_id, '_boldgrid_editor_preview_meta', true )
		);

		$postmeta->save( $own_post_id );
		$this->assertSame(
			array(
				'template'                 => 'template/page/fullwidth.php',
				'boldgrid_hide_page_title' => 1,
			),
			get_post_meta( $own_post_id, '_boldgrid_editor_preview_meta', true )
		);
		$this->assertSame(
			array( 'template' => 'legacy-global-marker.php' ),
			Boldgrid_Editor_Option::get( 'preview_meta' )
		);

		global $post, $wp_query;
		$post            = get_post( $own_post_id );
		$wp_query        = new WP_Query();
		$_GET['preview'] = 'true';
		$this->assertSame(
			BOLDGRID_EDITOR_PATH . '/includes/template/page/fullwidth.php',
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);
		$post = get_post( $other_post_id );
		$this->assertSame(
			'/theme/default.php',
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);

		$_POST['page_template'] = '../../arbitrary.php';
		$postmeta->save( $own_post_id );
		$this->assertNull(
			get_post_meta( $own_post_id, '_boldgrid_editor_preview_meta', true )['template']
		);
	}

	/**
	 * Regular saves must drop preview overlay so later preview links follow the saved slug.
	 */
	public function test_regular_save_clears_stale_preview_template() {
		$contributor_id = self::factory()->user->create(
			array( 'role' => 'contributor' )
		);
		$post_id        = self::factory()->post->create(
			array(
				'post_author' => $contributor_id,
				'post_status' => 'draft',
			)
		);
		$postmeta       = new Boldgrid_Editor_Postmeta();
		$plugin_full    = BOLDGRID_EDITOR_PATH . '/includes/template/page/fullwidth.php';
		$plugin_sidebar = BOLDGRID_EDITOR_PATH . '/includes/template/page/left-sidebar.php';

		wp_set_current_user( $contributor_id );
		$_POST = array(
			'wp-preview'    => 'dopreview',
			'page_template' => 'template/page/fullwidth.php',
		);
		$postmeta->save( $post_id );

		global $post, $wp_query;
		$post            = get_post( $post_id );
		$wp_query        = new WP_Query();
		$_GET['preview'] = 'true';
		$this->assertSame(
			$plugin_full,
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);

		update_post_meta( $post_id, '_wp_page_template', 'template/page/left-sidebar.php' );
		unset( $_POST['wp-preview'] );
		$postmeta->save( $post_id );
		$this->assertSame(
			'',
			get_post_meta( $post_id, '_boldgrid_editor_preview_meta', true )
		);

		$post = get_post( $post_id );
		$this->assertSame(
			$plugin_sidebar,
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);

		$autosave_id = wp_insert_post(
			array(
				'post_parent' => $post_id,
				'post_type'   => 'revision',
				'post_name'   => $post_id . '-autosave-v1',
				'post_status' => 'inherit',
				'post_author' => $contributor_id,
			)
		);
		$_POST       = array(
			'wp-preview'    => 'dopreview',
			'page_template' => 'template/page/fullwidth.php',
		);
		$postmeta->save( $post_id );
		unset( $_POST['wp-preview'] );
		$postmeta->save( $autosave_id );
		$this->assertSame(
			array(
				'template'                 => 'template/page/fullwidth.php',
				'boldgrid_hide_page_title' => null,
			),
			get_post_meta( $post_id, '_boldgrid_editor_preview_meta', true )
		);
	}

	/**
	 * Preview of Default must not keep a published plugin layout.
	 */
	public function test_preview_default_does_not_keep_live_plugin_template() {
		$editor_id = self::factory()->user->create(
			array( 'role' => 'editor' )
		);
		$post_id   = self::factory()->post->create(
			array(
				'post_author' => $editor_id,
				'post_status' => 'publish',
			)
		);
		$postmeta    = new Boldgrid_Editor_Postmeta();
		$plugin_full = BOLDGRID_EDITOR_PATH . '/includes/template/page/fullwidth.php';

		update_post_meta( $post_id, '_wp_page_template', 'template/page/fullwidth.php' );
		wp_set_current_user( $editor_id );
		$_POST = array(
			'wp-preview'    => 'dopreview',
			'page_template' => 'default',
		);
		$postmeta->save( $post_id );
		$this->assertNull(
			get_post_meta( $post_id, '_boldgrid_editor_preview_meta', true )['template']
		);

		global $post, $wp_query;
		$post            = get_post( $post_id );
		$wp_query        = new WP_Query();
		$_GET['preview'] = 'true';
		$this->assertSame(
			'/theme/default.php',
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);
		$this->assertNotSame(
			$plugin_full,
			Boldgrid_Editor_Service::get( 'templater' )
				->view_project_template( '/theme/default.php' )
		);
	}
}
