<?php
/**
 * Class: Boldgrid_Editor_Builder
 *
 * Add functionality for fully customizable editor pages.
 *
 * @since      1.2
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Builder
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Builder
 *
 * Add functionality for fully customizable editor pages.
 *
 * @since      1.2
 */
class Boldgrid_Editor_Builder {

	/**
	 * Check if we have already recorded the feedback on this page load.
	 *
	 * @since 1.5
	 *
	 * @var boolean
	 */
	protected $has_recorded_feedback = false;

	/**
	 * Enqueue Styles in media buttons hook order. Ensures correct load order.
	 *
	 * @since 1.2.3
	 */
	public function enqueue_styles() {
		wp_enqueue_style( 'genericons-imhwpb' );
		wp_enqueue_style( 'font-awesome' );
	}

	/**
	 * Add Editor Help Tab.
	 *
	 * @since 1.2.3
	 */
	public function add_help_tab() {
		$fs = Boldgrid_Editor_Service::get( 'file_system' )->get_wp_filesystem();

		$screen = get_current_screen();
		$screen->add_help_tab( array(
			'id'       => 'boldgrid-editor',
			'title'    => __( 'Post and Page Builder' ),
			'content'  => $fs->get_contents( BOLDGRID_EDITOR_PATH . '/pages/help-tab.html' ),
		) );
	}

	/**
	 * Determine if we need to enqueue button.min.css.
	 *
	 * @since 1.6
	 *
	 * @return boolean True if we must enqueue old buttons file.
	 */
	public function requires_deprecated_buttons() {
		$requires_deprecated_buttons = false;
		$builder_styles = new Boldgrid_Editor_Builder_Styles();
		$has_saved_buttons = $builder_styles->has_custom_style( 'bg-controls-colors' );

		if ( ! Boldgrid_Editor_Service::get('main')->get_is_boldgrid_theme() || ! Boldgrid_Editor_Theme::has_feature( 'button-lib' ) ) {
			if ( ! $has_saved_buttons && Boldgrid_Editor_Version::is_activated_version_older_than('1.5.1') ) {
				$requires_deprecated_buttons = true;
			}
		}

		return $requires_deprecated_buttons;
	}

	/**
	 * Get configuration to be used in the page styler.
	 *
	 * @since 1.2.3
	 *
	 * @return array Configs for the styler.
	 */
	public static function get_builder_config() {
		$fs = Boldgrid_Editor_Service::get( 'file_system' )->get_wp_filesystem();
		$fonts = new Boldgrid_Editor_Builder_Fonts();
		$builder_components = new Boldgrid_Editor_Builder_Components();


		$builder_configs = json_decode( $fs->get_contents( BOLDGRID_EDITOR_PATH . '/assets/json/builder.json' ), true );
		$builder_configs['theme_fonts'] = $fonts->get_theme_fonts();
		$builder_configs['theme_features'] = self::get_theme_features();
		$builder_configs['components_used'] = $builder_components->get_components();
		$builder_configs['theme_buttons'] = self::get_theme_buttons();

		$builder_configs = self::remove_duplicate_fonts( $builder_configs );

		return $builder_configs;
	}

	/**
	 * Remove theme fonts from the my fonts array.
	 *
	 * @since 1.2.7
	 *
	 * @param array $builder_configs Collective configs to pass to JS.
	 *
	 * @return array $builder_config.
	 */
	public static function remove_duplicate_fonts( $builder_configs ) {

		if ( ! empty( $builder_configs['components_used'] ) ) {
			$builder_configs['components_used']['font'] = array_diff(
				$builder_configs['components_used']['font'],
				$builder_configs['theme_fonts']
			);
		}

		return $builder_configs;
	}

	/**
	 * Get a list of button classes used by the theme.
	 *
	 * @global array $boldgrid_theme_framework.
	 *
	 * @since 1.2.5
	 *
	 * @return array $button classes.
	 */
	public static function get_theme_buttons() {
		global $boldgrid_theme_framework;

		if ( empty( $boldgrid_theme_framework ) ) {
			return array();
		}

		$configs = $boldgrid_theme_framework->get_configs();

		$button_vars = ! empty( $configs['components']['buttons']['variables'] ) ?
			$configs['components']['buttons']['variables'] : array();

		$button_primary_classes = ! empty( $button_vars['button-primary-classes'] ) ?
			$button_vars['button-primary-classes'] : 'button-primary button-overrides';
		$button_secondary_classes = ! empty( $button_vars['button-secondary-classes'] ) ?
			$button_vars['button-secondary-classes'] : 'button-secondary button-overrides';

		$regex_string = '(\.|,)';
		$button_primary_classes = preg_replace( $regex_string, '', $button_primary_classes );
		$button_secondary_classes = preg_replace( $regex_string, '', $button_secondary_classes );

		return array(
			'primary' => $button_primary_classes,
			'secondary' => $button_secondary_classes,
		);
	}

