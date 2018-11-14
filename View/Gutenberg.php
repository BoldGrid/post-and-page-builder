<?php
/**
 * File: Gutenberg.php
 *
 * Gutenberg Editor Page View.
 *
 * @since      1.9.0
 * @package    Boldgrid
 * @subpackage Boldgrid\PPB\View\Gutenberg
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */
namespace Boldgrid\PPB\View;

/**
 * Class: Gutenberg
 *
 * Gutenberg Editor Page View.
 *
 * @since      1.9.0
 */
class Gutenberg {

	/**
	 * Setup Process.
	 *
	 * @since 1.9.0
	 */
	public function init() {
		$this->add_scripts();
	}

	/**
	 * Add scripts.
	 *
	 * @since 1.9.0
	 */
	public function add_scripts() {
		add_action( 'enqueue_block_editor_assets', function () {
			wp_enqueue_script(
				'bgppb-modern-editor',
				\Boldgrid_Editor_Assets::get_webpack_script( 'gutenberg' ),
				[ 'wp-blocks', 'wp-element', 'wp-components', 'wp-i18n' ],
				BOLDGRID_EDITOR_VERSION,
				true
			);

			wp_localize_script(
				'bgppb-modern-editor',
				'BoldgridEditor = BoldgridEditor || {}; BoldgridEditor',
				\Boldgrid_Editor_Service::get( 'assets' )->get_shared_vars()
			);

			\Boldgrid_Editor_Assets::enqueue_webpack_style( 'gutenberg' );
		} );
	}
}
