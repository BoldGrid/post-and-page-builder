<?php
/**
 * Tests for component AJAX widget preview boundaries.
 *
 * @package Test_Boldgrid_Editor
 */

if ( ! defined( 'BOLDGRID_EDITOR_PATH' ) ) {
	define( 'BOLDGRID_EDITOR_PATH', dirname( __DIR__ ) );
}

require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-ajax.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-url.php';
require_once BOLDGRID_EDITOR_PATH . '/components/class-boldgrid-components-shortcode.php';

/**
 * Expose protected component AJAX helpers for tests.
 */
class Boldgrid_Components_Shortcode_Ajax_Double extends Boldgrid_Components_Shortcode {
	/**
	 * Skip service lookup; tests only need the AJAX helpers.
	 */
	public function __construct() {
		$this->config = array();
	}
	/**
	 * Run the AJAX renderer.
	 *
	 * @param array  $component Component configuration.
	 * @param string $type      content|form.
	 * @return void
	 */
	public function run_ajax_shortcode( $component, $type ) {
		$this->ajax_shortcode( $component, $type );
	}

	/**
	 * Sanitize a request payload.
	 *
	 * @param array $component Component configuration.
	 * @param array $params    Request parameters.
	 * @return array
	 */
	public function run_sanitize_request_widget_attrs( $component, $params ) {
		return $this->sanitize_request_widget_attrs( $component, $params );
	}

	/**
	 * Sanitize rendered AJAX markup.
	 *
	 * @param string $html Rendered markup.
	 * @param string $type content|form.
	 * @return string
	 */
	public function run_sanitize_ajax_output( $html, $type ) {
		return $this->sanitize_ajax_output( $html, $type );
	}
}

/**
 * Widget whose settings form uses the full range of controls.
 */
class Boldgrid_Components_Shortcode_Test_Widget {

	/**
	 * Default style markup the form ships with its controls.
	 *
	 * @var string
	 */
	const DEFAULT_STYLE_MARKUP = '<style>.bgc-test { display: flex; }</style>';

	/**
	 * Style markup the form ships with its controls.
	 *
	 * @var string
	 */
	public static $style_markup = self::DEFAULT_STYLE_MARKUP;

	/**
	 * Render the settings form.
	 *
	 * @param array $instance Widget instance values.
	 * @return void
	 */
	public function form( $instance ) {
		$title = isset( $instance['title'] ) ? $instance['title'] : '';

		echo self::$style_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
		<p class="bgc-test" style="display:flex;justify-content:center;">
			<label for="widget-test-title">Title</label>
			<input id="widget-test-title" class="widefat" type="text"
				name="widget-test[][title]" value="<?php echo esc_attr( $title ); ?>" />
		</p>
		<p>
			<label for="widget-test-align">Alignment</label>
			<select id="widget-test-align" name="widget-test[][align]">
				<option value="left" selected="selected">Left</option>
				<option value="right">Right</option>
			</select>
		</p>
		<p>
			<textarea id="widget-test-content" name="widget-test[][content]" rows="4" cols="20">safe</textarea>
		</p>
		<p>
			<input id="widget-test-enabled" type="checkbox" name="widget-test[][enabled]" checked="checked" />
			<input type="hidden" name="widget-test[][mode]" value="basic" />
		</p>
		<button class="button" type="button" onclick="alert('handler')">Go</button>
		<script>alert('inline')</script>
		<?php
	}

	/**
	 * Render the front end markup.
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Widget instance values.
	 * @return void
	 */
	public function widget( $args, $instance ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		?>
		<div class="widget widget-test">
			<input type="text" name="leaked" value="control" />
			<script>alert('inline')</script>
		</div>
		<?php
	}
}

/**
 * Component AJAX XSS / request-integrity tests.
 *
 * @group ajax
 */
class Test_Boldgrid_Component_Ajax_Boundaries extends WP_Ajax_UnitTestCase {

	/**
	 * Administrator user ID.
	 *
	 * @var int
	 */
	protected $admin_id;

	/**
	 * Create users used by the request.
	 */
	public function setUp(): void {
		parent::setUp();
		$this->admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
	}

	/**
	 * Reset request state.
	 */
	public function tearDown(): void {
		$_POST    = array();
		$_REQUEST = array();
		Boldgrid_Components_Shortcode_Test_Widget::$style_markup =
			Boldgrid_Components_Shortcode_Test_Widget::DEFAULT_STYLE_MARKUP;
		wp_set_current_user( 0 );
		parent::tearDown();
	}