	/**
	 * Get a list of supported theme features.
	 *
	 * @global array $boldgrid_theme_framework.
	 *
	 * @since 1.2.5
	 *
	 * @return array $supported_features.
	 */
	public static function get_theme_features() {
		global $boldgrid_theme_framework;

		if ( empty( $boldgrid_theme_framework ) ) {
			return array();
		}

		$configs = $boldgrid_theme_framework->get_configs();
		$supported_features = ! empty( $configs['supported-features'] ) ?
			$configs['supported-features'] : array();

		/*
		 * supported-features was added after support for variable containers.
		 * for the period between 1.2 and 1.3 this conditional should trigger, overriding
		 * supported features to add 1 more entry.
		 */
		if ( false === array_search( 'variable-containers', $supported_features ) ) {
			if ( isset( $configs['template']['pages'] ) ) {
				$supported_features[] = 'variable-containers';
			}
		}

		return $supported_features;
	}

	/**
	 * Print templates used in page and post editor.
	 *
	 * @since 1.2.3
	 */
	public function print_scripts() {
		$template_path = BOLDGRID_EDITOR_PATH . '/includes/template';
		$paths = array();

		$paths[] = $template_path . '/button.php';
		$paths[] = $template_path . '/image.php';
		$paths[] = $template_path . '/image-filter.php';
		$paths[] = $template_path . '/color.php';
		$paths[] = $template_path . '/hr.php';
		$paths[] = $template_path . '/gridblock.php';
		$paths[] = $template_path . '/information.php';
		$paths[] = $template_path . '/background.php';
		$paths[] = $template_path . '/box.php';
		$paths[] = $template_path . '/panel.php';
		$paths[] = $template_path . '/upgrade-notice.php';
		$paths[] = $template_path . '/icon.php';
		$paths[] = $template_path . '/generic-controls.php';

		foreach ( $paths as $path ) {
			include $path;
		}
	}

	/**
	 * Get all patterns to be used by tool.
	 *
	 * @since 1.2.3
	 *
	 * @return array Pattern image data.
	 */
	public static function get_patterns() {
		$patterns = scandir( BOLDGRID_EDITOR_PATH . '/assets/image/patterns' );
		$patterns = array_diff( $patterns, array( '..', '.' ) );

		$pattern_data = array();
		foreach ( $patterns as $pattern ) {
			$pattern_data[] = plugins_url( '/assets/image/patterns/' .
			$pattern, BOLDGRID_EDITOR_PATH . '/boldgrid-editor.php');
		}

		return $pattern_data;
	}

	/**
	 * Get all prestes for background data.
	 *
	 * @since 1.2.3
	 *
	 * @return array Configurations.
	 */
	public static function get_background_data() {
		// Grab the first 20 gradients.
		$fs = Boldgrid_Editor_Service::get( 'file_system' )->get_wp_filesystem();

		return array(
			'color' => array(),
			'image' => json_decode( $fs->get_contents( BOLDGRID_EDITOR_PATH . '/assets/json/sample-images.json' ) ),
			'pattern' => self::get_patterns(),
			// 'default_gradients' =>  json_decode( $fs->get_contents( BOLDGRID_EDITOR_PATH . '/assets/json/gradients.json' ) ),
			'gradients' => json_decode( $fs->get_contents( BOLDGRID_EDITOR_PATH . '/assets/json/preset-gradients.json' ) ) ?: [],
		);
	}

	/**
	 * Get images used on the current post.
	 *
	 * @since 1.2.3
	 *
	 * @param integer $post_id Post Id.
	 *
	 * @return array $image_lookups.
	 */
	public static function get_post_images( $post_id = null ) {
		$request_post = ! empty( $_REQUEST['post'] ) ? intval( $_REQUEST['post'] ) : false;
		$current_post_id = $post_id ? $post_id : $request_post;

		if ( ! $current_post_id ) {
			return array();
		}

		$attachments = get_children( array(
			'post_parent' => $current_post_id,
			'post_status' => 'inherit',
			'post_type' => 'attachment',
			'post_mime_type' => 'image',
			'order' => 'ASC',
			'orderby' => 'menu_order ID',
		) );

		$image_lookups = array();
		foreach ( $attachments as $attachment ) {
			$full_img_url = wp_get_attachment_image_src( $attachment->ID, 'thumbnail' );
			$image['attachment_id'] = $attachment->ID;
			$image['thumbnail'] = ! empty( $full_img_url[0] ) ? $full_img_url[0] : null;
			$image_lookups[] = $image;
		}

		return $image_lookups;
	}

