<?php
/**
 * Boldgrid class.
 *
 * @link       https://www.boldgrid.com
 * @since      1.11.2
 *
 * @package    Boldgrid\PPB
 * @subpackage Boldgrid\PPB\View
 * @copyright  BoldGrid
 * @author     BoldGrid <support@boldgrid.com>
 */

namespace Boldgrid\PPB\View\Feature;

/**
 * Class: Boldgrid
 *
 * @since 1.11.2
 */
class Pagebuilder extends \Boldgrid\Library\Library\Ui\Feature {

	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->icon = '<span class="dashicons dashicons-edit"></span>';
		$this->title = esc_html__( 'More Post & Page Builder Features', 'boldgrid-editor' );
		$this->content = '<p>' . esc_html__( 'A premium upgrade includes sliders, exclusive blocks, unique widgets and more.', 'boldgrid-editor' ) . '</p>';
	}
}
