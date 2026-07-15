<?php
/**
 * Nonce helpers for BoldGrid editor handlers.
 *
 * @package Boldgrid_Editor
 */

/**
 * Centralized nonce verification utilities.
 */
class Boldgrid_Editor_Nonce {

	/**
	 * Read a scalar nonce value from the current request.
	 *
	 * @param string $field Request field name.
	 * @return string
	 */
	public static function read_nonce( $field ) {
		if ( ! isset( $_REQUEST[ $field ] ) || ! is_scalar( $_REQUEST[ $field ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.MissingUnslash,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			return '';
		}

		return sanitize_text_field( wp_unslash( $_REQUEST[ $field ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	/**
	 * Verify an admin request nonce.
	 *
	 * @param string $action Nonce action.
	 * @param string $field  Request field name.
	 * @return bool
	 */
	public static function verify_admin_request( $action, $field ) {
		$nonce = self::read_nonce( $field );

		return '' !== $nonce && wp_verify_nonce( $nonce, $action );
	}

	/**
	 * Verify an AJAX nonce or terminate with 403.
	 *
	 * @param string $action Nonce action.
	 * @param string $field  Request field name.
	 */
	public static function verify_ajax_or_die( $action, $field ) {
		$nonce = self::read_nonce( $field );
		if ( '' === $nonce || ! wp_verify_nonce( $nonce, $action ) ) {
			wp_die( -1, 403 );
		}
	}
}
