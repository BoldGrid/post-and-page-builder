<?php
/**
 * Class: Boldgrid_Editor_Fs
 *
 * Functions for interacting with WordPress Filesystem.
 *
 * @since      1.2.3
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Fs
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Fs
 *
 * Functions for interacting with WordPress Filesystem.
 *
 * @since      1.2.3
 */
class Boldgrid_Editor_Fs {

	/**
	 * WP Filesystem.
	 *
	 * @since 1.24.1
	 *
	 * @var WP_Filesystem_Base Global WP Filesystem instance.
	 */
	public $wp_filesystem;

	public function __construct() {
		$this->wp_filesystem = $this->init();

		return $this;
	}

	/**
	 * Accessor.
	 *
	 * @since 1.6
	 *
	 * @return wp_filesystem Wordpress global.
	 */
	public function get_wp_filesystem() {
		return $this->wp_filesystem;
	}

	/**
	 * Initialize the WP_Filesystem.
	 *
	 * @since 1.6
	 * @global $wp_filesystem WordPress Filesystem global.
	 */
	public function init() {
		global $wp_filesystem;
		if ( empty( $wp_filesystem ) ) {
			require_once ABSPATH . '/wp-admin/includes/file.php';
			WP_Filesystem();
		}

		return $wp_filesystem;
	}

	/**
	 * Save Compiled SCSS.
	 *
	 * @since 1.6
	 *
	 * @param string $content Content to save.
	 * @param string $file File to write to.
	 */
	public function save( $content, $file ) {

		// Write output to CSS file.
		$chmod_file = ( 0644 & ~ umask() );
		if ( defined( 'FS_CHMOD_FILE' ) ) {
			$chmod_file = FS_CHMOD_FILE;
		}

		return $this->wp_filesystem->put_contents( $file, $content, $chmod_file );
	}
}
