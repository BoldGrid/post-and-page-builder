<?php
/**
 * Connect key and outbound secret handling hardening.
 *
 * @package Boldgrid_Editor
 */

/**
 * Secrets hardening for BoldGrid Connect Key flows.
 */
class Boldgrid_Editor_Secrets {

	/**
	 * Register security hooks.
	 *
	 * @since 1.27.11
	 */
	public static function init() {
		add_action( 'wp_ajax_addKey', array( __CLASS__, 'gate_add_key_ajax' ), 1 );
		add_filter( 'pre_http_request', array( __CLASS__, 'move_connect_key_to_header' ), 10, 3 );
	}

	/**
	 * Block non-administrators from the vendor addKey AJAX handler (rt10-3).
	 */
	public static function gate_add_key_ajax() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error(
				array(
					'message' => __( 'You do not have permission to perform this action.', 'boldgrid-editor' ),
				),
				403
			);
		}
	}

	/**
	 * Strip Connect key from BoldGrid news RSS URLs and send it as a header (rt10-26).
	 *
	 * @param false|array|WP_Error $preempt A preemptive return value.
	 * @param array                $args    Request arguments.
	 * @param string               $url     Request URL.
	 * @return false|array|WP_Error
	 */
	public static function move_connect_key_to_header( $preempt, $args, $url ) {
		if ( false !== $preempt ) {
			return $preempt;
		}

		$prepared = self::prepare_connect_key_request( $url, $args );
		if ( null === $prepared ) {
			return $preempt;
		}

		return wp_remote_request( $prepared['url'], $prepared['args'] );
	}

	/**
	 * Remove a Connect key from a BoldGrid news URL and attach it as a header.
	 *
	 * @param string $url  Request URL.
	 * @param array  $args Request arguments.
	 * @return array|null  Prepared request data or null when no key is present.
	 */
	public static function prepare_connect_key_request( $url, $args ) {
		if ( ! is_string( $url ) || false === strpos( $url, 'www.boldgrid.com/wp-json/wp/v2/posts' ) ) {
			return null;
		}

		$parsed = wp_parse_url( $url );
		if ( empty( $parsed['query'] ) ) {
			return null;
		}

		parse_str( $parsed['query'], $query_args );
		if ( empty( $query_args['key'] ) ) {
			return null;
		}

		$key = str_replace( array( "\r", "\n" ), '', (string) $query_args['key'] );
		unset( $query_args['key'] );

		$path = isset( $parsed['path'] ) ? $parsed['path'] : '/';
		$clean_url = 'https://www.boldgrid.com' . $path;
		if ( ! empty( $query_args ) ) {
			$clean_url .= '?' . http_build_query( $query_args );
		}

		$args = is_array( $args ) ? $args : array();
		$args['headers'] = isset( $args['headers'] ) && is_array( $args['headers'] ) ? $args['headers'] : array();
		$args['headers']['X-BoldGrid-Key'] = $key;

		return array(
			'url'  => $clean_url,
			'args' => $args,
		);
	}

	/**
	 * Return plugin config safe for the current user's JS context.
	 *
	 * @param array $config Plugin config array.
	 * @return array
	 */
	public static function get_public_plugin_configs( $config ) {
		if ( ! is_array( $config ) ) {
			return $config;
		}

		$public = $config;
		$public['has_connect_key'] = ! empty( $config['api_key'] );

		if ( ! current_user_can( 'manage_options' ) ) {
			unset( $public['api_key'] );
		}

		return $public;
	}

	/**
	 * Return boldgrid_settings safe for the current user's JS context.
	 *
	 * @param array $boldgrid_settings Stored boldgrid settings.
	 * @param array $config            Plugin config array.
	 * @return array
	 */
	public static function get_public_boldgrid_settings( $boldgrid_settings, $config ) {
		$settings = is_array( $boldgrid_settings ) ? $boldgrid_settings : array();
		$settings['has_connect_key'] = ! empty( $config['api_key'] );

		if ( current_user_can( 'manage_options' ) ) {
			$settings['api_key'] = $config['api_key'];
		} else {
			unset( $settings['api_key'] );
		}

		return $settings;
	}
}
