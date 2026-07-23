<?php
/**
* Class: Boldgrid_Components_Shortcode
*
* Setup shortcode components.
*
* @since 1.8.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

/**
* Class: Boldgrid_Components_Shortcode
*
* Setup shortcode components.
*
* @since 1.8.0
*/
class Boldgrid_Components_Shortcode {

	/**
	 * Config.
	 *
	 * @since 1.24.1
	 *
	 * @var array
	 */
	public $config = array();

	/**
	 * Initialize Component configurations.
	 *
	 * @since 1.8.0
	 */
	public function __construct() {
		$this->config = Boldgrid_Editor_Service::get( 'config' )['component_controls'];
	}

	/**
	 * Initialize the shortcode component.
	 *
	 * @since 1.8.0
	 */
	public function init() {
		add_action( 'wp_loaded', function() {
			$this->add_widget_configs();

			// Update configs in the global configs.
			$config = Boldgrid_Editor_Service::get( 'config' );
			$config['component_controls'] = $this->config;
			Boldgrid_Editor_Service::register( 'config', $config );

			$this->register_components();
			$this->register_shortcodes();
		}, 20 );
	}

	/**
	 * Get the content of the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  $component Component Configuration.
	 * @param  $attrs     Attributes for shortcode.
	 * @return string     Content.
	 */
	public function get_content( $component, $attrs = array() ) {
		$args = ! empty( $component['args'] ) ? $component['args'] : array();

		if ( ! empty( $component['widget'] ) ) {
			$widget = new $component['widget'];
			$classname = ! empty( $widget->widget_options['classname'] ) ?
				$widget->widget_options['classname'] : '';

			$widget_config = array_merge( array(
				'widget_id' => isset( $component['js_control']['unique_id'] ) ? $component['js_control']['unique_id'] : null,
				'before_title' => '<h4 class="widget-title">',
				'after_title' => '</h4>',
				'before_widget' => sprintf( '<div class="widget %s">', $classname ),
				'after_widget' => '</div>',
			), $args );

			ob_start();

			if( isset( $widget_config['widget_id'] ) ) {
				$attrs['widget_id'] = $widget_config['widget_id'];
			}

			$widget->widget( $widget_config, $attrs );
			$markup = ob_get_clean();

			return $markup;
		} else {
			return $component['method']( $args, $attrs );
		}
	}

	/**
	 * Given a widget configuration.
	 *
	 * @since 1.8.0
	 *
	 * @param  Object $widget    Create config.
	 * @param  string $classname Classname for widget.
	 */
	protected function create_widget_config( $widget, $classname ) {
		global $pagenow;

		$config = array(
			'name' => 'wp_' . $widget->id_base,
			'shortcode' => 'boldgrid_wp_' . preg_replace( "/[^a-z0-9_]/", '', strtolower( $widget->id_base ) ),
			'widget' => $classname,
			'js_control' => array(),
		);

		if ( in_array( $pagenow, array( 'post.php', 'post-new.php' ), true ) ) {
			$config['js_control'] = array(
				'name' =>  'wp_' . $widget->id_base,
				'title' =>  $widget->name,
				'description' => ! empty( $widget->widget_options['description'] ) ?
					$widget->widget_options['description'] : '',
				'type' =>  'widget',
				'priority' =>  10,
				'icon' =>  '<span class="dashicons dashicons-admin-generic"></span>',
			);
		}

		return $config;
	}

	/**
	 * Add all widgets to the list of components.
	 *
	 * @since 1.8.0
	 */
	protected function add_widget_configs() {
		if ( ! empty( $GLOBALS['wp_widget_factory']->widgets ) ) {
			$widgets = $GLOBALS['wp_widget_factory']->widgets;

			foreach( $widgets as $classname => $widget ) {
				/*
				 * If the user is not an admin, skip the 'block'
				 * widget because it allows the users to add
				 * arbitrary HTML and JavaScript.
				 */
				if ( ! current_user_can( 'manage_options' ) && 'block' === $widget->id_base ) {
					continue;
				}

				if ( ! in_array( $widget->id_base, $this->config['skipped_widgets'] ) ) {
					$name = 'wp_' . $widget->id_base;
					$widget_config = $this->create_widget_config( $widget, $classname );

					$config = ! empty( $this->config['components'][ $name ]['js_control'] ) ?
						$this->config['components'][ $name ]['js_control'] : array();

					$widget_config['js_control'] = array_merge(
						$widget_config['js_control'], $config
					);

					$this->config['components'][ $name ] = $widget_config;
				}
			}
		}
	}

	/**
	 * Based on our configuration. Setup our config.
	 *
	 * @since 1.8.0
	 */
	protected function register_components() {

		// Add a single configurable shortcode.
		add_shortcode( 'boldgrid_component', function ( $attrs, $content = null ) {
			if ( empty( $attrs['type'] ) ) {
				return;
			}
			$component = ! empty( $this->config['components'][ $attrs['type'] ] ) ?
				$this->config['components'][ $attrs['type'] ] : null;

			if ( ! empty( $component ) ) {
				$attrs = $this->get_shortcode_options( $attrs );
				return $this->get_content( $component, $attrs );
			}
		} );
		foreach ( $this->config['components'] as $component ) {
			// This has been changed to 'edit_posts' to allow Authors and Contributors to use the editor.
			if ( current_user_can( 'edit_posts' ) && isset( $component['name'] ) ) {
				add_action( 'wp_ajax_boldgrid_component_' . $component['name'], function () use ( $component ) {
					$this->ajax_shortcode( $component, 'content' );
				} );
				add_action( 'wp_ajax_boldgrid_component_' . $component['name'] . '_form', function () use ( $component ) {
					$this->ajax_shortcode( $component, 'form' );
				} );
			}
		}

	}

