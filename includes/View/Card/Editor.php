<?php
/**
 * Editor class.
 *
 * @link       https://www.boldgrid.com
 * @since      1.11.2
 *
 * @package    Boldgrid\PPB
 * @subpackage Boldgrid\PPB\View\Card
 * @copyright  BoldGrid
 * @author     BoldGrid <support@boldgrid.com>
 */

namespace Boldgrid\PPB\View\Card;

use Boldgrid\PPB\View\Feature;

/**
 * Class: Editor
 *
 * This class is responsible for rendering the "Editor" card on the BoldGrid PPB dashboard.
 *
 * @since 1.11.2
 */
class Editor extends \Boldgrid\Library\Library\Ui\Card {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->id = 'bgppb_preferred_editor';
		$this->icon = '<span class="dashicons dashicons-edit"></span>';

		$features = [];

		$this->title = esc_html__( 'Preferred Editor', 'boldgrid-editor' );

		$this->subTitle = esc_html__( 'How do you like to edit your content?', 'boldgrid-editor' );

		$this->features = [
			new Feature\Central(),
		];
	}
}
