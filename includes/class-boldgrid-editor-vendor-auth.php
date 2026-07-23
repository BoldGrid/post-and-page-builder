<?php
/**
 * Vendor AJAX capability guards.
 *
 * @package Boldgrid_Editor
 */

/**
 * Harden BoldGrid Library AJAX handlers from the plugin layer.
 */
class Boldgrid_Editor_Vendor_Auth {

	/**
	 * Register early guards before vendor handlers run.
	 */
	public static function init() {
		add_action( 'wp_ajax_addKey', array( __CLASS__, 'guard_add_key' ), 0 );
		add_action( 'wp_ajax_dismissBoldgridNotice', array( __CLASS__, 'guard_dismiss_notice' ), 0 );
		add_action( 'wp_ajax_undismissBoldgridNotice', array( __CLASS__, 'guard_dismiss_notice' ), 0 );
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'restrict_news_widget' ), 100 );
	}

	/**
	 * Require manage_options before storing a Connect key.
	 */
	public static function guard_add_key() {
		if ( ! current_user_can( 'manage_options' ) ) {
			status_header( 403 );
			wp_send_json_error();
		}
	}

	/**
	 * Require a logged-in user before mutating notice dismissals.
	 */
	public static function guard_dismiss_notice() {
		if ( ! is_user_logged_in() ) {
			status_header( 403 );
			wp_die( 0 );
		}
	}

	/**
	 * Limit BoldGrid News dashboard widget to administrators.
	 */
	public static function restrict_news_widget() {
		if ( current_user_can( 'manage_options' ) ) {
			return;
		}

		remove_meta_box( 'boldgrid_news_widget', 'dashboard', 'normal' );
	}
}

Boldgrid_Editor_Vendor_Auth::init();
