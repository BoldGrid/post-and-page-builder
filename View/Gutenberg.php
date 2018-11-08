<?php
namespace Boldgrid\PPB\View;

class Gutenberg {

	public function init() {
		$this->add_scripts();
	}

	public function add_scripts() {
		add_action( 'enqueue_block_editor_assets', function () {
			wp_enqueue_script(
				'my-block-editor-js',
				\Boldgrid_Editor_Assets::get_webpack_script( 'gutenberg' ),
				[ 'wp-blocks', 'wp-element', 'wp-components', 'wp-i18n' ],
				BOLDGRID_EDITOR_VERSION,
				true
			);
		} );
	}
}
