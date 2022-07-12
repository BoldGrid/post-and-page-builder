<?php
/**
* File: PageTitle.php
*
* Creates a PageTitle HeadingWidget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: PageTitle
*
* Creates a PageTitle HeadingWidget.
*
* @since 1.14.0
*/
class PageTitle extends HeadingWidget {

	/**
	 * Setup the widget configurations.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		global $post;

		$this_post = $post;

		/*
		 * We need to get the actual post id when on the blog page or else
		 * we will end up with the title of the first post on the blog page
		 * instead of the title of the blog page itself
		 */
		if ( ! is_front_page() && is_home() ) {
			$this_post = get_post( get_option( 'page_for_posts' ) );
		}

		/*
		 * When we are in the post editor, we won't have a post title to display here
		 * So we have to display the placeholder instead
		 */
		if ( is_front_page() && is_home() ) {
			$title = 'Home';
		} elseif ( function_exists( 'is_shop' ) && is_shop() ) {
			$this_post = get_post( get_option( 'woocommerce_shop_page_id' ) );
			$title = $this_post->post_title;
		} elseif ( is_archive() ) {
			$title = single_cat_title( '', false );
		} elseif ( $post && $post->post_title ) {
			$title = $this_post->post_title;
		} else {
			$title = '[ Page Title ]';
		}

		parent::__construct(
			'boldgrid_component_page_title',
			__( 'Page Title', 'boldgrid-editor' ),
			'bgc-page-title',
			__( 'Inserts the current page\'s title into your template.', 'boldgrid-editor' ),
			$title
		);
	}
}
