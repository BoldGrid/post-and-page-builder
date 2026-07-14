<?php
/**
 * URL validation helpers for outbound HTTP requests.
 *
 * DNS rebinding can bypass one-time resolution checks; operators should
 * restrict egress from the application tier to block RFC1918 destinations.
 *
 * @package Boldgrid_Editor
 */

/**
 * Outbound URL safety utilities.
 */
class Boldgrid_Editor_Url {

	/**
	 * Maximum redirect URLs processed per request.
	 */
	const MAX_REDIRECT_URLS = 10;

	/**
	 * Validate http/https scheme.
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_valid_http_scheme( $url ) {
		if ( ! is_string( $url ) || '' === $url ) {
			return false;
		}

		$scheme = wp_parse_url( $url, PHP_URL_SCHEME );

		return in_array( $scheme, array( 'http', 'https' ), true );
	}

	/**
	 * Classify an IP as publicly routable.
	 *
	 * @param string $ip IP address.
	 * @return bool
	 */
	public static function is_public_ip( $ip ) {
		if ( ! is_string( $ip ) || '' === $ip ) {
			return false;
		}

		if ( false !== stripos( $ip, '::ffff:' ) ) {
			$tail = substr( $ip, stripos( $ip, '::ffff:' ) + 7 );
			if ( false !== filter_var( $tail, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
				return self::is_public_ip( $tail );
			}
		}

		return false !== filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
		);
	}

	/**
	 * Validate that a URL targets a public host over http/https.
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_public_host( $url ) {
		if ( ! is_string( $url ) || '' === $url ) {
			return false;
		}

		if ( ! self::is_valid_http_scheme( $url ) ) {
			return false;
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return false;
		}

		if ( '[' === substr( $host, 0, 1 ) && ']' === substr( $host, -1 ) ) {
			$host = substr( $host, 1, -1 );
		}

		if ( false !== filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return self::is_public_ip( $host );
		}

		$ipv4_set = @gethostbynamel( $host );
		if ( false === $ipv4_set ) {
			$ipv4_set = array();
		}

		foreach ( $ipv4_set as $ip ) {
			if ( ! self::is_public_ip( $ip ) ) {
				return false;
			}
		}

		$ipv6_set = array();
		if ( function_exists( 'dns_get_record' ) ) {
			$aaaa = @dns_get_record( $host, DNS_AAAA );
			if ( is_array( $aaaa ) ) {
				foreach ( $aaaa as $rec ) {
					if ( isset( $rec['ipv6'] ) ) {
						$ipv6_set[] = $rec['ipv6'];
					}
				}
			}
		}

		foreach ( $ipv6_set as $ip ) {
			if ( ! self::is_public_ip( $ip ) ) {
				return false;
			}
		}

		if ( empty( $ipv4_set ) && empty( $ipv6_set ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Sanitize a remote http(s) URL and ensure it resolves publicly.
	 *
	 * @param string $url Raw URL.
	 * @return string|false
	 */
	public static function sanitize_http_url( $url ) {
		if ( ! is_string( $url ) || '' === trim( $url ) ) {
			return false;
		}

		$url = esc_url_raw( trim( $url ) );
		if ( empty( $url ) || ! self::is_public_host( $url ) ) {
			return false;
		}

		return $url;
	}

	/**
	 * Sanitize a reflected redirect Location header.
	 *
	 * @param string $location Location header value.
	 * @return string|false
	 */
	public static function sanitize_redirect_location( $location ) {
		if ( ! is_string( $location ) || '' === trim( $location ) ) {
			return false;
		}

		$location = esc_url_raw( trim( $location ) );

		return self::is_public_host( $location ) ? $location : false;
	}

	/**
	 * Download a public image without following redirects.
	 *
	 * @param string $url Remote image URL.
	 * @return string|WP_Error Temp file path.
	 */
	public static function fetch_public_image( $url ) {
		$url = self::sanitize_http_url( $url );
		if ( false === $url ) {
			return new WP_Error( 'private_host', 'URL points to a non-public host.' );
		}

		$response = wp_safe_remote_get(
			$url,
			array(
				'timeout'             => 30,
				'redirection'         => 0,
				'limit_response_size' => wp_max_upload_size(),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( $code < 200 || $code >= 300 ) {
			return new WP_Error( 'http_error', 'Unexpected response code.' );
		}

		$body = wp_remote_retrieve_body( $response );
		if ( ! is_string( $body ) || '' === $body ) {
			return new WP_Error( 'empty_body', 'Empty response body.' );
		}

		$tmp = wp_tempnam( 'boldgrid-remote-image' );
		if ( ! $tmp ) {
			return new WP_Error( 'temp_file', 'Unable to create temp file.' );
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		if ( false === file_put_contents( $tmp, $body ) ) {
			@unlink( $tmp );
			return new WP_Error( 'write_error', 'Unable to write temp file.' );
		}

		return $tmp;
	}
}
