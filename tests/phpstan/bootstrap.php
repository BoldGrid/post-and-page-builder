<?php
/**
 * Constants PHPStan cannot discover: WordPress defines these while it loads and the stubs do not declare them,
 * and the plugin defines its version from the plugin header at runtime.
 *
 * @package Boldgrid_Editor
 */

define( 'BOLDGRID_EDITOR_VERSION', '0.0.0' );

define( 'WPINC', 'wp-includes' );
define( 'STYLESHEETPATH', '' );
define( 'TEMPLATEPATH', '' );
