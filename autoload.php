<?php
function bgppb_autoload ( $className ) {
	if ( false === strpos( $className, 'Boldgrid\\PPB\\' ) ) {
		return;
	}
	$updatedClass = str_replace( 'Boldgrid\PPB\\', '', $className );
	$path = __DIR__ . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . $updatedClass . '.php';
	$path = str_replace( '\\', '/', $path );

	if ( file_exists( $path ) && $className !== $updatedClass ) {
		include( $path );
		return;
	}
}

spl_autoload_register( 'bgppb_autoload' );
