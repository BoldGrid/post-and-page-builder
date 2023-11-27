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
	public static function get_notice_status() {
		$setup = Boldgrid_Editor_Option::get( 'setup' );

		/*
		 * Editor Choice Notice Should Display
		 * - If the user previously had version < 1.9 of the PPB
		 *
		 * The intro should display if the user
		 * - has not gone through setup
		 * - and is not an exiting user
		 */
		return [
			[ 'name' => 'editor_choice', 'enabled' => self::has_editor_choice_notice() ],
			[ 'name' => 'bg_control', 'enabled' => self::has_bg_control_notice() ],
			[ 'name' => 'intro', 'enabled' => ! self::is_notice_dismissed( 'editor_choice' ) && ! $setup ],
			[ 'name' => 'onb_videos', 'enabled' => self::has_onb_videos() && ! self::is_notice_dismissed( 'onb_videos' ) ],
		];
	}

	/**
	 * Should we display the editor choice notice?
	 *
	 * @since 1.9.0
	 *
	 * @return boolean Display Notice?
	 */
	public static function has_editor_choice_notice() {
		return Boldgrid_Editor_Version::is_activated_version_older_than( '1.9.0-rc.0' ) && ! self::check_and_dismiss( 'editor_choice' );
	}

	/**
	 * Get Onboarding Videos
	 *
	 * @return array Onboarding Videos
	 */
	public static function get_onboarding_videos() {
		$onb_videos     = get_option( 'boldgrid_onboarding_videos', array() );
		$ppb_onb_videos = array();

		foreach ( $onb_videos as $key => $video ) {
			if ( 'ppb' === $video->Plugin ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$ppb_onb_videos[] = $video;
			}
		}

		if ( 0 !== count( $ppb_onb_videos ) ) {
			usort(
				$ppb_onb_videos,
				function( $a, $b ) {
					return $a->DisplayOrder - $b->DisplayOrder; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				}
			);
		}

		return $ppb_onb_videos;
	}

	/**
	 * Do we have any onboarding videos?
	 *
	 * @since 1.26.0
	 *
	 * @return boolean Display Notice?
	 */
	public static function has_onb_videos() {
		$onb_videos = self::get_onboarding_videos();

		error_log( json_encode( $onb_videos ) );

		if ( isset( $onb_videos ) && ! empty( $onb_videos ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Should we display the new Background Control Notice?
	 *
	 * @since 1.25.0
	 *
	 * @return boolean Display Notice?
	 */
	public static function has_bg_control_notice() {
		$is_crio       = false;
		$current_theme = wp_get_theme();
		if ( $current_theme->exists() ) {
			$theme_name    = $current_theme->get( 'Name' );
			if ( 'Crio' === $theme_name || 'Prime' === $theme_name ) {
				$is_crio = true;
			}
		}
		return Boldgrid_Editor_Version::is_activated_version_older_than( '1.25.0-rc1' ) && ! self::check_and_dismiss( 'bg_control' ) && $is_crio;
	}

	/**
	 * Check if a notice is dismissed.
	 *
	 * @since 1.9.0
	 *
	 * @param  string  $name Name of a notice.
	 * @return boolean       Is this notice dimissed?
	 */
	public static function is_notice_dismissed( $name ) {
		$notices = Boldgrid_Editor_Option::get( 'notices', [] );
		return ! empty( $notices[ $name ]['dismissed'] );
	}

	/**
	 * Check if a notice is dimissed, dismiss it's not.
	 *
	 * @since 1.9.0
	 *
	 * @param  string $name Name of notice.
	 * @return boolean      Is this notice dimissed?
	 */
	public static function check_and_dismiss( $name ) {
		$notices = Boldgrid_Editor_Option::get( 'notices', [] );
		$is_dismissed = ! empty( $notices[ $name ]['dismissed'] );
		if ( ! $is_dismissed ) {
			$notices[ $name ]['dismissed'] = true;
			Boldgrid_Editor_Option::update( 'notices', $notices );
		}

		return $is_dismissed;
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
		Boldgrid_Editor_Option::update( 'notices', array() );
		Boldgrid_Editor_Option::update( 'default_editor', array() );
		Boldgrid_Editor_Option::update( 'preview_styles', array() );
		Boldgrid_Editor_Option::update( 'activated_version', BOLDGRID_EDITOR_VERSION );
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

	public function ajax_dismiss_videos() {
		// Check the nonce.
		$nonce_check = check_ajax_referer( 'boldgrid_editor_dismiss_onb_videos', 'nonce', false );

		// If you are not at least a Contributor, you may not submit feedback.
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( esc_html__( 'Error: WordPress security violation.', 'boldgrid-inspirations' ) );
		}

		if ( 1 !== $nonce_check ) {
			// Terminate this callback script, with an error message.
			wp_die( esc_html__( 'Error: WordPress security violation.', 'boldgrid-inspirations' ) );
		}

		$this->check_and_dismiss( 'onb_videos' );

		wp_send_json_success();
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
