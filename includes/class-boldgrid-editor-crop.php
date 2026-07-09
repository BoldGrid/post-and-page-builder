<?php
/**
 * BoldGrid_Editor_Crop class
 *
 * The Post and Page Builder Crop class suggests users crop images when replacing
 * those of different aspect ratios.
 *
 * @package Boldgrid_Editor_Crop
 * @since 1.0.8
 */

/**
 * Post and Page Builder Crop.
 *
 * See file description above.
 *
 * @since 1.0.8
 */
class Boldgrid_Editor_Crop {

	/**
	 * Validate crop AJAX requests.
	 *
	 * @param int $attachment_id Attachment ID.
	 */
	private function validate_crop_request( $attachment_id ) {
		Boldgrid_Editor_Capability::require_cap( 'upload_files' );

		$attachment_id = (int) $attachment_id;
		if ( ! $attachment_id || ! current_user_can( 'edit_post', $attachment_id ) ) {
			wp_die( 0 );
		}
	}

	/**
	 * Admin footer.
	 *
	 * @since 1.0.8
	 */
	public function admin_footer() {
		require_once BOLDGRID_EDITOR_PATH . '/includes/template/crop.php';
	}

	/**
	 * Get all available sizes for an attachment id.
	 *
	 * @since 1.0.9
	 *
	 * @return array dimensions Example: http://pastebin.com/UamKiXS4.
	 */
	public function get_dimensions() {
		// Validate our attachment id.
		if ( empty( $_POST['attachment_id'] ) ) {
			wp_die( 0 );
		}

		$attachment_id = (int) $_POST['attachment_id'];
		$this->validate_crop_request( $attachment_id );

		// Validate our original image's width and height.
		if ( empty( $_POST['originalWidth'] ) || empty( $_POST['originalHeight'] ) ||
			 ! is_numeric( $_POST['originalWidth'] ) || ! is_numeric( $_POST['originalHeight'] ) ) {
			wp_die( 0 );
		} else {
			$original_orientation = $_POST['originalWidth'] / $_POST['originalHeight'];
		}

		/*
		 * Allowed "source image" sizes, defined in wp-includes/media.php (before filters applied).
		 *
		 * These are "allowed" so as to limit the choices of "source image" the user has. Other
		 * plugins may add to this list, cluttering the list the user chooses from, making the
		 * decision more complicated.
		 */
		$allowed_image_sizes = array( 'thumbnail', 'medium', 'medium_large', 'large' );

		$dimensions = wp_get_attachment_metadata( $attachment_id );

		// Validate our dimensions.
		if ( false === $dimensions ) {
			wp_die( 0 );
		}

		foreach ( $dimensions['sizes'] as $size => $size_array ) {
			// If this image size is not allowed, remove the image and continue.
			if( ! in_array( $size, $allowed_image_sizes ) ) {
				unset( $dimensions['sizes'][$size] );
				continue;
			}

			// Add the url to each size.
			$image_src = wp_get_attachment_image_src( $attachment_id, $size );
			$dimensions['sizes'][$size]['url'] = $image_src[0];

			// Clean up the size name, Replace dashes and underscroes with a space.
			$new_size = preg_replace( '/[-_]+/', ' ', $size );
			$new_size = ucwords( $new_size );
			$dimensions['sizes'][$new_size] = $dimensions['sizes'][$size];
			unset( $dimensions['sizes'][$size] );
		}

		// Add our original size to the dimensions as well.
		$dimensions['sizes']['Full Size'] = array (
			'file' => $dimensions['file'],
			'width' => $dimensions['width'],
			'height' => $dimensions['height'],
			'url' => wp_get_attachment_url( $attachment_id )
		);

		// Sort our dimensions.
		// Based on our original image's orientation, determine if the important
		// factor is width or height.
		$factor = ( $original_orientation >= 1 ? 'width' : 'height' );
		uasort( $dimensions['sizes'],
			function ( $a, $b ) use($factor ) {
				return $a[$factor] - $b[$factor];
			} );

		echo json_encode( $dimensions );

		wp_die();
	}

