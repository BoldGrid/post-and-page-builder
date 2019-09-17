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
		$newKeyUrl = \Boldgrid\Library\Library\Key\PostNewKey::getCentralUrl( admin_url( 'edit.php?post_type=bg_block&page=bgppb-settings' ) );

		$this->icon = '<span class="dashicons dashicons-clipboard"></span>';
		$this->content = '<p>' . esc_html__( 'There’s more waiting for you in BoldGrid Central. Download the full-featured community versions of ALL our plugins for FREE. It’s just a click away.', 'boldgrid-editor' ) . '</p>';
		$this->content .= '<p style="text-align:right;"><a href="' . esc_url( $newKeyUrl ) . '" class="button button-primary boldgrid-orange">' . __( 'Sign Up for Free!', 'boldgrid-editor' ) . '</a></p>';
	}
}
