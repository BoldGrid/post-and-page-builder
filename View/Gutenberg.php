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

	public function init() {
		$this->add_scripts();
	}

	/**
	 * [add_scripts description]
	 */
	public function add_scripts() {
		add_action( 'enqueue_block_editor_assets', function () {
			wp_enqueue_script(
				'my-block-editor-js',
				\Boldgrid_Editor_Assets::get_webpack_script( 'gutenberg' ),
				[ 'wp-blocks', 'wp-element', 'wp-components', 'wp-i18n' ],
				BOLDGRID_EDITOR_VERSION,
				true
			);

			\Boldgrid_Editor_Assets::enqueue_webpack_style( 'gutenberg' );
		} );
	}
}