	/**
	 * Get the current value for in page containers page meta value.
	 *
	 * @global $post WP Post Current post.
	 *
	 * @since 1.2.8
	 *
	 * @return integer $in_page_containers Whether or not containers have been added to content.
	 */
	public function page_containers_val() {
		global $post;

		$in_page_containers = 0;
		if ( ! empty( $post ) ) {
			$post_meta = get_post_meta( $post->ID );
			if ( ! empty( $post_meta['boldgrid_in_page_containers'][0] ) ) {
				$in_page_containers = $post_meta['boldgrid_in_page_containers'][0];
			}
		}

		return $in_page_containers;
	}

	/**
	 * Print inputs that will be stored when the page is saved.
	 *
	 * @since 1.3
	 */
	public function post_inputs() {
		$in_page_containers = $this->page_containers_val();
		$custom_colors = Boldgrid_Editor_Option::get( 'custom_colors', array() );

		?>
		<input style='display:none' type='checkbox' value='<?php echo intval( $in_page_containers ); ?>'
			checked='checked' name='boldgrid-in-page-containers'>
		<input style='display:none' type='checkbox' value='<?php echo esc_js( wp_json_encode( $custom_colors ) ); ?>'
			checked='checked' name='boldgrid-custom-colors'>
		<input style='display:none' value name='boldgrid-record-feedback'>
<?php

		$builderStyles = new Boldgrid_Editor_Builder_Styles();
		print $builderStyles->get_input();
	}

	/**
	 * Save page meta info.
	 *
	 * Once a page has been converted to use in page containers, set the post meta data so that
	 * containers can be removed from the theme.
	 *
	 * @since 1.3
	 *
	 * @param string $post_id integer.
	 * @param mixed  $post WP_Post.
	 */
	public function save_container_meta( $post_id, $post ) {
		$post_id = ! empty( $post_id ) ? $post_id : null;
		$status = isset( $_REQUEST['boldgrid-in-page-containers'] ) ?
			intval( $_REQUEST['boldgrid-in-page-containers'] ) : null;

		if ( $post_id && false === is_null( $status ) && ! wp_is_post_revision( $post_id ) ) {
			$update = update_post_meta( $post_id, 'boldgrid_in_page_containers', $status );
		}
	}

	/**
	 * Record feedback.
	 *
	 * @since 1.5
	 *
	 * @param string $post_id integer.
	 * @param mixed  $post WP_Post.
	 */
	public function record_feedback( $post_id, $post ) {
		$feedback = ! empty( $_REQUEST['boldgrid-record-feedback'] ) ?
			$_REQUEST['boldgrid-record-feedback'] : null;

		if ( $feedback && empty( $this->has_recorded_feedback ) && empty( $_POST['wp-preview'] ) ) {
			$this->has_recorded_feedback = true;
			$feedback = sanitize_text_field( wp_unslash( $feedback ) );
			$feedback = json_decode( $feedback, true );
			$feedback = is_array( $feedback ) ? $feedback : array();

			foreach ( $feedback as $item ) {
				do_action( 'boldgrid_feedback_add', $item['action'], $item['data'] );

				if ( 'installed_gridblock' === $item['action'] ) {
					Boldgrid_Editor_Service::get( 'rating' )->record( 'block_install' );
				}
			}
		}
	}

	/**
	 * Sanatize colors field passed back from page and post.
	 *
	 * @since 1.3
	 *
	 * @param string $colors Colors.
	 *
	 * @return string json string.
	 */
	public function sanitize_custom_colors( $colors ) {
		return sanitize_text_field( $colors );
	}

	/**
	 * Save user colors created during edit process.
	 *
	 * @since 1.3
	 */
	public function save_colors() {
		if ( isset( $_REQUEST['boldgrid-custom-colors'] ) ) {

			$custom_colors = ! empty( $_REQUEST['boldgrid-custom-colors'] ) ?
				sanitize_text_field( wp_unslash( $_REQUEST['boldgrid-custom-colors'] ) ) : '';

			$custom_colors = json_decode( $custom_colors, true );
			$custom_colors = is_array( $custom_colors ) ? $custom_colors : array();
			Boldgrid_Editor_Option::update( 'custom_colors', $custom_colors );
		}
	}

	/**
	 * Get the type of container used by this page.
	 *
	 * @since 1.2.3
	 *
	 * @global Boldgrid_Theme_Framework $boldgrid_theme_framework.
	 * @global WP_Post $post.
	 *
	 * @return string $container.
	 */
	public static function get_page_container() {
		global $boldgrid_theme_framework;
		global $post;

		$container = 'container';

		if ( $boldgrid_theme_framework && ! empty( $post->ID ) ) {

			$slug = get_page_template_slug( $post->ID );
			$slug = $slug ? $slug : 'default';

			$configs = $boldgrid_theme_framework->get_configs();

			if ( ! empty( $configs['template']['pages'][ $slug ]['entry-content'] ) ) {
				$container = $configs['template']['pages'][ $slug ]['entry-content'];
			}
		}

		return $container;
	}
}