	/**
	 * Shortcodes the editor may preview via AJAX.
	 *
	 * Must stay in sync with assets/js/builder/component/shortcode/component.js defaultShortcodes.
	 *
	 * @since 1.27.12
	 *
	 * @return array
	 */
	protected function get_editor_shortcode_allowlist() {
		return array(
			'boldgrid_component',
			'wp_caption',
			'caption',
			'gallery',
			'playlist',
			'audio',
			'video',
			'embed',
			'weforms',
		);
	}

	/**
	 * Verify user-supplied shortcode text targets the expected tag.
	 *
	 * @since 1.27.12
	 *
	 * @param string $text         Shortcode text from the request.
	 * @param string $expected_tag AJAX action shortcode tag.
	 * @return bool
	 */
	protected function shortcode_text_matches_tag( $text, $expected_tag ) {
		if ( ! is_string( $text ) || '' === $text || ! is_string( $expected_tag ) || '' === $expected_tag ) {
			return false;
		}

		if ( ! preg_match( '/^\s*\[(?:\/)?([a-zA-Z0-9_-]+)/', $text, $matches ) ) {
			return false;
		}

		return $expected_tag === $matches[1];
	}

	/**
	 * Expand shortcode text with only explicitly allowed tags registered.
	 *
	 * @since 1.27.12
	 *
	 * @param string $text         Shortcode text.
	 * @param array  $allowed_tags Allowed shortcode tag names.
	 * @return string
	 */
	protected function render_allowlisted_shortcode( $text, array $allowed_tags ) {
		global $shortcode_tags;

		$backup         = $shortcode_tags;
		$shortcode_tags = array_intersect_key(
			$shortcode_tags,
			array_flip( $allowed_tags )
		);

		$html = do_shortcode( $text );

		$shortcode_tags = $backup;

		return $html;
	}

	/**
	 * Bind editor shortcode preview handlers for an explicit allowlist.
	 *
	 * @since 1.11.0
	 *
	 * @global $shortcode_tags.
	 */
	public function register_shortcodes() {
		global $shortcode_tags;

		$tags = ! empty( $shortcode_tags ) && is_array( $shortcode_tags ) ? $shortcode_tags : array();
		$allowed = $this->get_editor_shortcode_allowlist();

		foreach ( $allowed as $tag ) {
			if ( ! isset( $tags[ $tag ] ) ) {
				continue;
			}

			add_action(
				'wp_ajax_boldgrid_shortcode_' . $tag,
				function () use ( $tag ) {
					Boldgrid_Editor_Ajax::validate_nonce( 'gridblock_save' );

					$text = isset( $_POST['text'] ) ? wp_unslash( $_POST['text'] ) : '';
					if ( ! $this->shortcode_text_matches_tag( $text, $tag ) ) {
						wp_send_json_error( null, 400 );
					}

					$html = $this->render_allowlisted_shortcode( $text, array( $tag ) );

					wp_send_json(
						array(
							'content' => wp_kses_post( $html ),
						)
					);
				}
			);
		}
	}

	/**
	 * Given a component and some attributes, return the options for shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $attrs     Attributes from the shortcode.
	 * @return string           Shortcode output.
	 */
	public function get_shortcode_options( $attrs ) {
		$opts = ! empty( $attrs['opts'] ) ? $attrs['opts'] : '';
		$opts = json_decode( urldecode( $opts ), true );
		$opts = is_array( $opts ) ? $opts : array();

		$output = array();
		foreach ( $opts as $name => $val ) {
			if ( ! is_string( $name ) || ( ! is_string( $val ) && ! is_numeric( $val ) ) ) {
				continue;
			}

			if ( ! preg_match( '/^widget-([a-z0-9_]+)\[\]\[([a-z0-9_]+)\]$/i', $name, $matches ) ) {
				continue;
			}

			$widget_key = $matches[1];
			$field_key  = sanitize_key( $matches[2] );
			$output[ $widget_key ][] = array(
				$field_key => sanitize_text_field( wp_unslash( (string) $val ) ),
			);
		}

		return $this->parse_attrs( $output );
	}

	/**
	 * Get the form for a widget.
	 *
	 * @since 1.8.0
	 *
	 * @param $component Component Configuration.
	 */
	protected function ajax_shortcode( $component, $type ) {
		Boldgrid_Editor_Ajax::validate_nonce( 'gridblock_save' );

		$attrs = $this->parse_attrs( $_POST );
		$method = 'get_' . $type;

		wp_send_json( array(
			'content' => $this->$method( $component, $attrs )
		) );
	}

	/**
	 * Get a Widget form.
	 *
	 * @since 1.8.0
	 *
	 * @param  string $classname Class of widget.
	 * @param  string $attrs     Attributes.
	 * @return string            HTML.
	 */
	protected function get_form( $component, $attrs = array() ) {
		$form = false;
		if ( class_exists( $component['widget'] ) ) {
			$widget = new $component['widget']();
			ob_start();
			$widget->form( $attrs );
			$form = ob_get_clean();
		}

		return $form;
	}

	/**
	 * Widgets are encoded in one attributes named attr. Pull that data into an array.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $component Component Configuration.
	 * @param  array $attrs     Attributes.
	 * @return array            Attributes.
	 */
	protected function parse_attrs( $params ) {
		$widget_props = reset( $params );
		$attrs = array();
		$widget_props = is_array( $widget_props ) ? $widget_props : array();
		foreach( $widget_props as $widget_prop ) {
			$attrs = array_merge( $attrs, $widget_prop );
		}

		return $attrs;
	}

}