	/**
	 * Convert a url of an attachment / image to a path.
	 *
	 * We do this by converting the following:
	 * https://domain.com/wp-content/uploads/2016/01/image.jpg
	 * /home/user/public_html/wp-content/uploads/2016/01/image.jpg
	 *
	 * @param  string $url Example: https://domain.com/wp-content/uploads/2016/01/image.jpg
	 * @return mixed String on success, false on failure.
	 */
	public function url_to_path( $url ) {
		$uploads = wp_upload_dir();
		$basedir = $uploads['basedir'];
		$baseurl = $uploads['baseurl'];

		// 1) Make sure the URL actually lives under the uploads URL
		// Ensure $baseurl ends with a trailing slash for strict validation.
		$baseurl = rtrim( $baseurl, '/' ) . '/';
		if ( empty( $basedir ) || empty( $baseurl ) || strpos( $url, $baseurl ) !== 0 ) {
			return false;
		}

		// 2) Strip off the base URL, decode any encoded segments, and normalize slashes.
		$relative = urldecode( substr( $url, strlen( $baseurl ) ) );
		$relative = str_replace( array( '\\', '/' ), '/', ltrim( $relative, '/\\' ) );

		// 3) Collapse “.” and “..” path segments safely.
		$parts = array();
		foreach ( explode( '/', $relative ) as $segment ) {
			if ( '' === $segment || '.' === $segment ) {
				continue;
			}
			if ( '..' === $segment ) {
				// go up one directory (if possible)
				array_pop( $parts );
			} else {
				$parts[] = $segment;
			}
		}

		// 4) Recombine under the basedir.
		$full = $basedir . DIRECTORY_SEPARATOR . implode( DIRECTORY_SEPARATOR, $parts );

		// 5) (Optional) Resolve to a real path if the file exists,
		// and validate it still sits under the uploads folder
		$real = realpath( $full );
		if ( $real ) {
			// realpath returns canonical absolute path
			$full = $real;
		}

		// 6) Final safety check: must start with the uploads basedir
		if ( strpos( $full, $basedir . DIRECTORY_SEPARATOR ) !== 0 ) {
			return false;
		}

		return $full;
	}

