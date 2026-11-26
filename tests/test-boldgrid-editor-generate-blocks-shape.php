<?php
/**
 * Regression: generate_blocks must tolerate non-array entries in the upstream response.
 *
 * @package Test_Boldgrid_Editor
 */

if ( ! defined( 'BOLDGRID_EDITOR_PATH' ) ) {
	define( 'BOLDGRID_EDITOR_PATH', dirname( __DIR__ ) );
}

require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-ajax.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-option.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-secrets.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-capability.php';

/**
 * Upstream Gridblock response shape coverage.
 */
class Test_Boldgrid_Editor_Generate_Blocks_Shape extends WP_UnitTestCase {

	/**
	 * Valid blocks keep their html and still receive preview_html.
	 */
	public function test_filter_generated_blocks_keeps_array_blocks() {
		$ajax     = new Boldgrid_Editor_Ajax();
		$response = array(
			array(
				'html' => '<div>One</div>',
				'id'   => 1,
			),
			array( 'html' => '<div>Two</div>' ),
		);

		$this->assertSame( $response, $ajax->filter_generated_blocks( $response ) );
	}

	/**
	 * Scalar, malformed and html-less entries are dropped without notices or warnings.
	 */
	public function test_filter_generated_blocks_skips_scalar_entries() {
		$ajax = new Boldgrid_Editor_Ajax();

		$mixed = array(
			500,
			'Internal error',
			array( 'html' => 5 ),
			array( 'preview' => 'x' ),
			array( 'html' => '<div>Keep</div>' ),
			null,
		);

		$this->assertSame(
			array( array( 'html' => '<div>Keep</div>' ) ),
			$ajax->filter_generated_blocks( $mixed )
		);

		// Error payload: every value is a scalar.
		$error_payload = array(
			'status'  => 500,
			'message' => 'Nope',
		);
		$this->assertSame( array(), $ajax->filter_generated_blocks( $error_payload ) );

		// Top-level scalars from json_decode().
		$this->assertSame( array(), $ajax->filter_generated_blocks( 500 ) );
		$this->assertSame( array(), $ajax->filter_generated_blocks( 'oops' ) );
		$this->assertSame( array(), $ajax->filter_generated_blocks( null ) );
		$this->assertSame( array(), $ajax->filter_generated_blocks( array() ) );
	}

	/**
	 * Keyed responses keep their keys; lists stay lists after entries are removed.
	 */
	public function test_filter_generated_blocks_key_handling() {
		$ajax = new Boldgrid_Editor_Ajax();

		$keyed = array(
			'a' => array( 'html' => '<p>A</p>' ),
			'b' => 3,
		);
		$this->assertSame( array( 'a' => array( 'html' => '<p>A</p>' ) ), $ajax->filter_generated_blocks( $keyed ) );

		$list = array( 1, array( 'html' => '<p>B</p>' ) );
		$this->assertSame( array( array( 'html' => '<p>B</p>' ) ), $ajax->filter_generated_blocks( $list ) );
	}

	/**
	 * Run generate_blocks against a stubbed upstream body.
	 *
	 * @param string $body Upstream response body.
	 * @return string JSON output sent by wp_send_json().
	 */
	protected function run_generate_blocks( $body ) {
		$editor_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $editor_id );

		$nonce    = wp_create_nonce( 'boldgrid_editor_gridblock_save' );
		$_POST    = array( 'boldgrid_editor_gridblock_save' => $nonce );
		$_REQUEST = array( 'boldgrid_editor_gridblock_save' => $nonce );

		add_filter( 'wp_doing_ajax', '__return_true' );
		add_filter( 'wp_die_ajax_handler', array( $this, 'get_wp_die_handler' ), 1, 1 );
		add_filter(
			'pre_http_request',
			function () use ( $body ) {
				return array(
					'headers'  => array(),
					'body'     => $body,
					'response' => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'cookies'  => array(),
					'filename' => null,
				);
			}
		);

		$ajax = new Boldgrid_Editor_Ajax();
		ob_start();
		try {
			$ajax->generate_blocks();
		} catch ( WPDieException $e ) {
			unset( $e );
		}
		return (string) ob_get_clean();
	}

	/**
	 * An upstream error payload of scalars yields the error response, not warnings.
	 */
	public function test_generate_blocks_scalar_response_returns_error() {
		$out = json_decode( $this->run_generate_blocks( '{"status":500,"message":"Nope"}' ), true );
		$this->assertFalse( $out['success'] );
	}

	/**
	 * A mixed response keeps valid blocks and adds html/preview_html.
	 */
	public function test_generate_blocks_array_block_still_returns_html() {
		$out = json_decode( $this->run_generate_blocks( '[7,{"html":"<div>Hi</div>"}]' ), true );
		$this->assertCount( 1, $out );
		$this->assertArrayHasKey( 'html', $out[0] );
		$this->assertArrayHasKey( 'preview_html', $out[0] );
		$this->assertStringContainsString( 'Hi', $out[0]['html'] );
		$this->assertStringContainsString( 'Hi', $out[0]['preview_html'] );
	}
}
