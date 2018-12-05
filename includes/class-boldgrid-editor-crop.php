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

		$attachment_id = $_POST['attachment_id'];

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
		$wp_upload_dir = wp_upload_dir();
		preg_match( '/(.*)wp-content\/uploads(.*)/', $url, $matches );

		if( empty( $wp_upload_dir['basedir'] ) || empty( $matches['2'] ) ) {
			return false;
		}

		return $wp_upload_dir['basedir'] . $matches['2'];
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
		} else {
			$attachment_id = $_POST['id'];
		}

		// Validate $_POST['cropDetails'].
		if ( ! isset( $_POST['cropDetails'] ) || ! is_array( $_POST['cropDetails'] ) ) {
			echo 'Error: Invalid cropDetails.';
			wp_die();
		}

		// Validate $_POST['cropDetails'], again. Make sure all the values are numbers and positive.
		foreach ( $_POST['cropDetails'] as $int ) {
			if ( ! is_numeric( $int ) || $int < 0 ) {
				echo 'Error: Invalid cropDetail values.';
				wp_die();
			}
		}

		// Example $crop_details: http://pastebin.com/yfkg9XCJ.
		$crop_details = $_POST['cropDetails'];

		// Validate $_POST['path'].
		if ( ! isset( $_POST['path'] ) ) {
			echo 'Error: path.';
			wp_die();
		} else {
			// Example $path: https://domain.com/wp-content/uploads/2016/01/image.jpg.
			$path = $_POST['path'];
		}

		// Get and validate our original image sizes.
		if ( empty( $_POST['originalWidth'] ) || empty( $_POST['originalHeight'] ) ) {
			echo 'Error: Missing original sizes.';
			wp_die();
		} else {
			$original_width = $_POST['originalWidth'];
			$original_height = $_POST['originalHeight'];
			$orientation = $original_width / $original_height;
		}

		$path_to_image = $this->url_to_path( $path );
		if( ! $path_to_image ) {
			wp_die( sprintf( 'Error. Unable to find path to image: "%1$s"', $path_to_image ) );
		}

		// @see https://codex.wordpress.org/Class_Reference/WP_Image_Editor.
		$new_image = wp_get_image_editor( $path_to_image );

		// Calculate new width / height based on coordinates.
		$new_width = $crop_details['x2'] - $crop_details['x1'];
		$new_height = $crop_details['y2'] - $crop_details['y1'];

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

		echo json_encode(
			array (
				'new_image_url' => $new_image_url,
				'new_image_width' => $new_width,
				'new_image_height' => $new_height
			) );

		wp_die();
	}
}

?>
