<?php
/**
 * Class: Boldgrid_Editor_Unsplash
 *
 * Handles updating unsplash urls.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Ajax
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Unsplash
 *
 * Handles updating unsplash urls.
 *
 * @since 1.21.4
 */
class Boldgrid_Editor_Unsplash {

	public $old_hotlinks = array();

	public $new_hotlinks = array();

	public $render_args = array(
		'crop' => 'entropy',
		'cs'   => 'tinysrgb',
		'fit'  => 'crop',
		'fm'   => 'jpg',
		'q'    => '80',
	);

	public function __construct( $configs ) {
		$this->configs = $configs;
	}

	/**
	 * Handle hotlink update wp-admin ajax call.
	 *
	 * @since 1.21.4
	 */
	public function update_hotlinks_ajax() {
		check_ajax_referer( 'update_unsplash_hotlinks', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
			wp_die();
		}

		$this->find_all_hotlinks();

		$this->fetch_new_hotlinks();

		error_log( 'new_hotlinks: ' . json_encode( $this->new_hotlinks ) );

		$this->update_posts_content();

		$data = $this->generate_count_data();

		error_log( json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

		wp_send_json_success( $data );
	}

	/**
	 * Generate Count Data.
	 *
	 * @since 1.21.4
	 */
	public function generate_count_data() {
		$data = array(
			'old_hotlinks'    => 0,
			'new_hotlinks'    => 0,
			'failed_hotlinks' => array(),
		);

		foreach ( $this->old_hotlinks as $post_id => $hotlinks ) {
			foreach ( $hotlinks as $hotlink ) {
				$data['old_hotlinks']++;

				//error_log( json_encode( $this->new_hotlinks[ $post_id ][ $hotlink ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

				if ( isset( $this->new_hotlinks[ $post_id ][ $hotlink ] ) ) {
					$data['new_hotlinks']++;
				} else {
					$data['failed_hotlinks'][ $post_id ][] = $hotlink;
				}
			}
		}

		return $data;
	}

	/**
	 * Find all hotlinks.
	 *
	 * @since 1.21.4
	 */
	public function find_all_hotlinks() {
		$posts = get_posts();
		$pages = get_pages();
		$cphs  = get_posts(
			array(
				'post_type' => array(
					'post',
					'page',
					'crio_page_header',
				),
			)
		);

		$posts = array_merge( $posts, $pages, $cphs );

		foreach ( $posts as $post ) {
			$this->find_hotlinks( $post );
		}
	}

	/**
	 * Update Posts Content
	 * 
	 * @since 1.21.4
	 */
	public function update_posts_content() {
		foreach ( $this->new_hotlinks as $post_id => $urls ) {
			$post = get_post( $post_id );
			$content = $post->post_content;

			foreach ( $urls as $old_url => $new_url ) {
				$content = str_replace( $old_url, $new_url, $content );
			}

			wp_update_post(
				array(
					'ID'           => $post_id,
					'post_content' => $content,
				)
			);
		}
	}

	/**
	 * Fetch New Urls
	 *
	 * @since 1.21.4
	 */
	public function fetch_new_hotlinks() {
		foreach ( $this->old_hotlinks as $post_id => $hotlinks ) {
			foreach ( $hotlinks as $hotlink ) {
				$hotlink = trim( $hotlink, "'" );
				$new_url = $this->fetch_new_url( $hotlink );

				if ( false !== $new_url ) {
					$this->new_hotlinks[ $post_id ][ $hotlink ] = $new_url;
				}
			}
		}
	}

	/**
	 * Fetch New Url
	 *
	 * @since 1.21.4
	 */
	public function fetch_new_url( $hotlink ) {
		$photo_id = $this->id_from_url( $hotlink );
		$width    = $this->width_from_url( $hotlink );
		$height   = $this->height_from_url( $hotlink );

		$photo_url = $this->get_photo( $photo_id );

		error_log( 'photo_url: ' . json_encode( $photo_url ) );

		if ( false === $photo_url ) {
			return false;
		}

		$opt_render_args = array();

		if ( ! empty( $width ) ) {
			$opt_render_args['w'] = $width;
		}

		if ( ! empty( $height ) ) {
			$opt_render_args['h'] = $height;
		}

		$render_args = array_merge( $this->render_args, $opt_render_args );

		return add_query_arg( $render_args, $photo_url );
	}

	/**
	 * Get Photo
	 *
	 * @since 1.21.4
	 *
	 * @param string $photo_id photo id.
	 */
	public function get_photo( $photo_id ) {
		Unsplash\HttpClient::init(
			array(
				'applicationId' => 'si-UgMuma8gihc-v6RbCPOm3hpzpSRUHBAgIPwcpHXU',
				'secret'        => 'PNy2YJJ-vN30bgK9cPk14MuSClJKXvDn09NvA879tb4',
				'callbackUrl'   => 'https://your-application.com/oauth/callback',
				'utmSource'     => 'Post and Page Builder',
			)
		);

		try {
			$photo = Unsplash\Photo::find( $photo_id );
		} catch ( Exception $e ) {
			$photo = false;
		}

		if ( $photo ) {
			$url = $photo->urls['raw'];
			return $url;
		} else {
			return false;
		}
	}

	/**
	 * Get Id from URL.
	 *
	 * @since 1.21.4
	 *
	 * @param string $url
	 */
	public function id_from_url( $url ) {
		$parts = explode( '/', $url );

		return $parts[3];
	}

	/**
	 * Get Width from URL.
	 *
	 * @since 1.21.4
	 *
	 * @param string $url
	 */
	public function width_from_url( $url ) {
		$parts = explode( '/', $url );
		$width = false;

		if ( isset( $parts[4] ) ) {
			$w     = explode( 'x', $parts[4] );
			$width = isset( $w[0] ) ? $w[0] : false;
		} else {
			$width = false;
		}

		return $width;
	}

	/**
	 * Get Height from URL.
	 *
	 * @since 1.21.4
	 *
	 * @param string $url
	 */
	public function height_from_url( $url ) {
		$parts  = explode( '/', $url );
		$height = false;

		if ( isset( $parts[4] ) ) {
			$h     = explode( 'x', $parts[4] );
			$height = isset( $h[1] ) ? $h[1] : false;
		} else {
			$height = false;
		}

		return $height;

	}

	/**
	 * Find hotlinks.
	 *
	 * @since 1.21.4
	 *
	 * @param  object $post Post object.
	 */
	public function find_hotlinks( $post ) {
		$post_id = $post->ID;
		$content = $post->post_content;
		$matches = array();
		preg_match_all( "/'https:\/\/source\.unsplash\.com\/.*\/.*'/", $content, $matches );

		if ( ! empty( $matches[0] ) ) {
			$this->old_hotlinks[ $post_id ] = $matches[0];
		}
	}

}
