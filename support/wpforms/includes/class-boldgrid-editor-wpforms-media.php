<?php
/**
 * Class: Boldgrid_Editor_Wpforms_Media
 *
 * Create the forms media tab.
 *
 * @since      1.4.4
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Wpforms
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Wpforms_Media
 *
 * Create the forms media tab.
 *
 * @since      1.4.4
 */
class Boldgrid_Editor_Wpforms_Media extends Boldgrid_Editor_Media_Tab {

	/**
	 * Fill out the tab content before printing.
	 *
	 * @since 1.4.4
	 *
	 * @return void
	 */
	public function print_content() {
		$form_content = $this->create_form_content();

		$this->update_config_content( $form_content );

		$configs = $this->get_configs();

		include $configs['attachments-template'];

		include $configs['sidebar-template'];
	}

	/**
	 * Update the content configs of a tabs with the given argument.
	 *
	 * @since 1.4.4
	 *
	 * @param array $form_content
	 * @return void
	 */
	public function update_config_content( $form_content ) {
		$configs = $this->get_configs();

		$configs['route-tabs']['form-list']['content'] = $form_content;

		$this->set_configs( $configs );
	}

	/**
	 * Generate the form content for a page based on available forms.
	 *
	 * @since 1.4.4
	 *
	 * @return array
	 */
	public function create_form_content() {
		$form_data = $this->format_form_data();

		foreach ( $form_data as $key => $form ) {
			$form_data[$key]['html'] = Boldgrid_Editor_Wpforms::get_form_markup( $form['id'] );
		}
		return $form_data;
	}

	/**
	 * Find all the forms for a user then create an array with only the relevant data
	 *
	 * @since 1.4.4
	 *
	 * @return array
	 */
	public function format_form_data() {
		$form_data = array();

		$forms = Boldgrid_Editor_Wpforms::get_forms();

		foreach ( $forms as $form ) {
			$form_information['id'] = $form['id'];

			$form_data[] = $form_information;
		}

		return $form_data;
	}

	/**
	 * Create a tabs content
	 *
	 * @since 1.4.4
	 *
	 * @return string
	 */
	public function media_upload_tab_content() {
		add_action( 'admin_enqueue_scripts', array (
			$this,
			'enqueue_header_content'
		) );

		add_action( 'admin_enqueue_scripts',
			array (
				$this,
				'enqueue_form_header_content'
			) );

		return wp_iframe( array (
			$this,
			'print_content'
		) );
	}

	/**
	 * Add Media tab styles.
	 *
	 * @since 1.4.4
	 *
	 * @return void
	 */
	public function enqueue_form_header_content() {
		wp_enqueue_style( 'boldgrid-editor-wpforms-media-tab',
			plugins_url( '/assets/css/media-tab.css', $this->path_configs['addon_directory'] .'/wpforms' ),
			array (), BOLDGRID_EDITOR_VERSION );

		$front_end = wpforms()->frontend;
		if ( $front_end && method_exists( $front_end, 'assets_css' ) ) {
			$front_end->assets_css();
		}
	}
}
