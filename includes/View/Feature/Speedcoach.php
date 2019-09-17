<?php
/**
 * SpeedCoach class.
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
 * Class: SpeedCoach
 *
 * @since 1.11.2
 */
class Speedcoach extends \Boldgrid\Library\Library\Ui\Feature {
	/**
	 * Init.
	 *
	 * @since 1.11.2
	 */
	public function init() {
		$this->icon = '<span class="dashicons dashicons-chart-line"></span>';
		$this->title = esc_html__( 'Speed Coach', 'boldgrid-editor' );
		$this->content = '<p>' . esc_html__( 'A faster website means happier visitors and higher rankings on the search engines. Simply type in your website’s URL and receive detailed advice on making your site lightning fast.', 'boldgrid-editor' ) . '</p>';
	}
}
