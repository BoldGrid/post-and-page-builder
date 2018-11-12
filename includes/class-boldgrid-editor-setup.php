<?php
/**
 * Class: Boldgrid_Editor_Setup
 *
 * Handle setup changes.
 *
 * @since      1.6
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Setup
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Setup
 *
 * Handle setup changes.
 *
 * @since      1.6
 */
class Boldgrid_Editor_Setup {

	/**
	 * Should we show the setup?
	 *
	 * @since 1.6
	 *
	 * @return boolean Should we show first time setup.
	 */
	public static function should_show_setup() {
		$show = false;
		$is_boldgrid_theme = Boldgrid_Editor_Theme::is_editing_boldgrid_theme();
		$setup = Boldgrid_Editor_Option::get( 'setup' );

		if ( ! $is_boldgrid_theme && ! $setup ) {
			$show = true;
		}

		return $show;
	}

	/**
	 * Delete boldgrid setup when we recieve this param.
	 *
	 * @since 1.6
	 */
	public function reset_editor_action() {
		if ( ! empty( $_REQUEST['boldgrid-editor-reset'] ) ) {
			$this->reset_editor_settings();
		}
	}

	/**
	 * Delete all editor settings
	 */
	public function reset_editor_settings() {
		Boldgrid_Editor_Option::update( 'setup', array() );
		Boldgrid_Editor_Option::update( 'styles', array() );
		Boldgrid_Editor_Option::update( 'default_editor', array() );
		Boldgrid_Editor_Option::update( 'preview_styles', array() );
	}

	/**
	 * Get the chosen template setting.
	 *
	 * @since 1.6
	 *
	 * @return string Chosen template.
	 */
	public static function get_template_choice() {
		$setup = Boldgrid_Editor_Option::get( 'setup', array() );
		return ! empty( $setup['template']['choice'] ) ? $setup['template']['choice'] : false;
	}

	/**
	 * Ajax Call save setup settings.
	 *
	 * @since 1.5
	 */
	public function ajax() {
		$response = array();

		if ( ! empty( $_POST['bgppb-template'] ) ) {
			$settings = array(
				'template' => array(
					'choice' => ! empty( $_POST['bgppb-template'] ) ?
						sanitize_text_field( $_POST['bgppb-template'] ) : 'fullwidth'
				)
			);
		}

		Boldgrid_Editor_Ajax::validate_nonce( 'setup' );

		if ( ! empty( $settings ) ) {
			Boldgrid_Editor_Option::update( 'setup', $settings );
			wp_send_json_success( $settings );
		} else {
			status_header( 400 );
			wp_send_json_error();
		}
	}

}
