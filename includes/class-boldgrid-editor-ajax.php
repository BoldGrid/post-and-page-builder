<?php
/**
 * Class: Boldgrid_Editor_Ajax
 *
 * Ajax calls used in the plugin.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Ajax
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Ajax
 *
 * Ajax calls used in the plugin.
 *
 * @since      1.2
 */
class Boldgrid_Editor_Ajax {

	/**
	 * Whether Gridblock KSES filters have been registered.
	 *
	 * @since 1.27.11
	 *
	 * @var bool
	 */
	private static $gridblock_kses_filters_registered = false;

	/**
	 * List of nonces.
	 *
	 * @since 1.6
	 *
	 * @var array
	 */
	protected static $nonces = array(
		'image' => 'boldgrid_gridblock_image_ajax_nonce',
		'setup' => 'boldgrid_editor_setup',
		'gridblock_save' => 'boldgrid_editor_gridblock_save',
	);

	/**
	 * Saves the state of the drag and drop editor feature.
	 * Ajax Action: wp_ajax_boldgrid_draggable_enabled.
	 *
	 * @since 1.0.9
	 */
	public function ajax_draggable_enabled () {
		check_ajax_referer( 'boldgrid_draggable_enable', 'security' );

		Boldgrid_Editor_Capability::require_cap( 'edit_theme_options' );

		// Sanitize to boolean.
		$draggable_enabled = ! empty( $_POST['draggable_enabled'] );
		set_theme_mod( 'boldgrid_draggable_enabled', $draggable_enabled );

		wp_die( 1 );
	}

	/**
	 * Sanitizes the Gridblock HTML using wp_kses_post.
	 *
	 * @param string $html the gridblock's HTML
	 * @return string sanitized HTML
	 */
	public function sanitize_gridblock_html( $html ) {
		$this->register_gridblock_kses_filters();

		$pattern = $pattern = [
			'/\s*:\s*/',     // Matches and removes spaces around colons
			'/\s*;\s*/',     // Matches and removes spaces around semicolons
			'/;\s*(["\>])/'  // Matches semicolons followed by space and either a quote or a closing tag and removes the semicolon
		];
		$replacement = [
			':',     // Replace spaces around colon with just a colon
			';',     // Replace spaces around semicolon with just a semicolon
			'$1'     // Remove the semicolon at the end of declarations
		];
		$html = preg_replace( $pattern, $replacement, $html );
		return wp_kses_post( $html );
	}

	/**
	 * Register Gridblock KSES filters once to avoid stacking duplicates.
	 *
	 * @since 1.27.11
	 */
	private function register_gridblock_kses_filters() {
		if ( self::$gridblock_kses_filters_registered ) {
			return;
		}

		add_filter( 'wp_kses_allowed_html', array( $this, 'filter_gridblock_kses_allowed_html' ), 10, 2 );
		add_filter( 'safe_style_css', array( $this, 'filter_gridblock_safe_style_css' ) );

		self::$gridblock_kses_filters_registered = true;
	}

	/**
	 * Allow additional HTML tags/attributes for Gridblock content.
	 *
	 * @since 1.27.11
	 *
	 * @param array  $tags    Allowed HTML tags.
	 * @param string $context KSES context.
	 * @return array
	 */
	public function filter_gridblock_kses_allowed_html( $tags, $context ) {
		if ( 'post' !== $context ) {
			return $tags;
		}

		for ( $i = 1; $i <= 6; $i++ ) {
			$tags[ 'h' . $i ]['text-milestone'] = true;
		}

		$tags['p']['text-milestone'] = true;

		$tags['a']['shape'] = true;
		$tags['a']['tabindex'] = true;

		$tags['div']['gb-background-image'] = 'url(*)';
		$tags['iframe'] = array(
			'src' => true,
			'width' => true,
			'height' => true,
			'frameborder' => true,
			'allowfullscreen' => true,
			'style' => true,
		);

		return $tags;
	}

	/**
	 * Disable safe style CSS checks for Gridblock content.
	 *
	 * @since 1.27.11
	 *
	 * @param array $styles Allowed CSS properties.
	 * @return array
	 */
	public function filter_gridblock_safe_style_css( $styles ) {
		return array();
	}

