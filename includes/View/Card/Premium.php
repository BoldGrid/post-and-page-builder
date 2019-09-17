<?php
/**
 * Premium class.
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
 * Class: Premium
 *
 * This class is responsible for rendering the "Premium" card on the BoldGrid PPB dashboard.
 *
 * @since 1.11.2
 */
class Premium extends \Boldgrid\Library\Library\Ui\Card {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$apiKey = apply_filters( 'Boldgrid\Library\License\getApiKey', '' );

		$this->id = 'bgppb_get_premium';
		$this->icon = '<span class="dashicons dashicons-admin-network"></span>';

		$features = [];
		$configs = \Boldgrid_Editor_Service::get( 'config' );

		if ( empty( $apiKey ) ) {

			$this->title = esc_html__( 'Build Better Websites With BoldGrid Central', 'boldgrid-editor' );
			$this->subTitle = esc_html__( 'All the tools and services you need to succeed.', 'boldgrid-editor' );
			$this->features = [
				new Feature\Cloud(),
				new Feature\Speedcoach(),
				new Feature\Signup(),
			];

		} elseif ( empty( $configs['premium']['is_premium'] ) ) {

			$this->title = esc_html__( 'Enjoying your free account?', 'boldgrid-editor' );
			$this->subTitle = esc_html__( 'We hope so. There\'s more available by upgrading now!', 'boldgrid-editor' );
			$this->features = [
				new Feature\Pagebuilder(),
				new Feature\Boldgrid(),
				new Feature\MoreCentral(),
			];

		} else {

			$this->title = esc_html__( 'Post & Page Builder Premium', 'boldgrid-editor' );
			$this->subTitle = esc_html__( 'Thank you for running the Premium Post & Page Builder!', 'boldgrid-editor' );
			$this->features = [
				new Feature\Central(),
			];

		}
	}
}
