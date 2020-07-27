<?php
/**
 * BoldGrid Source Code
 *
 * @package Boldgrid_Editor_Config
 * @copyright BoldGrid.com
 * @version $Id$
 * @author BoldGrid.com <wpb@boldgrid.com>
 */

/**
 * BoldGrid Edit Config class.
 */
class Boldgrid_Editor_Config {
	/**
	 * Protected class property for $configs.
	 */
	private $configs;

	/**
	 * Getter for configs.
	 *
	 * @return array
	 */
	public function get_configs( $key = null ) {
		return ! empty( $this->configs[$key] ) ? $this->configs[$key] : $this->configs;
	}

	/**
	 * Setter for configs.
	 *
	 * @param array $configs The configuration array.
	 */
	public function set_configs( $configs ) {
		$this->configs = $configs;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Define Editor configuration directory, if not defined.
		if ( false === defined( 'BOLDGRID_EDITOR_CONFIGDIR' ) ) {
			define( 'BOLDGRID_EDITOR_CONFIGDIR', BOLDGRID_EDITOR_PATH . '/includes/config' );
		}

		// Get the global configs.
		$global_configs = require BOLDGRID_EDITOR_CONFIGDIR . '/config.plugin.php';

		// Get the local configs.
		$local_configs = array ();
		if ( file_exists( $local_config_filename = BOLDGRID_EDITOR_CONFIGDIR . '/config.local.php' ) ) {
			$local_configs = include $local_config_filename;
		}

		// If the user has an api key stored in their database, then set it as the global api_key // BradM //.
		$global_configs['api_key'] = self::get_mixed_option( 'boldgrid_api_key' );

		// Merge the global and local configs.
		$configs = array_merge( $global_configs, $local_configs );

		// Add premium configs when in admin.
		add_action( 'admin_init', array( $this, 'set_premium_settings' ) );

		/*
		 * Update all plugin configurations.
		 *
		 * @since 1.7.0
		 *
		 * @param array $configs All plugin configurations.
		 */
		$configs = apply_filters( 'BoldgridEditor\Config', $configs );

		// Set the configs in a class property.
		$this->set_configs( $configs );
	}

	/**
	 * Update the configuration with premium settings.
	 *
	 * @since 1.8.0
	 */
	public function set_premium_settings() {
		$configs = Boldgrid_Editor_Service::get( 'config' );

		$is_premium = false;
		if ( class_exists( '\Boldgrid\Library\Library\License' ) ) {
			$license    = new \Boldgrid\Library\Library\License();
			$is_premium = $license->isPremium( 'post-and-page-builder' );
		}

		$relative_path = 'post-and-page-builder-premium/post-and-page-builder-premium.php';
		$abs_path      = dirname( BOLDGRID_EDITOR_PATH ) . '/' . $relative_path;

		$editor_fs = new Boldgrid_Editor_Fs();

		// Function is_plugin_active only available in and after admin_init.
		$configs['premium']['is_premium_active'] = is_plugin_active( $relative_path );
		$configs['premium']['is_premium_installed'] = $editor_fs->get_wp_filesystem()->exists( $abs_path );
		$configs['premium']['is_premium_done'] = $is_premium && $configs['premium']['is_premium_active'];
		$configs['premium']['is_premium'] = $is_premium;

		Boldgrid_Editor_Service::register( 'config', $configs );
	}

	/**
	 * The api key option is not being save in the correct, method. Chack bothe site and regular.
	 *
	 * @since 1.7.0
	 *
	 * @param  string $name Option Name.
	 * @return string       Value.
	 */
	public static function get_mixed_option( $name ) {
		$value = get_option( $name );
		if ( ! $value ) {
			$value = get_site_option( $name );
		}

		return $value;
	}
}
