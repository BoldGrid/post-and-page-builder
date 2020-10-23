<?php
/**
* File: SiteDescription.php
*
* Creates a SiteDescription HeadingWidget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: SiteDescription
*
* Creates a SiteDescription HeadingWidget.
*
* @since 1.14.0
*/
class SiteDescription extends HeadingWidget {

		/**
	 * Setup the widget configurations.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_site_description',
			__( 'Site Description', 'boldgrid-editor' ),
			'bgc-site-description',
			__( 'Inserts the website\'s description ( tagline ) into your template.', 'boldgrid-editor' ),
			get_bloginfo( 'description' )
		);
	}
}