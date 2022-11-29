<?php
/**
 * Unsplash class.
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
class Unsplash extends \Boldgrid\Library\Library\Ui\Feature {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$reseller = new \Boldgrid\Library\Library\Reseller();

		$this->icon = '<span class="dashicons dashicons-format-image"></span>';

		$this->title = esc_html__( 'Unsplash', 'boldgrid-editor' );

		$this->content = '<p>' . esc_html__(
			'Some images used in Post and Page Builder content uses direct hotlinks to Unsplash to provide free images. Recently, the format of these links was changed. If you find that some stock images are missing, you can use this option to update the formats.',
			'boldgrid-editor'
		) . '</p>';

		$this->content .= '<p style="font-weight:bold">' . esc_html__(
			'It is HIGHLY recommended that you perform a backup before running the update.',
			'boldgrid-editor'
		) . '</p>';

		$this->content .= '<p>' . esc_html__(
			'If you are using a CDN or a caching plugin, you may need to clear your cache after updating the formats.',
			'boldgrid-editor'
		) . '</p>';

		$nonce = wp_create_nonce( 'update_unsplash_hotlinks' );

		$this->content .= '<p style="text-align:right;"><a class="button-secondary update-unsplash-hotlinks" data-nonce="' . esc_attr( $nonce ) . '">' . esc_html__( 'Update Unsplash Hotlinks', 'boldgrid-editor' ) . '</a></p>';
		$this->content .= '<div class="update-unsplash-results"></div>';
	}
}
