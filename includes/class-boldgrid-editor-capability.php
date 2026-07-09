<?php
/**
 * Capability helpers for BoldGrid editor handlers.
 *
 * @package Boldgrid_Editor
 */

/**
 * Shared capability enforcement utilities.
 */
class Boldgrid_Editor_Capability {

	/**
	 * Deny an AJAX request with HTTP 403.
	 */
	public static function deny_ajax() {
		status_header( 403 );
		wp_send_json_error();
	}

	/**
	 * Require a capability or deny the AJAX request.
	 *
	 * @param string $cap Capability name.
	 */
	public static function require_cap( $cap ) {
		if ( ! current_user_can( $cap ) ) {
			self::deny_ajax();
		}
	}

	/**
	 * Grant bg_block capabilities to the administrator role.
	 */
	public static function assign_bg_block_caps() {
		if ( get_option( 'boldgrid_editor_bg_block_caps_assigned' ) ) {
			return;
		}

		$role = get_role( 'administrator' );
		if ( ! $role ) {
			return;
		}

		$caps = array(
			'edit_bg_block',
			'read_bg_block',
			'delete_bg_block',
			'edit_bg_blocks',
			'edit_others_bg_blocks',
			'publish_bg_blocks',
			'read_private_bg_blocks',
			'delete_bg_blocks',
			'delete_private_bg_blocks',
			'delete_published_bg_blocks',
			'delete_others_bg_blocks',
			'edit_private_bg_blocks',
			'edit_published_bg_blocks',
			'create_bg_blocks',
		);

		foreach ( $caps as $cap ) {
			$role->add_cap( $cap );
		}

		update_option( 'boldgrid_editor_bg_block_caps_assigned', true );
	}
}
