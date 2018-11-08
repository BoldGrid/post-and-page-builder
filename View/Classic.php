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
				'my-block-editor-js',
				\Boldgrid_Editor_Assets::get_webpack_script( 'classic' ),
				[ 'jquery' ],
				BOLDGRID_EDITOR_VERSION,
				true
			);
		} );
	}
}