	/**
	 * Parse and allowlist License-Types from an upstream BoldGrid API response.
	 *
	 * @since 1.27.11
	 *
	 * @param array|WP_Error $api_response Remote HTTP response.
	 * @return array Allowed license type slugs.
	 */
	private function get_allowed_license_types( $api_response ) {
		$allowed_slugs = array( 'basic', 'premium' );
		$raw           = wp_remote_retrieve_header( $api_response, 'License-Types' );

		if ( is_array( $raw ) ) {
			$raw = ! empty( $raw ) ? reset( $raw ) : '';
		}

		if ( ! is_string( $raw ) || '' === $raw ) {
			return array();
		}

		$types = json_decode( $raw, true );
		if ( ! is_array( $types ) ) {
			return array();
		}

		$sanitized = array();
		foreach ( $types as $type ) {
			if ( is_string( $type ) ) {
				$sanitized[] = sanitize_key( $type );
			}
		}

		return array_values( array_intersect( $sanitized, $allowed_slugs ) );
	}

	/**
	 * Generate gridblocks.
	 *
	 * @since 1.7.0
	 */
	public function generate_blocks() {
		self::validate_nonce( 'gridblock_save' );

		$params = array(
			'category' => ! empty( $_POST['category'] ) && is_scalar( $_POST['category'] )
				? sanitize_key( wp_unslash( $_POST['category'] ) ) : '',
			'color'    => ! empty( $_POST['color'] ) && is_scalar( $_POST['color'] )
				? sanitize_text_field( wp_unslash( $_POST['color'] ) ) : null,
		);

		set_time_limit ( 45 );

		$times_requested = Boldgrid_Editor_Option::get( 'count_usage_blocks', 0 );

		// If the user has not yet reqyested gridblocks, return from our preset collection.
		$params['collection'] = ! $times_requested ? 1 : false;

		// Dont put the parameters in the body breaks wp version < 4.6.
		$endpoint = self::get_end_point( 'gridblock_generate' );
		if ( empty( $endpoint ) ) {
			wp_send_json_error( null, 500 );
		}

		$api_response = wp_remote_get( $endpoint . '?' . http_build_query( $params ), array(
			'timeout' => 30,
		) );

		if ( ! is_wp_error( $api_response ) ) {
			$response = wp_remote_retrieve_body( $api_response );
			$response = json_decode( $response, true );
			$response = $response ? $response : array();
			if ( ! empty( $response ) ) {
				$license_types = $this->get_allowed_license_types( $api_response );
				header( 'License-Types: ' . wp_json_encode( $license_types ) );

				foreach( $response as &$block ) {
					$block['preview_html'] = $this->sanitize_gridblock_html(
						Boldgrid_Layout::run_shortcodes( $block['html'] )
					);
					$block['html'] = $block['html'];
					$block['html'] = $this->sanitize_gridblock_html( $block['html'] );
				}

				// Count how many times blocks have been generated.
				Boldgrid_Editor_Option::update( 'count_usage_blocks', $times_requested + 1 );
				if ( current_user_can( 'manage_options' ) && '' !== $params['category'] ) {
					Boldgrid_Editor_Option::update( 'block_default_industry', $params['category'] );
				}

				wp_send_json( $response );
			}
		}

		wp_send_json_error( null, 500 );
	}

	/**
	 * Get saved blocks. Used by GridBlock preview screen display display library blocks.
	 *
	 * @since 1.7.0
	 */
	public function get_saved_blocks() {
		self::validate_nonce( 'gridblock_save' );

		wp_send_json( Boldgrid_Layout::get_all_gridblocks() );
	}

	/**
	 * Get a full Url to an end point.
	 *
	 * @since 1.7.0
	 *
	 * @param  string $key Key.
	 * @return string      URl.
	 */
	public static function get_end_point( $key ) {
		$config = Boldgrid_Editor_Service::get( 'config' );
		$base   = ! empty( $config['asset_server'] ) ? $config['asset_server'] : '';
		$host   = wp_parse_url( $base, PHP_URL_HOST );

		$allowed_hosts = array(
			'wp-assets.boldgrid.com',
			'wp-assets-dev.boldgrid.com',
		);

		if ( empty( $host ) || ! in_array( $host, $allowed_hosts, true ) ) {
			return '';
		}

		if ( empty( $config['ajax_calls'][ $key ] ) ) {
			return '';
		}

		return untrailingslashit( $base ) . $config['ajax_calls'][ $key ];
	}

