<?php
/**
* File: Single.php
*
* Create a post component.
*
* @since      1.0.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: Single
*
* Create a post component.
*
* @since 1.0.0
*/
class Menu extends \WP_Widget {

	/**
	 * Default widget wrappers.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	public static $widgetArgs = array(
		'before_title' => '',
		'after_title' => '',
		'before_widget' => '<div class="widget">',
		'after_widget' => '</div>',
		'bgc_menu' => 0,
	);

	/**
	 * Default values.
	 *
	 * @since 1.0.0
	 * @var array Default values.
	 */
	public $defaults = [
	];

		/**
	 * Setup the widget configurations.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_menu',
			__( 'BoldGrid Menu', 'boldgrid-editor' ),
			array(
				'classname' => 'bgc-menu',
				'description' => __( 'A customizable menu.', 'boldgrid-editor' )
			)
		);
	}

	/**
	 * Update a widget with a new configuration.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $new_instance New instance configuration.
	 * @param  array $old_instance Old instance configuration.
	 * @return array               Updated instance config.
	 */
	public function update( $new_instance, $old_instance ) {
		error_log( 'Old Instance: ' . json_encode( $old_instance ) );
		error_log( 'New Instance: ' . json_encode( $old_instance ) );
		$instance = $new_instance;

		return $instance;
	}

	/**
	 * Render a widget.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $args     General widget configurations.
	 * @param  array $instance Widget instance arguments.
	 */
	public function widget( $args, $instance )  {
		error_log( '$this::widget $instance: ' . json_encode( $instance ) );
		error_log( '$this::widget $args: ' . json_encode( $args ) );
		$class = 'sm bgc-header-template-menu';
		if ( 'vertical' === $instance->bgc_menu_direction ) {
			$class .= ' vertical';
		} else {
			$class .= ' horizontal';
		}
		$menu_id = (int) $instance->bgc_menu;
		echo wp_nav_menu( array( 'menu' => $menu_id, 'menu_class' => $class ) );
	}


	/**
	 * Print our a form that allowing the widget configs to be updated.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $instance Widget instance configs.
	 */
	public function form( $instance ) {
		?>
		<p>
			<h4><?php _e( 'Select a menu:', 'boldgrid-editor' ) ?></h4>
		</p>
		<p>
			<select id="<?php echo $this->get_field_id( 'bgc_menu' ); ?>" name="<?php echo $this->get_field_name( 'bgc_menu' ); ?>">
			<option value="0">Select a Menu</option>
		<?php
		foreach ( wp_get_nav_menus() as $menu ) {
			echo '<option value="' . $menu->term_id . '">' . $menu->name . '</option>';
		}
		?>
		</p>
		<p>
			<input type="radio" id="<?php echo $this->get_field_id( 'bgc_menu_horizontal' ); ?>" name="<?php echo $this->get_field_name( 'bgc_menu_direction' ); ?>" value="horizontal" checked>
			<label for="<?php echo $this->get_field_id( 'bgc_menu_horizontal' ); ?>">Horizontal</label>
			<input type="radio" id="<?php echo $this->get_field_id( 'bgc_menu_vertical' ); ?>" name="<?php echo $this->get_field_name( 'bgc_menu_direction' ); ?>" value="vertical">
			<label for="<?php echo $this->get_field_id( 'bgc_menu_vertical' ); ?>">Vertical</label>
		<?php
	}

}
