<?php
/**
 * Central class.
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
 * Class: Central
 *
 * @since 1.11.2
 */
class MoreCentral extends \Boldgrid\Library\Library\Ui\Feature {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$config = \Boldgrid_Editor_Service::get( 'config' );
		$premiumUrl = $config['urls']['premium_key'] . '?source=ppbp-dashboard';

		$this->icon = '<span class="dashicons boldgrid-icon"></span>';
		$this->title = esc_html__( 'More BoldGrid Central Features', 'boldgrid-editor' );
		$this->content = '<p>' . esc_html__( 'Unlock more features within BoldGrid Central, including Cloud WordPress Advanced Controls and Automated Website Speed Tests.', 'boldgrid-ppb' ) . '</p>';
		$this->content .= '<p style="text-align:right;"><a href="' . esc_url( $premiumUrl ) . '" class="button button-primary boldgrid-orange">' . __( 'Get Premium', 'boldgrid-ppb' ) . '</a></p>';
	}
}
