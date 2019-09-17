<?php
/**
 * Central class.
 *
 * @link       https://www.boldgrid.com
 * @since      1.11.2
 *
 * @package    Boldgrid\PPB
 * @subpackage Boldgrid\PPB\Feature
 * @copyright  BoldGrid
 * @author     BoldGrid <support@boldgrid.com>
 */

namespace Boldgrid\PPB\View\Feature;

/**
 * Class: Central
 *
 * This class is responsible for initializing a BoldGrid Central "feature" for use within a card.
 *
 * @since 1.11.2
 */
class Central extends \Boldgrid\Library\Library\Ui\Feature {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$reseller = new \Boldgrid\Library\Library\Reseller();

		$this->icon = '<span class="dashicons boldgrid-icon"></span>';

		$this->title = esc_html__( 'BoldGrid Central', 'boldgrid-editor' );

		$this->content = '<p>' . esc_html__( 'Manage your account, Run Automated Website Speed Tests, and more within BoldGrid Central.', 'boldgrid-editor' ) . '</p>';

		$this->content .= '<p style="text-align:right;"><a class="button-secondary" href="' . esc_url( $reseller->centralUrl ) . '">' . esc_html__( 'BoldGrid Central Login', 'boldgrid-editor' ) . '</a></p>';
	}
}
