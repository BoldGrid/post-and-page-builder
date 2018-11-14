<?php
/**
 * File: Classic.php
 *
 * Classic Editor Page View.
 *
 * @since      1.9.0
 * @package    Boldgrid
 * @subpackage Boldgrid\PPB\View\Classic
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */
namespace Boldgrid\PPB\View;

/**
 * Class: Classic
 *
 * Classic Editor Page View.
 *
 * @since      1.9.0
 */
class Classic {

	/**
	 * Add new page.
	 *
	 * @since 1.9.0
	 */
	public function init() {
		add_action( 'admin_enqueue_scripts', function () {
			wp_enqueue_script(
				'bgppb-classic',
				\Boldgrid_Editor_Assets::get_webpack_script( 'classic' ),
				array( 'jquery', 'underscore' ),
				BOLDGRID_EDITOR_VERSION,
				true );

			wp_localize_script(
				'bgppb-classic',
				'BoldgridEditor = BoldgridEditor || {}; BoldgridEditor',
				\Boldgrid_Editor_Service::get( 'assets' )->get_shared_vars()
			);

			\Boldgrid_Editor_Assets::enqueue_webpack_style( 'classic' );
		} );
	}
}
