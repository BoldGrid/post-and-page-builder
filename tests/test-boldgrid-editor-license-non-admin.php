<?php
/**
 * ENG7-4775: saved Connect key must unlock premium for non-admin editors.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * License recognition regression coverage for non-admin roles.
 */
class Test_Boldgrid_Editor_License_Non_Admin extends WP_UnitTestCase {

	/**
	 * Saved Connect key fixture.
	 *
	 * @var string
	 */
	protected $connect_key = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

	/**
	 * Reset options and current user between tests.
	 */
	public function setUp(): void {
		parent::setUp();
		delete_option( 'boldgrid_api_key' );
		delete_site_option( 'boldgrid_api_key' );
		wp_set_current_user( 0 );
		$_POST = array();
	}

	/**
	 * Stored key helper returns the mixed option value.
	 */
	public function test_get_stored_connect_key() {
		$this->assertSame( '', Boldgrid_Editor_Secrets::get_stored_connect_key() );

		update_option( 'boldgrid_api_key', $this->connect_key );
		$this->assertSame( $this->connect_key, Boldgrid_Editor_Secrets::get_stored_connect_key() );

		// Clear the blog option so get_mixed_option() can fall back to site/network storage.
		delete_option( 'boldgrid_api_key' );
		$this->assertSame( '', Boldgrid_Editor_Secrets::get_stored_connect_key() );

		update_site_option( 'boldgrid_api_key', $this->connect_key );
		$this->assertSame( $this->connect_key, Boldgrid_Editor_Secrets::get_stored_connect_key() );
	}

	/**
	 * Non-admins must not receive the raw key in localized JS settings.
	 */
	public function test_public_settings_strip_key_for_editor() {
		update_option( 'boldgrid_api_key', $this->connect_key );

		$editor_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor_id );

		$config   = array( 'api_key' => $this->connect_key );
		$settings = Boldgrid_Editor_Secrets::get_public_boldgrid_settings( array(), $config );
		$public   = Boldgrid_Editor_Secrets::get_public_plugin_configs( $config );

		$this->assertTrue( $settings['has_connect_key'] );
		$this->assertArrayNotHasKey( 'api_key', $settings );
		$this->assertTrue( $public['has_connect_key'] );
		$this->assertArrayNotHasKey( 'api_key', $public );
	}

	/**
	 * Admins may still receive the key in localized settings for key management UI.
	 */
	public function test_public_settings_keep_key_for_admin() {
		update_option( 'boldgrid_api_key', $this->connect_key );

		$admin_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$config   = array( 'api_key' => $this->connect_key );
		$settings = Boldgrid_Editor_Secrets::get_public_boldgrid_settings( array(), $config );

		$this->assertTrue( $settings['has_connect_key'] );
		$this->assertSame( $this->connect_key, $settings['api_key'] );
	}

	/**
	 * generate_blocks params attach the stored key for editors and ignore forged POST keys.
	 */
	public function test_build_generate_blocks_params_uses_stored_key_for_editor() {
		update_option( 'boldgrid_api_key', $this->connect_key );

		$editor_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor_id );

		$_POST = array(
			'category' => 'fitness',
			'color'    => '{"colors":[]}',
			'key'      => 'forged-client-key-should-be-ignored',
		);

		$ajax   = new Boldgrid_Editor_Ajax();
		$params = $ajax->build_generate_blocks_params();

		$this->assertSame( 'fitness', $params['category'] );
		$this->assertSame( $this->connect_key, $params['key'] );
		$this->assertNotSame( 'forged-client-key-should-be-ignored', $params['key'] );
	}

	/**
	 * Without a stored key, generate params must omit the key field.
	 */
	public function test_build_generate_blocks_params_omits_missing_key() {
		$editor_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor_id );

		$_POST  = array( 'category' => 'fitness' );
		$ajax   = new Boldgrid_Editor_Ajax();
		$params = $ajax->build_generate_blocks_params();

		$this->assertArrayNotHasKey( 'key', $params );
	}
}
