<?php
// Ensure Composer autoloader is loaded first so vendor classes are available
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

/**
 * Ensure BoldGrid Library classes are loaded.
 * This function loads commonly used Library classes that may not be autoloaded.
 *
 * @since 1.27.9
 */
function bgppb_ensure_library_classes() {
	static $loaded = false;
	if ( $loaded ) {
		return;
	}
	$loaded = true;

	$vendor_base_path = __DIR__ . '/vendor/boldgrid/library/src';
	$vendor_classes = [
		'\Boldgrid\Library\Library\Ui\Card' => $vendor_base_path . '/Library/Ui/Card.php',
		'\Boldgrid\Library\Library\Ui\Feature' => $vendor_base_path . '/Library/Ui/Feature.php',
		'\Boldgrid\Library\Library\Key\PostNewKey' => $vendor_base_path . '/Library/Key/PostNewKey.php',
		'\Boldgrid\Library\Library\Reseller' => $vendor_base_path . '/Library/Reseller.php',
		// PostNewKey dependencies
		'\Boldgrid\Library\Library\Filter' => $vendor_base_path . '/Library/Filter.php',
		'\Boldgrid\Library\Library\ReleaseChannel' => $vendor_base_path . '/Library/ReleaseChannel.php',
		'\Boldgrid\Library\Library\Key' => $vendor_base_path . '/Library/Key.php',
		'\Boldgrid\Library\Library\Configs' => $vendor_base_path . '/Library/Configs.php',
	];

	foreach ( $vendor_classes as $vendor_class => $vendor_file ) {
		if ( ! class_exists( $vendor_class, false ) && file_exists( $vendor_file ) ) {
			require_once $vendor_file;
		}
	}
}

function bgppb_autoload ( $className ) {
	if ( false === strpos( $className, 'Boldgrid\\PPB\\' ) ) {
		return;
	}
	$updatedClass = str_replace( 'Boldgrid\PPB\\', '', $className );
	$path = __DIR__ . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . $updatedClass . '.php';
	$path = str_replace( '\\', '/', $path );

	if ( file_exists( $path ) && $className !== $updatedClass ) {
		// Ensure Library classes are loaded before including PPB classes
		bgppb_ensure_library_classes();
		include( $path );
		return;
	}
}

spl_autoload_register( 'bgppb_autoload' );
