<?php

// Adds header icon SVGs.
$header_icons = array(
	'wp_boldgrid_component_menu'             => '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z"/></svg>',
	'wp_boldgrid_component_page_title'       => '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M2.5,4v3h5v12h3V7h5V4H2.5z M21.5,9h-9v3h3v7h3v-7h3V9z"/></g></g></g></svg>',
	'wp_boldgrid_component_site_title'       => '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
	'wp_boldgrid_component_site_description' => '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24" x="0"/></g><g><g><g><path d="M4,9h16v2H4V9z M4,13h10v2H4V13z"/></g></g></g></svg>',
	'wp_boldgrid_component_logo'             => '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
);

return array(
	'skipped_widgets' => array(
		'media_audio',
		'media_video',
		'media_gallery',
		'media_image',
		'custom_html',
		'text',
	),
	'types' => array(
		array( 'name' => 'structure', 'title' => 'Layout & Formatting' ),
		array( 'name' => 'header', 'title' => 'Headers' ),
		array( 'name' => 'design', 'title' => 'Design' ),
		array( 'name' => 'media', 'title' => 'Media' ),
		array( 'name' => 'widget', 'title' => 'Widgets' ),
	),
	'components' => array(
		'wp_boldgrid_component_menu' => array(
			'js_control' => array(
				'icon' => $header_icons['wp_boldgrid_component_menu'],
				'type' => 'header',
			),
		),
		'wp_boldgrid_component_page_title' => array(
			'js_control' => array(
				'icon' => $header_icons['wp_boldgrid_component_page_title'],
				'type' => 'header',
			),
		),
		'wp_boldgrid_component_site_title' => array(
			'js_control' => array(
				'icon' => $header_icons['wp_boldgrid_component_site_title'],
				'type' => 'header',
			),
		),
		'wp_boldgrid_component_site_description' => array(
			'js_control' => array(
				'icon' => $header_icons['wp_boldgrid_component_site_description'],
				'type' => 'header',
			),
		),
		'wp_boldgrid_component_logo' => array(
			'js_control' => array(
				'icon' => $header_icons['wp_boldgrid_component_logo'],
				'type' => 'header',
			),
		),
		/*
		 * This componenet is temporarily disabled until the rest of the
		 * post meta components are ready.
		 * 'wp_boldgrid_component_author_meta' => array(
		 *	'js_control' => array(
		 *		'icon' => '<span class="dashicons dashicons-admin-post"></span>',
		 *		'type' => 'header',
		 *	),
		 *),
		 */
		'wp_archives' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-archive"></span>'
			),
		),
		'wp_calendar' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-calendar-alt"></span>'
			),
		),
		'wp_categories' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-category"></span>'
			),
		),
		'wp_pages' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-admin-page"></span>'
			),
		),
		'wp_nav_menu' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-menu"></span>'
			),
		),
		'wp_meta' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-wordpress"></span>'
			),
		),
		'wp_recent-posts' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-admin-post"></span>'
			),
		),
		'wp_recent-comments' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-admin-comments"></span>'
			),
		),
		'wp_search' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-search"></span>'
			),
		),
		'wp_tag_cloud' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-tagcloud"></span>'
			),
		),
		'wp_rss' => array(
			'js_control' => array(
				'icon' => '<span class="dashicons dashicons-rss"></span>'
			),
		),
	),
);
