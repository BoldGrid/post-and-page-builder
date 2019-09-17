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
class Boldgrid extends \Boldgrid\Library\Library\Ui\Feature {

	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->icon = '<span class="dashicons dashicons-admin-plugins"></span>';

		$this->title = esc_html__( 'More Premium BoldGrid Plugins', 'boldgrid-editor' );

		$this->content = '<p>' . esc_html__( 'Gain access to all BoldGrid premium plugins and services. This includes BoldGrid Backup Premium, which can protect your site from disaster with remote storage.', 'boldgrid-editor' ) . '</p>';
	}
}
