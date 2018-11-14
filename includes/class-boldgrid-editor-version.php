<?php
/**
 * Class: Boldgrid_Editor_Version
 *
 * This is the class responsible for checking if the users wordpress and php versions are acceptable.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Version
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Version
 *
 * This is the class responsible for checking if the users wordpress and php versions are acceptable.
 *
 * @since      1.2
 */
class Boldgrid_Editor_Version {

	/**
	 * Check if activated version if older than given version.
	 *
	 * @since 1.3
	 *
	 * @param string $older_than_version Version number to check against.
	 *
	 * @return boolean $is_old_version.
	 */
	public static function is_activated_version_older_than( $older_than_version ) {
		$is_old_version = true;

		$check_version = Boldgrid_Editor_Option::get( 'activated_version' );
		if ( $check_version ) {
			$is_old_version = version_compare( $check_version, $older_than_version, '<' );
		}

		return $is_old_version;
	}

	/**
	 * Check if we should display admin notice.
	 *
	 * @since 1.3
	 *
	 * @return boolean Should we display admin notice.
	 */
	public static function should_display_notice() {
		// 1.3 is the version that we'll be displaying the notice for.
		return self::is_activated_version_older_than('1.3') && ! Boldgrid_Editor_Option::get( 'displayed_v1.3_notice' );
	}

	/**
	 * Add option that will prevent admin notice from displaying again.
	 *
	 * @since 1.3
	 */
	public function save_notice_state() {
		if ( self::should_display_notice() ) {
			Boldgrid_Editor_Option::update( 'displayed_v1.3_notice', 1 );
		}
	}
}
