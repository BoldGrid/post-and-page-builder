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
	 * Grant bg_block capabilities to roles that previously managed blocks.
	 *
	 * Dedicated CPT caps replace the prior post-type defaults (edit_posts).
	 * Administrators and Editors retain access; Contributors and below do not.
	 *
	 * @since 1.27.12
	 */
	public static function assign_bg_block_caps() {
		// Versioned so upgrades can re-run when the role set changes.
		if ( '1.27.12' === get_option( 'boldgrid_editor_bg_block_caps_assigned' ) ) {
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

		foreach ( array( 'administrator', 'editor' ) as $role_name ) {
			$role = get_role( $role_name );
			if ( ! $role ) {
				continue;
			}

			foreach ( $caps as $cap ) {
				$role->add_cap( $cap );
			}
		}

		update_option( 'boldgrid_editor_bg_block_caps_assigned', '1.27.12' );
	}
}