	/**
	 * Component configuration for the form-control widget.
	 *
	 * @return array
	 */
	protected function test_widget_component() {
		return array(
			'name'   => 'wp_test',
			'widget' => 'Boldgrid_Components_Shortcode_Test_Widget',
		);
	}

	/**
	 * Authenticate and seed a nonced request for the form-control widget.
	 *
	 * @param string $title Title field value.
	 * @return void
	 */
	protected function seed_test_widget_request( $title = 'Widget title' ) {
		wp_set_current_user( $this->admin_id );

		$_POST    = array(
			'boldgrid_editor_gridblock_save' => wp_create_nonce( 'boldgrid_editor_gridblock_save' ),
			'widget-test'                    => array(
				array(
					'title' => $title,
				),
			),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}

	/**
	 * Invoke ajax_shortcode and capture JSON.
	 *
	 * @param array  $component Component configuration.
	 * @param string $type      Render type.
	 * @return array
	 */
	protected function dispatch( $component, $type = 'content' ) {
		$handler = new Boldgrid_Components_Shortcode_Ajax_Double();
		add_action(
			'wp_ajax_boldgrid_component_test',
			function () use ( $handler, $component, $type ) {
				$handler->run_ajax_shortcode( $component, $type );
			}
		);

		try {
			$this->_handleAjax( 'boldgrid_component_test' );
		} catch ( WPAjaxDieContinueException $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
		} catch ( WPAjaxDieStopException $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
		}

		$decoded = json_decode( $this->_last_response, true );
		return is_array( $decoded ) ? $decoded : array( 'raw' => $this->_last_response );
	}

	/**
	 * Missing nonce must not render widget HTML.
	 */
	public function test_component_ajax_requires_nonce() {
		wp_set_current_user( $this->admin_id );
		$_POST    = array(
			'widget-block' => array(
				array(
					'content' => '<p>safe</p><script>alert(1)</script>',
				),
			),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing

		$response = $this->dispatch(
			array(
				'name'   => 'wp_block',
				'widget' => 'WP_Widget_Block',
			)
		);

		$this->assertTrue( empty( $response['content'] ) );
		$this->assertTrue( isset( $response['success'] ) ? false === $response['success'] : true );
	}

	/**
	 * Contributor-controlled block HTML cannot execute in an admin preview.
	 */
	public function test_block_widget_preview_strips_script() {
		wp_set_current_user( $this->admin_id );
		$nonce = wp_create_nonce( 'boldgrid_editor_gridblock_save' );

		$_POST    = array(
			'boldgrid_editor_gridblock_save' => $nonce,
			'widget-block'                   => array(
				array(
					'content' => '<p>ok</p><script>alert(1)</script><img src="x" onerror="alert(1)">',
				),
			),
		);
		$_REQUEST = $_POST; // phpcs:ignore WordPress.Security.NonceVerification.Missing

		$response = $this->dispatch(
			array(
				'name'   => 'wp_block',
				'widget' => 'WP_Widget_Block',
			)
		);

		$this->assertArrayHasKey( 'content', $response );
		$this->assertStringContainsString( 'ok', $response['content'] );
		$this->assertStringNotContainsString( '<script', $response['content'] );
		$this->assertStringNotContainsString( 'onerror', $response['content'] );
	}

	/**
	 * Unrelated POST arrays must not be treated as the widget instance.
	 */
	public function test_request_ignores_unrelated_widget_keys() {
		$handler   = new Boldgrid_Components_Shortcode_Ajax_Double();
		$component = array( 'name' => 'wp_block' );
		$attrs     = $handler->run_sanitize_request_widget_attrs(
			$component,
			array(
				'widget-rss'   => array(
					array(
						'url' => 'https://example.com/feed',
					),
				),
				'widget-block' => array(
					array(
						'content' => '<p>kept</p><script>alert(1)</script>',
					),
				),
			)
		);

		$this->assertStringContainsString( 'kept', $attrs['content'] );
		$this->assertArrayNotHasKey( 'url', $attrs );
		$this->assertStringNotContainsString( '<script', $attrs['content'] );
	}

	/**
	 * Widget settings forms must keep the controls the panel serializes.
	 */
	public function test_form_output_keeps_widget_controls() {
		$this->seed_test_widget_request();

		$response = $this->dispatch( $this->test_widget_component(), 'form' );

		$this->assertArrayHasKey( 'content', $response );
		$form = $response['content'];

		$this->assertStringContainsString( '<input', $form );
		$this->assertStringContainsString( 'type="text"', $form );
		$this->assertStringContainsString( 'type="checkbox"', $form );
		$this->assertStringContainsString( 'type="hidden"', $form );
		$this->assertStringContainsString( 'checked="checked"', $form );
		$this->assertStringContainsString( 'name="widget-test[][title]"', $form );
		$this->assertStringContainsString( 'value="Widget title"', $form );
		$this->assertStringContainsString( '<select', $form );
		$this->assertStringContainsString( '<option value="left" selected="selected"', $form );
		$this->assertStringContainsString( '<textarea', $form );
		$this->assertStringContainsString( 'rows="4"', $form );
		$this->assertStringContainsString( '<label for="widget-test-title"', $form );
		$this->assertStringContainsString( '<button', $form );
		$this->assertStringContainsString( 'id="widget-test-align"', $form );
	}

	/**
	 * Widget settings forms must not carry executable markup.
	 */
	public function test_form_output_strips_script_and_handlers() {
		$this->seed_test_widget_request( '" onerror="alert(1)' );

		$response = $this->dispatch( $this->test_widget_component(), 'form' );
		$form     = $response['content'];

		$this->assertStringNotContainsString( '<script', $form );
		$this->assertStringNotContainsString( 'onclick', $form );
		$this->assertStringNotContainsString( 'onerror="', $form );
		$this->assertStringContainsString( '<input', $form );
	}

	/**
	 * Static presentation CSS survives so the controls stay usable.
	 */
	public function test_form_output_keeps_static_styles() {
		$this->seed_test_widget_request();

		$response = $this->dispatch( $this->test_widget_component(), 'form' );
		$form     = $response['content'];

		$this->assertStringContainsString( '<style>', $form );
		$this->assertStringContainsString( 'display: flex', $form );
		$this->assertStringContainsString( 'justify-content:center', $form );
	}

	/**
	 * Style blocks that fetch remote resources are dropped.
	 */
	public function test_form_output_drops_remote_style_block() {
		Boldgrid_Components_Shortcode_Test_Widget::$style_markup =
			'<style>@import url("//example.com/evil.css");</style>';
		$this->seed_test_widget_request();

		$response = $this->dispatch( $this->test_widget_component(), 'form' );
		$form     = $response['content'];

		$this->assertStringNotContainsString( '<style', $form );
		$this->assertStringNotContainsString( '@import', $form );
		$this->assertStringContainsString( '<select', $form );
	}

	/**
	 * An unterminated style block cannot swallow the controls.
	 */
	public function test_form_output_drops_unterminated_style_block() {
		Boldgrid_Components_Shortcode_Test_Widget::$style_markup = '<style>.bgc-test { display: flex; }';
		$this->seed_test_widget_request();

		$response = $this->dispatch( $this->test_widget_component(), 'form' );
		$form     = $response['content'];

		$this->assertStringNotContainsString( '<style', $form );
		$this->assertStringContainsString( '<input', $form );
		$this->assertStringContainsString( '<select', $form );
		$this->assertStringContainsString( '<textarea', $form );
	}

	/**
	 * A later closed style block cannot terminate an earlier unclosed opener.
	 */
	public function test_form_output_keeps_controls_between_unclosed_and_later_style() {
		$html = '<style>.broken { display: flex; }'
			. '<p><label for="widget-test-title">Title</label>'
			. '<input id="widget-test-title" type="text" name="widget-test[][title]" value="kept" /></p>'
			. '<select id="widget-test-align" name="widget-test[][align]"><option value="left">Left</option></select>'
			. '<textarea name="widget-test[][content]">safe</textarea>'
			. '<style>.later { color: red; }</style>';

		$form = ( new Boldgrid_Components_Shortcode_Ajax_Double() )->run_sanitize_ajax_output( $html, 'form' );

		$this->assertStringContainsString( '<input', $form );
		$this->assertStringContainsString( 'name="widget-test[][title]"', $form );
		$this->assertStringContainsString( '<select', $form );
		$this->assertStringContainsString( '<textarea', $form );
		$this->assertStringContainsString( '<style>.later { color: red; }</style>', $form );
		$this->assertDoesNotMatchRegularExpression( '#<style>[^<]*<(?:input|select|textarea)#i', $form );
	}

	/**
	 * The form allowlist must not widen content previews.
	 */
	public function test_content_output_stays_post_kses() {
		$this->seed_test_widget_request();

		$response = $this->dispatch( $this->test_widget_component(), 'content' );
		$content  = $response['content'];

		$this->assertStringContainsString( 'widget-test', $content );
		$this->assertStringNotContainsString( '<input', $content );
		$this->assertStringNotContainsString( '<script', $content );
	}
}
