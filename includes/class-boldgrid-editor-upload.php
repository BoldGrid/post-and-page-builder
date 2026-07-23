<?php
/**
 * Safe image upload helpers for BoldGrid editor AJAX handlers.
 *
 * @package Boldgrid_Editor
 */

/**
 * Upload validation and processing utilities.
 */
class Boldgrid_Editor_Upload {

	/**
	 * Allowed raster image types for canvas uploads.
	 *
	 * @var array<string,string>
	 */
	private static $allowed_image_types = array(
		'image/png'  => 'png',
		'image/jpeg' => 'jpg',
		'image/gif'  => 'gif',
		'image/webp' => 'webp',
	);

	/**
	 * Require upload_files for media writes.
	 */
	public static function require_upload_capability() {
		if ( ! current_user_can( 'upload_files' ) ) {
			status_header( 403 );
			wp_send_json_error();
		}
	}

	/**
	 * Detect a strict base64-encoded image data URI.
	 *
	 * @param string $value Candidate payload.
	 * @return bool
	 */
	public static function is_base64_image( $value ) {
		if ( ! is_string( $value ) || '' === $value ) {
			return false;
		}

		return (bool) preg_match(
			'/^data:image\/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+\/=\r\n]+$/i',
			$value
		);
	}

	/**
	 * Parse a validated base64 image data URI.
	 *
	 * @param string $value Data URI.
	 * @return array|false
	 */
	public static function parse_base64_image( $value ) {
		if ( ! self::is_base64_image( $value ) ) {
			return false;
		}

		if ( ! preg_match( '/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/i', $value, $matches ) ) {
			return false;
		}

		$data = base64_decode( preg_replace( '/\s+/', '', $matches[2] ), true );
		if ( false === $data || '' === $data ) {
			return false;
		}

		return array(
			'data' => $data,
		);
	}

	/**
	 * Validate a remote image URL before fetch.
	 *
	 * @param string $url Remote URL.
	 * @return string|false
	 */
	public static function sanitize_remote_image_url( $url ) {
		$url = esc_url_raw( $url );
		if ( empty( $url ) || ! wp_http_validate_url( $url ) ) {
			return false;
		}

		$scheme = wp_parse_url( $url, PHP_URL_SCHEME );
		if ( ! in_array( $scheme, array( 'http', 'https' ), true ) ) {
			return false;
		}

		return $url;
	}

	/**
	 * Validate image bytes on disk and return the safe extension.
	 *
	 * @param string $file Absolute path to a temp file.
	 * @return array|WP_Error
	 */
	public static function validate_image_file( $file ) {
		if ( ! is_string( $file ) || ! file_exists( $file ) ) {
			return new WP_Error( 'invalid_file', 'Missing upload file.' );
		}

		$max_size = wp_max_upload_size();
		if ( $max_size > 0 && filesize( $file ) > $max_size ) {
			return new WP_Error( 'file_too_large', 'File exceeds maximum upload size.' );
		}

		if ( class_exists( 'finfo' ) ) {
			$finfo   = new finfo( FILEINFO_MIME_TYPE );
			$sniffed = $finfo->file( $file );
		} else {
			$sniffed = wp_get_image_mime( $file );
		}
		if ( empty( $sniffed ) || ! isset( self::$allowed_image_types[ $sniffed ] ) ) {
			return new WP_Error( 'invalid_type', 'Unsupported image type.' );
		}

		$dimensions = @getimagesize( $file );
		if ( false === $dimensions ) {
			return new WP_Error( 'invalid_image', 'File is not a valid raster image.' );
		}

		$extension = self::$allowed_image_types[ $sniffed ];
		$filename  = self::generate_secure_filename( $extension );
		$check     = wp_check_filetype_and_ext( $file, $filename );
		if ( empty( $check['ext'] ) || empty( $check['type'] ) || $check['type'] !== $sniffed ) {
			return new WP_Error( 'type_mismatch', 'Image contents do not match an allowed type.' );
		}

		if ( ! empty( $check['proper_filename'] ) ) {
			return new WP_Error( 'type_mismatch', 'Image extension mismatch.' );
		}

		$bytes = file_get_contents( $file );
		if ( false === $bytes ) {
			return new WP_Error( 'read_failed', 'Unable to read upload file.' );
		}
		if ( preg_match( '#<\?php|<\s*script|<\s*svg|<!ENTITY#i', $bytes ) ) {
			return new WP_Error( 'polyglot', 'Image contains disallowed embedded content.' );
		}

		return array(
			'ext'  => $extension,
			'mime' => $sniffed,
		);
	}

	/**
	 * Re-encode an image to strip trailing polyglot payloads.
	 *
	 * @param string $file Absolute path to temp file.
	 * @param string $mime Detected mime type.
	 * @return true|WP_Error
	 */
	public static function reencode_image_file( $file, $mime ) {
		$editor = wp_get_image_editor( $file );
		if ( is_wp_error( $editor ) ) {
			return $editor;
		}

		$saved = $editor->save( $file, $mime );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		return true;
	}

	/**
	 * Build an unpredictable filename for an allowed extension.
	 *
	 * @param string $extension File extension.
	 * @return string
	 */
	public static function generate_secure_filename( $extension ) {
		$uploads = wp_upload_dir();
		$basename = sanitize_file_name( wp_generate_password( 20, false ) . '.' . $extension );

		return wp_unique_filename( $uploads['path'], $basename );
	}

	/**
	 * Resolve a safe parent post ID from an optional source attachment.
	 *
	 * @param int $attachment_id Source attachment ID.
	 * @return int|null
	 */
	public static function get_safe_attachment_parent( $attachment_id ) {
		$attachment_id = (int) $attachment_id;
		if ( ! $attachment_id ) {
			return null;
		}

		$source = get_post( $attachment_id );
		if ( ! $source || 'attachment' !== $source->post_type ) {
			return null;
		}

		if ( ! current_user_can( 'edit_post', $attachment_id ) ) {
			return null;
		}

		return ! empty( $source->post_parent ) ? (int) $source->post_parent : null;
	}

	/**
	 * Store a validated temp image in the uploads directory and create an attachment.
	 *
	 * @param string   $file        Temp file path.
	 * @param array    $validation  Result from validate_image_file().
	 * @param int|null $post_parent Parent post ID.
	 * @return array
	 */
	public static function create_attachment_from_temp_file( $file, $validation, $post_parent = null ) {
		$reencoded = self::reencode_image_file( $file, $validation['mime'] );
		if ( is_wp_error( $reencoded ) ) {
			return array( 'success' => false );
		}

		$filename = self::generate_secure_filename( $validation['ext'] );
		$contents = file_get_contents( $file );
		if ( false === $contents ) {
			return array( 'success' => false );
		}

		$uploaded = wp_upload_bits( $filename, null, $contents );
		if ( ! empty( $uploaded['error'] ) ) {
			return array( 'success' => false );
		}

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => $validation['mime'],
				'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_author'    => get_current_user_id(),
			),
			$uploaded['file'],
			$post_parent
		);

		if ( ! $attachment_id || is_wp_error( $attachment_id ) ) {
			return array( 'success' => false );
		}

		$attach_data = wp_generate_attachment_metadata( $attachment_id, $uploaded['file'] );
		wp_update_attachment_metadata( $attachment_id, $attach_data );

		$response = array(
			'success'       => true,
			'attachment_id' => $attachment_id,
			'url'           => $uploaded['url'],
		);

		if ( is_int( $post_parent ) && null !== $post_parent ) {
			$response['images'] = Boldgrid_Editor_Builder::get_post_images( $post_parent );
		}

		return $response;
	}
}