	/**
	 * Crop an image.
	 *
	 * This method is called via an AJAX request.
	 *
	 * Example $_POST on a valid call: http://pastebin.com/YbZ12mLK.
	 *
	 * @since 1.0.8
	 */
	public function crop() {
		// Validate $_POST['id'], our attachment id.
		if ( empty( $_POST['id'] ) || ! is_numeric( $_POST['id'] ) ) {
			echo 'Error: Invalid attachment id.';
			wp_die();
		}

		$attachment_id = absint( $_POST['id'] );
		if ( ! $attachment_id ) {
			echo 'Error: Invalid attachment id.';
			wp_die();
		}

		$this->validate_crop_request( $attachment_id );

		// Validate $_POST['cropDetails'].
		if ( ! isset( $_POST['cropDetails'] ) || ! is_array( $_POST['cropDetails'] ) ) {
			echo 'Error: Invalid cropDetails.';
			wp_die();
		}

		$required_crop_keys = array( 'x1', 'y1', 'x2', 'y2' );
		foreach ( $required_crop_keys as $crop_key ) {
			if ( ! isset( $_POST['cropDetails'][ $crop_key ] ) ) {
				echo 'Error: Invalid cropDetails.';
				wp_die();
			}
		}

		// Get and validate our original image sizes before dimension checks.
		if ( empty( $_POST['originalWidth'] ) || empty( $_POST['originalHeight'] ) ||
			! is_numeric( $_POST['originalWidth'] ) || ! is_numeric( $_POST['originalHeight'] ) ) {
			echo 'Error: Missing original sizes.';
			wp_die();
		}

		$original_width  = absint( $_POST['originalWidth'] );
		$original_height = absint( $_POST['originalHeight'] );
		if ( ! $original_width || ! $original_height ) {
			echo 'Error: Missing original sizes.';
			wp_die();
		}

		$orientation = $original_width / $original_height;

		$max_width  = $original_width;
		$max_height = $original_height;
		$attachment_meta = wp_get_attachment_metadata( $attachment_id );
		if ( ! empty( $attachment_meta['width'] ) && ! empty( $attachment_meta['height'] ) ) {
			$max_width  = min( $max_width, absint( $attachment_meta['width'] ) );
			$max_height = min( $max_height, absint( $attachment_meta['height'] ) );
		}

		$max_absolute_dimension = 8192;
		$max_x                  = min( $max_width, $max_absolute_dimension );
		$max_y                  = min( $max_height, $max_absolute_dimension );

		// Validate crop coordinates are numeric, non-negative, and within source bounds.
		$crop_key_bounds = array(
			'x1' => $max_x,
			'x2' => $max_x,
			'y1' => $max_y,
			'y2' => $max_y,
		);
		foreach ( $required_crop_keys as $crop_key ) {
			$int = $_POST['cropDetails'][ $crop_key ];
			if ( ! is_numeric( $int ) || $int < 0 || (int) $int > $crop_key_bounds[ $crop_key ] ) {
				echo 'Error: Invalid cropDetail values.';
				wp_die();
			}
		}

		$crop_details = array(
			'x1' => absint( $_POST['cropDetails']['x1'] ),
			'y1' => absint( $_POST['cropDetails']['y1'] ),
			'x2' => absint( $_POST['cropDetails']['x2'] ),
			'y2' => absint( $_POST['cropDetails']['y2'] ),
		);

		// Validate $_POST['path'].
		if ( ! isset( $_POST['path'] ) ) {
			echo 'Error: path.';
			wp_die();
		} else {
			// Example $path: https://domain.com/wp-content/uploads/2016/01/image.jpg.
			$path = $_POST['path'];
		}

		$path_to_image = $this->url_to_path( $path );
		if( ! $path_to_image ) {
			wp_die( sprintf( 'Error. Unable to find path to image: "%1$s"', $path_to_image ) );
		}

		// @see https://codex.wordpress.org/Class_Reference/WP_Image_Editor.
		$new_image = wp_get_image_editor( $path_to_image );

		// Calculate new width / height based on coordinates.
		$new_width  = $crop_details['x2'] - $crop_details['x1'];
		$new_height = $crop_details['y2'] - $crop_details['y1'];

		if ( $new_width <= 0 || $new_height <= 0 ||
			$new_width > $max_width || $new_height > $max_height ||
			$new_width > $max_absolute_dimension || $new_height > $max_absolute_dimension ) {
			echo 'Error: Invalid cropDetail values.';
			wp_die();
		}

		// Crop the image.
		$successful_crop = $new_image->crop( $crop_details['x1'], $crop_details['y1'], $new_width,
			$new_height );

		// If we failed to crop the image, abort.
		if ( false === $successful_crop ) {
			echo 'Error: failed to crop image.';
			wp_die();
		}

		// Resize an image.
		// Scenario 1: If the orientation is landscape and our new image has a
		// greater width than the original.
		// Scenario 2: If the orientation is portrait and our new image height
		// is greater than our original.
		$resized = false;

		if ( $orientation >= 1 && $new_width > $original_width ) {
			$resized_width = $original_width;
			$resized_height = ( $new_height * $resized_width ) / $new_width;
			$new_image->resize( $resized_width, $resized_height );

			$resized = true;
		} elseif ( $orientation < 1 && $new_height > $original_height ) {
			$resized_height = $original_height;
			$resized_width = ( $new_width * $resized_height ) / $new_height;
			$new_image->resize( $resized_width, $resized_height );

			$resized = true;
		}

		if ( $resized ) {
			$new_width = $resized_width;
			$new_height = $resized_height;
		}

		// Example $new_image_path_parts: http://pastebin.com/b1477tYa.
		$path_parts = pathinfo( $path_to_image );

		// Example $new_image_basename = x1_y1_width_height_image.jpg.
		$new_image_basename = $crop_details['x1'] . '_' . $crop_details['y1'] . '_' . $new_width .
			 '_' . $new_height . '_' . $path_parts['basename'];

		// Example $new_image_path:
		// /home/user/public_html/wp-content/uploads/2016/01/x1_x2_width_height_image.jpg.
		$new_image_path = $path_parts['dirname'] . '/' . $new_image_basename;

		$new_image_url = str_replace( $path_parts['basename'], $new_image_basename, $path );

		// Example $successful_save: http://pastebin.com/e0Hvt8gq.
		$successful_save = $new_image->save( $new_image_path );

		// If we didn't save the new image successfully, abort.
		if ( is_wp_error( $successful_save ) ) {
			echo 'Error: unable to save cropped image.';
			wp_die();
		}

		// Get our new file's mime type.
		$filetype = wp_check_filetype( $new_image_path );

		// Add our new size to the attachment's metadata.
		$dimensions = wp_get_attachment_metadata( $attachment_id );

		$cropped = 0;
		foreach ( $dimensions['sizes'] as $key => $value ) {
			if ( strpos( $key, 'crop-' ) === 0 ) {
				$cropped ++;
			}
		}
		$crop_name = 'crop-' . ( $cropped + 1 );

		$dimensions['sizes'][$crop_name] = array (
			'file' => $new_image_basename,
			'width' => round( $new_width ),
			'height' => round( $new_height ),
			'mime-type' => $filetype['type']
		);
		wp_update_attachment_metadata( $attachment_id, $dimensions );

		if ( defined( 'BOLDGRID_BASE_DIR' ) ) {
			require_once BOLDGRID_BASE_DIR . '/includes/class-boldgrid-inspirations-asset-manager.php';
			$asset_manager = new Boldgrid_Inspirations_Asset_Manager();

			$asset = $asset_manager->get_asset(
				array(
					'by'            => 'attachment_id',
					'attachment_id' => $attachment_id,
				)
			);

			if ( false !== $asset ) {
				$crop_details['dst_width']  = $crop_details['width'];
				$crop_details['dst_height'] = $crop_details['height'];

				$asset['crops'][] = array(
					'cropDetails' => $crop_details,
					'path'        => $new_image_path,
				);

				// Update the asset.
				$asset_manager->update_asset(
					array(
						'task'       => 'update_entire_asset',
						'asset_id'   => $asset['asset_id'],
						'asset'      => $asset,
						'asset_type' => 'image',
					)
				);
			}
		}

		echo json_encode(
			array(
				'new_image_url'    => $new_image_url,
				'new_image_width'  => $new_width,
				'new_image_height' => $new_height,
			)
		);

		wp_die();
	}
}

?>
