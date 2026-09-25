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

		if ( ! in_array( $type, array( 'content', 'form' ), true ) ) {
			wp_send_json_error( null, 400 );
		}

		$method = 'get_' . $type;
		if ( ! is_callable( array( $this, $method ) ) ) {
			wp_send_json_error( null, 400 );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified above.
		$attrs = $this->sanitize_request_widget_attrs( $component, wp_unslash( $_POST ) );
		$html  = $this->$method( $component, $attrs );

		wp_send_json(
			array(
				'content' => $this->sanitize_ajax_output( $html, $type ),
			)
		);
	}

	/**
	 * Sanitize rendered AJAX markup for the render type that produced it.
	 *
	 * @since 1.27.15
	 *
	 * @param mixed  $html Rendered markup.
	 * @param string $type content|form.
	 * @return string
	 */
	protected function sanitize_ajax_output( $html, $type ) {
		if ( ! is_string( $html ) || '' === $html ) {
			return '';
		}

		if ( 'form' !== $type ) {
			return wp_kses_post( $html );
		}

		return wp_kses( $this->filter_form_style_blocks( $html ), $this->get_widget_form_allowed_html() );
	}

	/**
	 * Markup a widget settings form is allowed to return.
	 *
	 * Post KSES drops the controls a widget form is built from, so form output
	 * gets its own allowlist: post tags plus the controls the editor panel
	 * serializes back into the shortcode. Event handler attributes are still
	 * absent, so form markup cannot execute in the editor session.
	 *
	 * @since 1.27.15
	 *
	 * @return array
	 */
	protected function get_widget_form_allowed_html() {
		$global_attrs = array(
			'aria-describedby' => true,
			'aria-label'       => true,
			'aria-labelledby'  => true,
			'class'            => true,
			'data-*'           => true,
			'dir'              => true,
			'hidden'           => true,
			'id'               => true,
			'lang'             => true,
			'role'             => true,
			'style'            => true,
			'tabindex'         => true,
			'title'            => true,
		);

		$controls = array(
			'datalist' => array(),
			'input'    => array(
				'autocomplete' => true,
				'checked'      => true,
				'disabled'     => true,
				'list'         => true,
				'max'          => true,
				'maxlength'    => true,
				'min'          => true,
				'multiple'     => true,
				'name'         => true,
				'pattern'      => true,
				'placeholder'  => true,
				'readonly'     => true,
				'required'     => true,
				'size'         => true,
				'step'         => true,
				'type'         => true,
				'value'        => true,
			),
			'optgroup' => array(
				'disabled' => true,
				'label'    => true,
			),
			'option'   => array(
				'disabled' => true,
				'label'    => true,
				'selected' => true,
				'value'    => true,
			),
			'select'   => array(
				'autocomplete' => true,
				'disabled'     => true,
				'multiple'     => true,
				'name'         => true,
				'required'     => true,
				'size'         => true,
			),
			'style'    => array(),
			'textarea' => array(
				'cols'        => true,
				'disabled'    => true,
				'maxlength'   => true,
				'name'        => true,
				'placeholder' => true,
				'readonly'    => true,
				'required'    => true,
				'rows'        => true,
				'wrap'        => true,
			),
		);

		foreach ( $controls as $tag => $attrs ) {
			$controls[ $tag ] = array_merge( $attrs, $global_attrs );
		}

		return array_merge( wp_kses_allowed_html( 'post' ), $controls );
	}

	/**
	 * Restrict the CSS a widget form may ship alongside its controls.
	 *
	 * KSES does not inspect element text, so style blocks are filtered before
	 * the markup pass.
	 *
	 * @since 1.27.15
	 *
	 * @param string $html Rendered form markup.
	 * @return string
	 */
	protected function filter_form_style_blocks( $html ) {
		$html   = (string) $html;
		$output = '';
		$offset = 0;
		$length = strlen( $html );

		while ( $offset < $length && preg_match( '#<style\b[^>]*>#i', $html, $open, PREG_OFFSET_CAPTURE, $offset ) ) {
			$open_start = $open[0][1];
			$open_end    = $open_start + strlen( $open[0][0] );
			$output    .= substr( $html, $offset, $open_start - $offset );

			$has_close = preg_match( '#</style>#i', $html, $close, PREG_OFFSET_CAPTURE, $open_end );
			$has_next  = preg_match( '#<style\b[^>]*>#i', $html, $next, PREG_OFFSET_CAPTURE, $open_end );

			// A later opener before the next closer means this block never terminated.
			if ( ! $has_close || ( $has_next && $next[0][1] < $close[0][1] ) ) {
				$offset = $open_end;
				continue;
			}

			$close_start = $close[0][1];
			$close_end    = $close_start + strlen( $close[0][0] );
			$css          = $this->sanitize_form_css( substr( $html, $open_end, $close_start - $open_end ) );

			if ( '' !== $css ) {
				$output .= '<style>' . $css . '</style>';
			}

			$offset = $close_end;
		}

		return $output . substr( $html, $offset );
	}

	/**
	 * Keep widget form CSS to static presentation rules.
	 *
	 * Remote fetches, legacy script bindings and escape obfuscation drop the
	 * whole block; widget form styling is cosmetic, so losing it cannot break
	 * the controls.
	 *
	 * @since 1.27.15
	 *
	 * @param string $css Style block contents.
	 * @return string
	 */
	protected function sanitize_form_css( $css ) {
		$css = wp_strip_all_tags( (string) $css );
		$css = preg_replace( '#/\*.*?\*/#s', '', $css );

		if ( ! is_string( $css ) || '' === trim( $css ) ) {
			return '';
		}

		$blocked = '#(@import|@charset|@namespace|expression\s*\(|url\s*\(|behavior\s*:|-moz-binding|javascript\s*:|\\\\)#i';

		return preg_match( $blocked, $css ) ? '' : trim( $css );
	}

	/**
	 * Widget id_base for a registered component name.
	 *
	 * @since 1.27.15
	 *
	 * @param array $component Component configuration.
	 * @return string
	 */
	protected function get_widget_id_base( $component ) {
		if ( empty( $component['name'] ) || ! is_string( $component['name'] ) ) {
			return '';
		}

		if ( 0 === strpos( $component['name'], 'wp_' ) ) {
			return sanitize_key( substr( $component['name'], 3 ) );
		}

		return sanitize_key( $component['name'] );
	}

	/**
	 * Read only the widget instance for the requested component.
	 *
	 * @since 1.27.15
	 *
	 * @param array $component Component configuration.
	 * @param array $params    Unslashed request parameters.
	 * @return array
	 */
	protected function sanitize_request_widget_attrs( $component, $params ) {
		$id_base = $this->get_widget_id_base( $component );
		if ( '' === $id_base || ! is_array( $params ) ) {
			return array();
		}

		$key = 'widget-' . $id_base;
		if ( empty( $params[ $key ] ) || ! is_array( $params[ $key ] ) ) {
			return array();
		}

		return $this->sanitize_widget_instance( $params[ $key ] );
	}

	/**
	 * Sanitize a widget instance payload.
	 *
	 * @since 1.27.15
	 *
	 * @param array $widget_props Nested widget form values.
	 * @return array
	 */
	protected function sanitize_widget_instance( $widget_props ) {
		$attrs = array();

		foreach ( (array) $widget_props as $widget_prop ) {
			if ( ! is_array( $widget_prop ) ) {
				continue;
			}

			foreach ( $widget_prop as $field => $value ) {
				if ( ! is_string( $field ) && ! is_int( $field ) ) {
					continue;
				}

				$field = sanitize_key( (string) $field );
				if ( '' === $field ) {
					continue;
				}

				$attrs[ $field ] = $this->sanitize_widget_field( $field, $value );
			}
		}

		return $attrs;
	}

	/**
	 * Sanitize one widget instance field by name.
	 *
	 * HTML-bearing fields are allowlisted at this boundary because the
	 * previewing user may be an administrator rendering contributor data.
	 *
	 * @since 1.27.15
	 *
	 * @param string $field Field name.
	 * @param mixed  $value Field value.
	 * @return mixed
	 */
	protected function sanitize_widget_field( $field, $value ) {
		if ( is_array( $value ) ) {
			$out = array();
			foreach ( $value as $child_key => $child_value ) {
				if ( ! is_string( $child_key ) && ! is_int( $child_key ) ) {
					continue;
				}
				$out[ sanitize_key( (string) $child_key ) ] = $this->sanitize_widget_field( $field, $child_value );
			}
			return $out;
		}

		if ( ! is_scalar( $value ) ) {
			return '';
		}

		$value = (string) $value;

		if ( in_array( $field, array( 'content', 'text', 'html', 'textarea' ), true ) ) {
			return wp_kses_post( $value );
		}

		if ( in_array( $field, array( 'url', 'link', 'href', 'src' ), true ) ) {
			$url = esc_url_raw( $value );
			if ( $url && class_exists( 'Boldgrid_Editor_Url' ) && is_callable( array( 'Boldgrid_Editor_Url', 'is_public_host' ) )
				&& ! Boldgrid_Editor_Url::is_public_host( $url )
			) {
				return '';
			}
			return $url;
		}

		return sanitize_text_field( $value );
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
