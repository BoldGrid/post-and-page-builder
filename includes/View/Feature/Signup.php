<?php
/**
 * Signup class.
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
 * Class: Signup
 *
 * @since 1.11.2
 */
class Signup extends \Boldgrid\Library\Library\Ui\Feature {

	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$return_url = admin_url( 'edit.php?post_type=bg_block&page=bgppb-settings' );
		$newKeyUrl = \Boldgrid\Library\Library\Key\PostNewKey::getCentralUrl( $return_url );

		// Ensure the URL is valid and not empty, and doesn't point to the wrong page
		if ( empty( $newKeyUrl ) ||
		     filter_var( $newKeyUrl, FILTER_VALIDATE_URL ) === false ||
		     strpos( $newKeyUrl, 'edit.php' ) !== false ) {
			// Fallback to a direct BoldGrid Central signup URL if getCentralUrl fails or returns wrong URL
			$config = \Boldgrid_Editor_Service::get( 'config' );
			$newKeyUrl = ! empty( $config['urls']['new_key'] ) ? $config['urls']['new_key'] : 'https://www.boldgrid.com/central/';
		}

		$this->icon = '<span class="dashicons dashicons-clipboard"></span>';
		$this->content = '<p>' . esc_html__( 'There\'s more waiting for you in BoldGrid Central. Download the full-featured community versions of ALL our plugins for FREE. It\'s just a click away.', 'boldgrid-editor' ) . '</p>';
		$this->content .= '<p style="text-align:right;"><a href="' . esc_url( $newKeyUrl ) . '" target="_blank" class="button button-primary boldgrid-orange">' . __( 'Sign Up for Free!', 'boldgrid-editor' ) . '</a></p>';
	}
}
