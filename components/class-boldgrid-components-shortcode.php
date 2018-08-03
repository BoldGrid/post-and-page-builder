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
	 * Initialize Component configurations.
	 *
	 * @since 1.8.0
	 */
	public function __construct() {
		$this->config = Boldgrid_Editor_Service::get( 'config' )['component_controls'];
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
	 * Get a Widget form.
	 *
	 * @since 1.8.0
	 *
	 * @param  string $classname Class of widget.
	 * @param  string $attrs     Attributes.
	 * @return string            HTML.
	 */
	public function get_form( $component, $attrs = array() ) {
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
	 * Add all widgets to the list of components.
	 *
	 * @since 1.8.0
	 */
	public function add_widget_configs() {
		if ( ! empty( $GLOBALS['wp_widget_factory']->widgets ) ) {
			$widgets = $GLOBALS['wp_widget_factory']->widgets;

			foreach( $widgets as $classname => $widget ) {
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
	 * Initialize the shortcode component.
	 *
	 * @since 1.8.0
	 */
	public function init() {
		add_action( 'wp_loaded', function() {
			$this->add_widget_configs();
			$config = Boldgrid_Editor_Service::get( 'config' );
			$config['component_controls'] = $this->config;
			Boldgrid_Editor_Service::register( 'config', $config );

			$this->register_components();
		}, 20 );
	}

	/**
	 * Based on our configuration. Setup our config.
	 *
	 * @since 1.8.0
	 */
	public function register_components() {
		foreach ( $this->config['components'] as $component ) {
			$this->register( $component );

			if ( current_user_can( 'edit_pages' ) ) {
				add_action( 'wp_ajax_boldgrid_component_' . $component['name'], function () use ( $component ) {
					$this->ajax_content( $component );
				} );
				add_action( 'wp_ajax_boldgrid_component_' . $component['name'] . '_form', function () use ( $component ) {
					$this->ajax_form( $component );
				} );
			}
		}
	}

	/**
	 * Get the form for a widget.
	 *
	 * @since 1.8.0
	 *
	 * @param $component Component Configuration.
	 */
	public function ajax_form( $component ) {
		$attrs = ! empty( $_POST['attrs'] ) ? $_POST['attrs'] : array();
		$attrs = $this->parse_attrs( $component, $attrs );

		wp_send_json( array(
			'content' => $this->get_form( $component, $attrs )
		) );
	}

	/**
	 * Return the content of a shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param $component Component Configuration.
	 */
	public function ajax_content( $component ) {
		$attrs = ! empty( $_POST['attrs'] ) ? $_POST['attrs'] : array();

		wp_send_json( array(
			'content' => $this->get_content( $component, $attrs )
		) );
	}

	/**
	 * Register the shortcode.
	 *
	 * @since 1.8.0
	 *
	 * @param  $component Component Configuration.
	 */
	public function register( $component ) {
		add_shortcode( $component['shortcode'], function ( $attrs, $content = null ) use ( $component ) {
			return $this->get_content( $component, $attrs );
		} );
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
	public function parse_attrs( $component, $attrs ) {
		if ( ! empty( $component['widget'] ) ) {
			$attrs = ! empty( $attrs['attr'] ) ? $attrs['attr'] : '';
			parse_str( html_entity_decode( $attrs ), $results );

			$attrs = array();
			$widget_props = reset( $results );

			$widget_props = is_array( $widget_props ) ? $widget_props : array();
			foreach( $widget_props as $widget_prop ) {
				$attrs = array_merge( $attrs, $widget_prop );
			}
		}

		return $attrs;
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

		$attrs = $this->parse_attrs( $component, $attrs );

		if ( ! empty( $component['widget'] ) ) {
			$widget = new $component['widget'];
			$classname = ! empty( $widget->widget_options['classname'] ) ?
				$widget->widget_options['classname'] : '';

			$widget_config = array_merge( $args, array(
				'before_title' => '<h2 class="widget-title">',
				'after_title' => '</h2>',
				'before_widget' => sprintf( '<div class="widget %s">', $classname ),
				'after_widget' => '</div>',
			) );

			ob_start();
			$widget->widget( $widget_config, $attrs );
			$markup = ob_get_clean();

			return $markup;
		} else {
			return $component['method']( $args, $attrs );
		}
	}

}
