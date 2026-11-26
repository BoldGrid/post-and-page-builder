<?php
/**
 * Tests for WPForms editor preview markup output.
 *
 * @package Test_Boldgrid_Editor
 */

/**
 * Class: Test_Boldgrid_Editor_Wpforms_Preview
 */
class Test_Boldgrid_Editor_Wpforms_Preview extends WP_UnitTestCase {

	/**
	 * Markup returned by the stubbed form shortcode.
	 *
	 * @var string
	 */
	const FORM_MARKUP = '<form class="wpforms-form"><label>{{{PPBQA-MARKER}}} {{PPBQA-MARKER}} <# PPBQA-MARKER #> </script></label><b>PPBQA-MARKER</b><input value="PPBQA-MARKER &amp; \'single\' &quot;double&quot;"></form>';

	/**
	 * Form post ID.
	 *
	 * @var int
	 */
	protected $form_id;

	/**
	 * Set up a form post and a stub form shortcode.
	 */
	public function setUp(): void {
		parent::setUp();

		require_once BOLDGRID_EDITOR_PATH . '/support/wpforms/includes/class-boldgrid-editor-wpforms.php';

		register_post_type( 'wpforms' );

		$this->form_id = self::factory()->post->create( array( 'post_type' => 'wpforms' ) );

		add_shortcode(
			'wpforms',
			function () {
				return self::FORM_MARKUP;
			}
		);
	}

	/**
	 * Remove the stub shortcode.
	 */
	public function tearDown(): void {
		remove_shortcode( 'wpforms' );
		unregister_post_type( 'wpforms' );

		parent::tearDown();
	}

	/**
	 * Capture print_media_templates() output.
	 *
	 * @return string
	 */
	protected function get_output() {
		$wpforms = new Boldgrid_Editor_Wpforms();
		$wpforms->initiallizeConfigs();

		ob_start();
		$wpforms->print_media_templates();
		return ob_get_clean();
	}

	/**
	 * Get the contents of every script element of a given type.
	 *
	 * @param string $output Printed output.
	 * @param string $type   Script type attribute.
	 * @return array
	 */
	protected function get_script_bodies( $output, $type ) {
		preg_match_all(
			'#<script type="' . preg_quote( $type, '#' ) . '"[^>]*>(.*?)</script>#s',
			$output,
			$matches
		);

		return $matches[1];
	}

	/**
	 * Form markup is not printed inside a client side template.
	 */
	public function test_form_markup_not_printed_as_template() {
		$output = $this->get_output();

		$this->assertStringNotContainsString( 'tmpl-editor-boldgrid-form-', $output );

		$templates = $this->get_script_bodies( $output, 'text/html' );
		$this->assertCount( 1, $templates, 'Only the static form-not-found template is printed.' );

		foreach ( $templates as $template ) {
			$this->assertStringNotContainsString( '{{', $template );
			$this->assertStringNotContainsString( '<#', $template );
			$this->assertStringNotContainsString( 'wpforms-form', $template );
		}
	}

	/**
	 * Form markup is printed as inert JSON that cannot close its script element.
	 */
	public function test_form_markup_printed_as_inert_json() {
		$output = $this->get_output();

		$this->assertStringContainsString( '</script>', self::FORM_MARKUP, 'Fixture must contain a closing script tag.' );
		$this->assertSame(
			substr_count( $output, '<script' ),
			substr_count( $output, '</script>' ),
			'Form markup must not open or close script elements.'
		);

		$this->assertStringNotContainsString( '<b>PPBQA-MARKER</b>', $output, 'Form markup must not be printed as markup.' );
		$this->assertStringContainsString( 'PPBQA-MARKER', $output );

		$data = $this->get_script_bodies( $output, 'application/json' );
		$this->assertCount( 1, $data );

		$json = $data[0];
		$this->assertStringNotContainsString( '<', $json );
		$this->assertStringNotContainsString( '>', $json );

		$decoded = json_decode( $json, true );
		$this->assertIsArray( $decoded );
		$this->assertArrayHasKey( (string) $this->form_id, $decoded );
		$this->assertSame( '<div>' . self::FORM_MARKUP . '</div>', $decoded[ (string) $this->form_id ] );
	}

	/**
	 * Invalid markup for one form does not drop the preview of another form.
	 */
	public function test_invalid_markup_does_not_drop_other_forms() {
		$broken_id = self::factory()->post->create( array( 'post_type' => 'wpforms' ) );

		add_shortcode(
			'wpforms',
			function ( $atts ) use ( $broken_id ) {
				return (int) $atts['id'] === $broken_id ? "\xB1\x31\xFF" : self::FORM_MARKUP;
			}
		);

		$data    = $this->get_script_bodies( $this->get_output(), 'application/json' );
		$decoded = json_decode( $data[0], true );

		$this->assertIsArray( $decoded );
		$this->assertSame( '<div>' . self::FORM_MARKUP . '</div>', $decoded[ (string) $this->form_id ] );
	}

	/**
	 * No forms prints an empty JSON object.
	 */
	public function test_no_forms_prints_empty_object() {
		wp_delete_post( $this->form_id, true );

		$data = $this->get_script_bodies( $this->get_output(), 'application/json' );

		$this->assertSame( array( '{}' ), $data );
	}
}