	/**
	 * Validate a named AJAX nonce and capability.
	 *
	 * @since 1.5
	 *
	 * @param string $name       Nonce key from self::$nonces.
	 * @param string $capability Required capability. Default 'edit_posts'.
	 */
	public static function validate_nonce( $name, $capability = 'edit_posts' ) {
		$nonce_field = self::$nonces[ $name ];
		$nonce       = null;
		if ( ! empty( $_POST[ $nonce_field ] ) && is_scalar( $_POST[ $nonce_field ] ) ) {
			$nonce = sanitize_text_field( wp_unslash( $_POST[ $nonce_field ] ) );
		}

		$valid          = wp_verify_nonce( $nonce, $nonce_field );
		$valid_referrer = check_ajax_referer( $nonce_field, $nonce_field, false );

		if ( ! $valid || ! $valid_referrer || ! current_user_can( $capability ) ) {
			status_header( 401 );
			wp_send_json_error();
		}
	}

	/**
	 * Get a redirect url. Used for unsplash images.
	 *
	 * @since 1.5
	 */
	public function get_redirect_url() {
		self::validate_nonce( 'image' );

		if ( empty( $_POST['urls'] ) || ! is_array( $_POST['urls'] ) ) {
			status_header( 400 );
			wp_send_json_error();
		}

		$urls         = array_slice( array_values( wp_unslash( $_POST['urls'] ) ), 0, Boldgrid_Editor_Url::MAX_REDIRECT_URLS );
		$unsplash_404 = 'https://images.unsplash.com/photo-1446704477871-62a4972035cd?fit=crop&fm=jpg&h=800&q=50&w=1200';
		$redirectUrls = array();

		foreach ( $urls as $raw_url ) {
			if ( ! is_string( $raw_url ) || '' === trim( $raw_url ) ) {
				continue;
			}

			$key = trim( $raw_url );
			$url = esc_url_raw( $key );
			if ( empty( $url ) || ! Boldgrid_Editor_Url::is_public_host( $url ) ) {
				$redirectUrls[ $key ] = false;
				continue;
			}

			$response = wp_safe_remote_head(
				$url,
				array(
					'timeout'     => 5,
					'redirection' => 0,
				)
			);

			$redirectUrl = false;
			if ( ! is_wp_error( $response ) && ! empty( $response['headers']['location'] ) ) {
				$candidate = $response['headers']['location'];
				if ( is_array( $candidate ) ) {
					$candidate = reset( $candidate );
				}

				$candidate = Boldgrid_Editor_Url::sanitize_redirect_location( $candidate );
				if ( $candidate && $candidate !== $unsplash_404 ) {
					$redirectUrl = $candidate;
				}
			}

			$redirectUrls[ $key ] = $redirectUrl;
		}

		if ( ! empty( $redirectUrls ) ) {
			wp_send_json_success( $redirectUrls );
		}

		wp_send_json_error( null, 400 );
	}

	/**
	 * Save a users connect key in the database.
	 *
	 * @since 1.7.0
	 */
	public function save_key() {
		self::validate_nonce( 'gridblock_save' );

		// Require administrator privileges to update site-wide Connect key.
		if ( ! current_user_can( 'manage_options' ) ) {
			status_header( 403 );
			wp_send_json_error();
		}

		$password = ! empty( $_POST['password'] ) ? (string) wp_unslash( $_POST['password'] ) : '';
		$user = wp_get_current_user();
		if ( ! $user || ! $user->exists() || ! wp_check_password( $password, $user->user_pass, $user->ID ) ) {
			status_header( 403 );
			wp_send_json_error(
				array(
					'message' => __( 'Password confirmation is required to update the Connect Key.', 'boldgrid-editor' ),
				)
			);
		}

		$connectKey = ! empty( $_POST['connectKey'] ) ? sanitize_text_field( wp_unslash( $_POST['connectKey'] ) ) : null;

		if ( empty( $connectKey ) ) {
			status_header( 400 );
			wp_send_json_error();
		}

		$endpoint = self::get_end_point( 'gridblock_industries' );
		if ( empty( $endpoint ) ) {
			wp_send_json_error( null, 500 );
		}

		$api_response = wp_remote_get( $endpoint, array(
			'timeout' => 10,
			'body' => array( 'key' => $connectKey ),
		) );

		$types = $this->get_allowed_license_types( $api_response );

		if ( ! empty( $types ) ) {

			// Set connect data.
			update_option( 'boldgrid_api_key', $connectKey );
			delete_transient( 'boldgrid_api_data' );
			delete_site_transient( 'boldgrid_api_data' );

			wp_send_json_success( array(
				'licenses' => $types,
				'has_connect_key' => true,
			) );
		} else {
			wp_send_json_error( null, 400 );
		}
	}

