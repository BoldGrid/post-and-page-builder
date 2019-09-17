<?php
/**
 * Cloud class.
 *
 * @link       https://www.boldgrid.com
 * @since      1.11.2
 *
 * @package    Boldgrid\PPB
 * @subpackage Boldgrid\PPB\View\Feature
 * @copyright  BoldGrid
 * @author     BoldGrid <support@boldgrid.com>
 */

namespace Boldgrid\PPB\View\Feature;

/**
 * Class: Cloud
 *
 * @since 1.11.2
 */
class Cloud extends \Boldgrid\Library\Library\Ui\Feature {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->icon = '<span class="dashicons dashicons-cloud"></span>';

		$this->title = __( 'Cloud WordPress', 'boldgrid-editor' );

		$this->content = '<p>' . __( 'Create a fully functional free WordPress demo in just a few clicks. Easily design, build, test and share your WordPress website with clients or teams.', 'boldgrid-editor' ) . '</p>';
	}
}
