<?php
/**
 * Utilities class.
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
 * This class is responsible for rendering the "Utilites" card on the BoldGrid PPB dashboard.
 *
 * @since 1.11.2
 */
class Utilities extends \Boldgrid\Library\Library\Ui\Card {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->id = 'bgppb_utilities';
		$this->icon = '<span class="dashicons dashicons-admin-tools"></span>';

		$features = array();

		$this->title = esc_html__( 'Post and Page Builder Utilities', 'boldgrid-editor' );

		$this->subTitle = esc_html__( 'Advanced utilities for case by case uses.', 'boldgrid-editor' );

		$this->features = array(
			new Feature\Unsplash(),
		);
	}
}