	/**
	 * Save a Gridblock.
	 *
	 * @since 1.6
	 */
	public function save_gridblock() {
		$title = ! empty( $_POST['title'] ) && is_scalar( $_POST['title'] )
			? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : null;
		$type  = ! empty( $_POST['type'] ) && is_scalar( $_POST['type'] )
			? sanitize_text_field( wp_unslash( $_POST['type'] ) ) : null;
		$html  = ! empty( $_POST['html'] ) ? wp_unslash( $_POST['html'] ) : '';
		if ( ! is_string( $html ) ) {
			$html = '';
		}

		self::validate_nonce( 'gridblock_save' );
		Boldgrid_Editor_Capability::require_cap( 'publish_bg_blocks' );

		$html = $this->sanitize_gridblock_html( $html );

		$post_id = wp_insert_post( array(
			'post_title' => $title,
			'post_content' => $html,
			'post_type' => 'bg_block',
			'post_status' => 'publish',
		) );

		if ( ! empty( $type ) && ! empty( $post_id ) ) {
			$output = wp_set_post_terms( $post_id, array( $type ), 'bg_block_type' );
		}

		Boldgrid_Editor_Service::get( 'rating' )->record( 'block_save' );

		if ( ! empty( $post_id ) ) {
			wp_send_json_success( get_post( $post_id ) );
		} else {
			wp_send_json_error( null, 400 );
		}
	}

	/**
	 * Ajax Call upload image.
	 *
	 * Works with base64 encoded image or a url.
	 *
	 * @since 1.5
	 */
	public function upload_image_ajax() {
		$response = array();
		$image_data = ! empty( $_POST['image_data'] ) ? wp_unslash( $_POST['image_data'] ) : null;

		self::validate_nonce( 'image' );
		Boldgrid_Editor_Upload::require_upload_capability();

		if ( Boldgrid_Editor_Upload::is_base64_image( $image_data ) ) {
			$response = $this->upload_encoded( $image_data );
		} else {
			$response = $this->upload_url( $image_data );
		}

		if ( ! empty( $response['success'] ) ) {
			unset( $response['success'] );
			wp_send_json_success( $response );
		} else {
			wp_send_json_error( null, 400 );
		}
	}

	/**
	 * Check if a given image src is a base 64 representation.
	 *
	 * @since 1.5
	 *
	 * @param  string  $url Image src.
	 * @return boolean      Whether or not the image is encoded.
	 */
	public function is_base_64( $url ) {
		return Boldgrid_Editor_Upload::is_base64_image( $url );
	}

	/**
	 * Given a URL, attach the image to the current post.
	 *
	 * @since 1.5
	 *
	 * @param  string $image_data URL to the remote image.
	 * @return array              Results of the upload.
	 */
	public function upload_url( $image_data ) {
		global $post;

		if ( ! is_string( $image_data ) || '' === trim( $image_data ) ) {
			return array( 'success' => false );
		}

		$tmp = Boldgrid_Editor_Url::fetch_public_image( $image_data );
		if ( is_wp_error( $tmp ) ) {
			return array( 'success' => false );
		}

		$validation = Boldgrid_Editor_Upload::validate_image_file( $tmp );
		if ( is_wp_error( $validation ) ) {
			@unlink( $tmp );
			return array( 'success' => false );
		}

		$post_id = ! empty( $post->ID ) ? (int) $post->ID : null;
		$result  = Boldgrid_Editor_Upload::create_attachment_from_temp_file( $tmp, $validation, $post_id );

		@unlink( $tmp );

		return $result;
	}

	/**
	 * Save Image data to the media library.
	 *
	 * @since 1.2.3
	 *
	 * @param string $image_data Base64 image payload.
	 */
	public function upload_encoded( $image_data ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$parsed = Boldgrid_Editor_Upload::parse_base64_image( $image_data );
		if ( false === $parsed ) {
			return array( 'success' => false );
		}

		$tmp = wp_tempnam( 'boldgrid-canvas-image' );
		if ( ! $tmp ) {
			return array( 'success' => false );
		}

		if ( false === file_put_contents( $tmp, $parsed['data'] ) ) {
			@unlink( $tmp );
			return array( 'success' => false );
		}

		$validation = Boldgrid_Editor_Upload::validate_image_file( $tmp );
		if ( is_wp_error( $validation ) ) {
			@unlink( $tmp );
			return array( 'success' => false );
		}

		$source_attachment_id = ! empty( $_POST['attachement_id'] ) ? (int) $_POST['attachement_id'] : 0;
		$post_parent = Boldgrid_Editor_Upload::get_safe_attachment_parent( $source_attachment_id );

		$result = Boldgrid_Editor_Upload::create_attachment_from_temp_file( $tmp, $validation, $post_parent );
		@unlink( $tmp );

		return $result;
	}

}
