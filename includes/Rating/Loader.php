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

			$this->import_blocks_activity();
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
