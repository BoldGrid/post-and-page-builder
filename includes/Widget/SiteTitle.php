<?php
/**
* File: SiteTitle.php
*
* Creates a SiteTitle HeadingWidget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: SiteTitle
*
* Creates a SiteTitle HeadingWidget.
*
* @since 1.14.0
*/
class SiteTitle extends HeadingWidget {

		/**
	 * Setup the widget configurations.
	 *
	 * @since 1.14.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_site_title',
			__( 'Site Title', 'boldgrid-editor' ),
			'bgc-site-title',
			__( 'Inserts the website\'s title into your template.', 'boldgrid-editor' ),
			get_bloginfo( 'name' )
		);
	}
}