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

		// Sanitize to boolean.
		$draggable_enabled = ! empty( $_POST['draggable_enabled'] );
		set_theme_mod( 'boldgrid_draggable_enabled', $draggable_enabled );

		wp_die( 1 );
	}

	/**
	 * Generate gridblocks.
	 *
	 * @since 1.7.0
	 */
	public function generate_blocks() {
		$params = ! empty( $_POST ) ? $_POST : array();
		$params['color'] = ! empty( $params['color'] ) ? stripslashes( $params['color'] ) : null;

		self::validate_nonce( 'gridblock_save' );
		set_time_limit ( 45 );

		$times_requested = Boldgrid_Editor_Option::get( 'count_usage_blocks', 0 );

		// If the user has not yet reqyested gridblocks, return from our preset collection.
		$params['collection'] = ! $times_requested ? 1 : false;

		// Dont put the parameters in the body breaks wp version < 4.6.
		$api_response = wp_remote_get( self::get_end_point('gridblock_generate') . '?' . http_build_query( $params ), array(
			'timeout' => 30,
		) );

		if ( ! is_wp_error( $api_response ) ) {
			$header = 'License-Types';
			$response = wp_remote_retrieve_body( $api_response );
			$response = json_decode( $response, true );
			$response = $response ? $response : array();
			if ( ! empty( $response ) ) {
				$types = wp_remote_retrieve_header( $api_response, $header );
				$types = $types ? $types : '[]';
				header( "$header: " . $types );

				foreach( $response as &$block ) {
					$block['preview_html'] = Boldgrid_Layout::run_shortcodes( $block['html'] );
					$block['html'] = $block['html'];
				}

				// Count how many times blocks have been generated.
				Boldgrid_Editor_Option::update( 'count_usage_blocks', $times_requested + 1 );
				Boldgrid_Editor_Option::update( 'block_default_industry', $params['category'] );

				wp_send_json( $response );
			}
		}

		status_header( 500 );
		wp_send_json_error();
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
		return $config['asset_server'] . $config['ajax_calls'][ $key ];
	}

	/**
	 * Validate image nonce.
	 *
	 * @since 1.5
	 */
	public static function validate_nonce( $name ) {
		$nonce = ! empty( $_POST[ self::$nonces[ $name ] ] ) ?
			$_POST[ self::$nonces[ $name ] ] : null;

		$valid = wp_verify_nonce( $nonce, self::$nonces[ $name ] );

		if ( ! $valid ) {
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
		$urls = ! empty( $_POST['urls'] ) ? $_POST['urls'] : null;

		self::validate_nonce( 'image' );
		$unsplash_404 = 'https://images.unsplash.com/photo-1446704477871-62a4972035cd?fit=crop&fm=jpg&h=800&q=50&w=1200';

		$redirectUrls = array();
		foreach( $urls as $url ) {
			$response = wp_remote_head( $url );
			$headers = is_array( $response ) && ! empty( $response['headers'] ) ? $response['headers']->getAll() : array();
			$redirectUrl = ! empty( $headers['location'] ) ? $headers['location'] : false;
			$redirectUrl = ( $redirectUrl !== $unsplash_404 ) ? $redirectUrl : false;
			$redirectUrls[ $url ] = $redirectUrl;
		}

		if ( ! empty( $redirectUrls ) ) {
			wp_send_json_success( $redirectUrls );
		} else {
			status_header( 400 );
			wp_send_json_error();
		}
	}

	/**
	 * Save a users connect key in the database.
	 *
	 * @since 1.7.0
	 */
	public function save_key() {
		self::validate_nonce( 'gridblock_save' );

		$connectKey = ! empty( $_POST['connectKey'] ) ? sanitize_text_field( $_POST['connectKey'] ) : null;
		$connectKey = false === strpos( $connectKey, '-' ) ? $connectKey : md5( $connectKey );

		$api_response = wp_remote_get( self::get_end_point('gridblock_industries'), array(
			'timeout' => 10,
			'body' => array( 'key' => $connectKey ),
		) );

		$types = wp_remote_retrieve_header( $api_response, 'License-Types' );
		$types = $types ? $types : '[]';
		$types = json_decode( $types, true );
		$types = array_values( array_intersect( $types, array( 'basic', 'premium' ) ) );

		if ( ! empty( $types ) ) {

			// Set connect data.
			update_option( 'boldgrid_api_key', $connectKey );
			delete_transient( 'boldgrid_api_data' );
			delete_site_transient( 'boldgrid_api_data' );

			wp_send_json_success( array(
				'licenses' => $types,
				'key' => $connectKey,
			) );
		} else {
			status_header( 400 );
			wp_send_json_error();
		}
	}

	/**
	 * Save a Gridblock.
	 *
	 * @since 1.6
	 */
	public function save_gridblock() {
		$title = ! empty( $_POST['title'] ) ? sanitize_text_field( $_POST['title'] ) : null;
		$type = ! empty( $_POST['type'] ) ? sanitize_text_field( $_POST['type'] ) : null;
		$html = ! empty( $_POST['html'] ) ? $_POST['html'] : null;

		self::validate_nonce( 'gridblock_save' );

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
			status_header( 400 );
			wp_send_json_error();
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
		$image_data = ! empty( $_POST['image_data'] ) ? $_POST['image_data'] : null;

		self::validate_nonce( 'image' );

		if ( $this->is_base_64( $image_data ) ) {
			$response = $this->upload_encoded( $image_data );
		} else {
			$response = $this->upload_url( $image_data );
		}

		if ( ! empty( $response['success'] ) ) {
			unset( $response['success'] );
			wp_send_json_success( $response );
		} else {
			status_header( 400 );
			wp_send_json_error();
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
		preg_match ( '/^data/', $url, $matches );
		return ! empty( $matches[0] );
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

		$post_id = ! empty( $post->ID ) ? $post->ID : null;
		$attachment_id = media_sideload_image( $image_data . '&.png', $post_id, null, 'id' );

		$results = array();
		if ( ! is_object( $attachment_id ) ) {
			$results = array(
				'success' => true,
				'url' => wp_get_attachment_url( $attachment_id ),
				'attachment_id' => $attachment_id,
			);
		}

		return $results;
	}

	/**
	 * Save Image data to the media library.
	 *
	 * @since 1.2.3
	 *
	 * @param string $_POST['image_data'].
	 * @param integer $_POST['attachement_id'].
	 */
	public function upload_encoded( $image_data ) {
		$attachement_id = ! empty( $_POST['attachement_id'] ) ? (int) $_POST['attachement_id'] : null;

		// Validate nonce
		$valid = wp_verify_nonce( $_POST['boldgrid_gridblock_image_ajax_nonce'],
			'boldgrid_gridblock_image_ajax_nonce' );

		if ( false === $valid ) {
			wp_die( - 1 );
		}

		$original_attachment = ( array ) get_post ( $attachement_id );

		$pattern = '/^data:(.*?);base64,/';
		preg_match ( $pattern, $image_data, $matches );
		$image_data = preg_replace( $pattern, '', $image_data );
		$mimeType = ! empty( $matches[1] ) ? $matches[1] : 'image/png';
		$extension = explode( '/', $mimeType );
		$extension = ! empty( $extension[1] ) ? $extension[1] : 'png';

		$image_data = str_replace( ' ', '+', $image_data );
		$data = base64_decode( $image_data );

		$filename = uniqid() . '.' . $extension;
		$uploaded = wp_upload_bits( $filename, null, $data );

		$response = array( 'success' => false );
		if ( empty( $uploaded['error'] ) ) {

			// Retrieve the file type from the file name.
			$wp_filetype = wp_check_filetype( $uploaded['file'], null );

			// Generate the attachment data.
			unset( $original_attachment['ID'] );
			unset( $original_attachment['post_name'] );
			unset( $original_attachment['post_date'] );
			unset( $original_attachment['post_date_gmt'] );
			unset( $original_attachment['post_modified'] );
			unset( $original_attachment['post_modified_gmt'] );

			$attachment = array (
				'post_mime_type' => $wp_filetype['type'],
				'guid' => $uploaded['url'],
			);

			$attachment = array_merge( $original_attachment, $attachment );
			$post_parent = ! empty( $original_attachment['post_parent'] ) ? $original_attachment['post_parent'] : null;

			/*
			 * Insert the attachment into the media library.
			 * $attachment_id is the ID of the entry created in the wp_posts table.
			*/
			$attachment_id = wp_insert_attachment(
				$attachment,
				$uploaded['file'],
				$post_parent
			);

			if ( 0 != $attachment_id ) {
				$attach_data = wp_generate_attachment_metadata( $attachment_id, $uploaded['file'] );
				$result = wp_update_attachment_metadata( $attachment_id, $attach_data );

				$response = array(
					'success' => true,
					'attachment_id' => $attachment_id,
					'url' => $uploaded['url'],
					'images' => Boldgrid_Editor_Builder::get_post_images( $post_parent ),
				);
			}
		}

		return $response;
	}

}
