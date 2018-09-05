<?php
/**
* File: Boldgrid_Editor_Compatibility.php
*
* Check if the plugin is compatible.
*
* @since      1.8.0
* @package    BGPPBP_Compatibility
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

/**
* Class: Boldgrid_Editor_Compatibility
*
* Check if the plugin is compatible. Note, this file should be compatible with PHP Version 5.2.
*
* @since 1.8.0
*/
class Boldgrid_Editor_Compatibility {

	/**
	 * Required Versions.
	 *
	 * @since 1.8.0
	 * @var string Version Numbers
	 */
	public $versions;

	/**
	 * Setup class properties.
	 *
	 * @since 1.8.0
	 *
	 * @param string $versions  Minimum Versions.
	 */
	public function __construct( $versions ) {
		$this->versions = $versions;
	}

	/**
	 *  Check to see if WordPress version is installed at our required minimum or deactivate.
	 *
	 * @since 1.8.0
	 */
	public function checkVersions() {
		global $wp_version;

		$valid = true;
		if ( version_compare( $wp_version, $this->versions['wp'], '<' ) ) {
			add_action( 'admin_init', array( $this, 'deactivatePlugin' ) );
			add_action( 'admin_notices', array( $this, 'invalidWPVersion' ) );
			$valid = false;
		} else if ( version_compare( phpversion(), $this->versions['php'], '<' )  ) {
			add_action( 'admin_init', array( $this, 'deactivatePlugin' ) );
			add_action( 'admin_notices', array( $this, 'invalidPHPVersion' ) );
			$valid = false;
		}

		return $valid;
	}

	/**
	 * Deactivate the Plugin.
	 *
	 * @since 1.8.0
	 */
	public function deactivatePlugin() {
		deactivate_plugins( BOLDGRID_EDITOR_ENTRY );
	}

	/**
	 * Show a notice if the user has an invalid WordPress Version.
	 *
	 * @since 1.8.0
	 */
	public function invalidWPVersion() { ?>
		<div class="notice notice-error">
			<p><?php _e( 'Failed to activate the Post and Page Builder! Your WordPress version is not compatible. This plugin requires at least WordPress ' . $this->versions['wp'], 'boldgrid-editor' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Show a notice if the user has an invalid PHP Version.
	 *
	 * @since 1.8.0
	 */
	public function invalidPHPVersion() { ?>
		<div class="notice notice-error">
			<p><?php _e( 'Failed to activate the Post and Page Builder! Your PHP version is not compatible. This plugin requires at least PHP ' . $this->versions['php'], 'boldgrid-editor' ); ?></p>
		</div>
		<?php
	}

}
