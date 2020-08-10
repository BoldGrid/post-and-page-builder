<?php
/**
 * File: Service.php
 *
 * Loads the ratings activity monitor.
 *
 * @since      1.10.0
 * @package    Boldgrid
 * @subpackage Boldgrid\PPB\Rating\Service
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

namespace Boldgrid\PPB\Rating;

use Boldgrid\Library\Library;

/**
 * Class: Service
 *
 * Loads the ratings activity monitor.
 *
 * @since      1.10.0
 */
class Service {

	/**
	 * Actvity class instance.
	 *
	 * @since 1.10.0
	 *
	 * @var Boldgrid\Library\Library\Activity
	 */
	protected $activity;

	/**
	 * Start the rating process.
	 *
	 * @since 1.10.0
	 */
	public function init() {
		if ( $this->lib_supports_ratings() ) {
			new Library\RatingPrompt();
			$this->activity = new Library\Activity( BOLDGRID_EDITOR_KEY );

			// Disable this check needs, testing inconsistant rating requests
			// $this->check_version_status();
		}
	}

	/**
	 * Record an activity event.
	 *
	 * @since 1.10.0
	 *
	 * @param  string $name Activity name.
	 */
	public function record( $name ) {
		if ( $this->activity ) {
			$this->activity->add( $name, 1, self::get_config() );
		}
	}

	/**
	 * Check if the user has been with us for at least 2 minor versions.
	 *
	 * @since 1.10.0
	 */
	protected function check_version_status() {
		$has_checked_version = \Boldgrid_Editor_Option::get( 'has_checked_version' );

		if ( ! $has_checked_version ) {
			\Boldgrid_Editor_Option::update( 'has_checked_version', 1 );
			$min_version = $this->get_previous_minor_version();
			if ( \Boldgrid_Editor_Version::is_activated_version_older_than( $min_version ) ) {
				$this->record( 'dedicated_user' );
			}
		}
	}

	/**
	 * Get our most recent minor version before current version.
	 *
	 * @since 1.10.0
	 *
	 * @return string Version Number
	 */
	protected function get_previous_minor_version() {
		$versions = explode( '.', BOLDGRID_EDITOR_VERSION );

		$patch = 0;
		$major = $versions[0];
		$minor = ( $versions[1] - 1 );

		if ( $minor < 0 ) {
			$major = $major - 1;
			$minor = 99;
		}

		return $major . '.' . $minor . '.' . $patch;
	}

	/**
	 * Get the config path.
	 *
	 * @since 1.10.0
	 *
	 * @return string Path to configs.
	 */
	protected static function get_config() {
		return __DIR__ . '/config.php';
	}

	/**
	 * Are the needed classes for ratings loaded?
	 *
	 * @since 1.10.0
	 *
	 * @return boolean Are ratings supported?
	 */
	protected function lib_supports_ratings() {
		return class_exists( '\Boldgrid\Library\Library\RatingPrompt' ) &&
			class_exists( '\Boldgrid\Library\Library\Activity' );
	}
}
