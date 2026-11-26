<?php
/**
 * Tests for Boldgrid_Editor_Setting default editor selection.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Setting
 */
class Test_Boldgrid_Editor_Setting extends WP_UnitTestCase {

	/**
	 * Settings instance under test.
	 *
	 * @var Boldgrid_Editor_Setting
	 */
	protected $setting;

	/**
	 * Start each test with no saved editor choices and no request override.
	 */
	public function set_up() {
		parent::set_up();

		Boldgrid_Editor_Option::delete( 'default_editor' );
		unset( $_POST['bgppb_default_editor_post'], $_GET['post_id'] );

		$this->setting = new Boldgrid_Editor_Setting();
	}

	/**
	 * Clean up request globals.
	 */
	public function tear_down() {
		unset( $_POST['bgppb_default_editor_post'], $_GET['post_id'] );
		Boldgrid_Editor_Option::delete( 'default_editor' );

		parent::tear_down();
	}

	/**
	 * Post and Page Builder is the editor for every post type until a choice is saved.
	 */
	public function test_defaults_to_bgppb() {
		$this->assertSame( 'bgppb', $this->setting->get_initial_editor_option( 'page' ) );
		$this->assertSame( 'bgppb', $this->setting->get_default_editor( null, 'page' ) );
		$this->assertSame( 'bgppb', $this->setting->get_default_editor( null, 'post' ) );

		$options = $this->setting->get_saved_editor_options();
		$this->assertSame( 'bgppb', $options['post'] );
		$this->assertSame( 'bgppb', $options['page'] );
	}

	/**
	 * A saved per-post-type choice wins over the default.
	 */
	public function test_saved_choice_overrides_default() {
		$saved = $this->setting->save_default_editor( array( 'post' => 'classic' ) );

		$this->assertSame( 'classic', $saved['post'] );
		$this->assertSame( 'classic', $this->setting->get_default_editor( null, 'post' ) );
		$this->assertSame( 'bgppb', $this->setting->get_default_editor( null, 'page' ) );

		$post = self::factory()->post->create_and_get( array( 'post_type' => 'post' ) );
		$this->assertSame( 'classic', $this->setting->get_default_editor( $post, 'page' ) );
	}

	/**
	 * An editor outside the valid list is stored as the default instead.
	 */
	public function test_invalid_choice_falls_back_to_bgppb() {
		$saved = $this->setting->save_default_editor( array( 'page' => 'not-an-editor' ) );

		$this->assertSame( 'bgppb', $saved['page'] );
		$this->assertSame( 'bgppb', $this->setting->get_default_editor( null, 'page' ) );
	}

	/**
	 * Per-post meta wins over the post type default; block editor stays off for bgppb and classic.
	 */
	public function test_current_editor_uses_post_meta() {
		$post = self::factory()->post->create_and_get( array( 'post_type' => 'page' ) );

		$this->assertSame( 'bgppb', $this->setting->get_current_editor( $post ) );

		update_post_meta( $post->ID, '_bgppb_default_editor', 'classic' );
		$this->assertSame( 'classic', $this->setting->get_current_editor( $post ) );

		$GLOBALS['post'] = $post;
		$this->assertFalse( $this->setting->is_block_editor( true ) );

		update_post_meta( $post->ID, '_bgppb_default_editor', 'bgppb' );
		$this->assertFalse( $this->setting->is_block_editor( true ) );
		unset( $GLOBALS['post'] );
	}
}
