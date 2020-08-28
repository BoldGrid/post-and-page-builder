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
		$class = 'sm bgc-header-template-menu color3-border-color';

		if ( 'vertical' === $instance['bgc_menu_direction'] ) {
			$class .= ' vertical';
		} else {
			$class .= ' horizontal';
		}

		$menu_id = (int) $instance['bgc_menu'];

		$align = ' align-' . explode( ' ', $instance['bgc_menu_align'] )[0];
		$just  = ' just-' . explode( ' ', $instance['bgc_menu_align'] )[1];

		$class .= $align . $just;

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
		error_log( 'Form Instance: ' . json_encode( $instance ) );
		?>
			<h4><?php _e( 'Select a menu:', 'boldgrid-editor' ) ?></h4>
		<p>
			<select id="<?php echo $this->get_field_id( 'bgc_menu' ); ?>" name="<?php echo $this->get_field_name( 'bgc_menu' ); ?>">
			<option value="0">Select a Menu</option>
		<?php
		foreach ( wp_get_nav_menus() as $menu ) {
			$selected = ( ! empty( $instance['bgc_menu'] ) && $menu->term_id === (int) $instance['bgc_menu'] ) ? 'selected' : '';
			echo '<option value="' . $menu->term_id . '" ' . $selected . '>' . $menu->name . '</option>';
		}
		?>
			</select>
		</p>
		<h4>Choose Menu Type</h4>
		<p>
			<input type="radio"
				id="<?php echo $this->get_field_id( 'bgc_menu_horizontal' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_menu_direction' ); ?>"
				value="horizontal"
				<?php echo ( ! empty( $instance['bgc_menu_direction'] ) && 'horizontal' === $instance['bgc_menu_direction'] ) ? 'checked' : '';?>
			>
			<label for="<?php echo $this->get_field_id( 'bgc_menu_horizontal' ); ?>">Horizontal</label>
			<input type="radio"
				id="<?php echo $this->get_field_id( 'bgc_menu_vertical' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_menu_direction' ); ?>"
				value="vertical"
				<?php echo ( ! empty( $instance['bgc_menu_direction'] ) && 'vertical' === $instance['bgc_menu_direction'] ) ? 'checked' : '';?>
			>
			<label for="<?php echo $this->get_field_id( 'bgc_menu_vertical' ); ?>">Vertical</label>
		</p>
		<h4>Menu Alignment</h4>
		<style>
			.bgc-menu-align-control td {
				border-spacing: 3px;
				border:1px solid #000;
				border-radius: 1px;
			}
			.bgc-menu-align-control tr {
				border-spacing: 3px;
			}

			.bgc-menu-align-control .dashicons-arrow-up.r,
			.bgc-menu-align-control .dashicons-arrow-down.l {
				transform: rotate(45deg);
			}

			.bgc-menu-align-control .dashicons-arrow-up.l,
			.bgc-menu-align-control .dashicons-arrow-down.r {
				transform: rotate(315deg);
			}

			.bgc-menu-align-control input {
				opacity: 0;
				position: absolute;
				z-index: 99;
				width:20px;
				height:20px;
			}
			.bgc-menu-align-control td:hover input ~ .dashicons::before {
  				color: #ccc;
			}

			.bgc-menu-align-control td input:checked ~ .dashicons::before {
  				color: rgb(249,91,38);
			}

		</style>
		<table class="bgc-menu-align-control">
			<?php
				$align = ( ! empty( $instance['bgc_menu_align'] ) ) ? $instance['bgc_menu_align'] : 'c c';
				$options = array(
					't' => array( 'l' => 'arrow-up', 'c' => 'arrow-up', 'r' => 'arrow-up' ),
					'c' => array( 'l' => 'arrow-left', 'c' => 'move', 'r' => 'arrow-right' ),
					'b' => array( 'l' => 'arrow-down', 'c' => 'arrow-down', 'r' => 'arrow-down' ),
				);

				foreach( $options as $row => $cols ) {
					?><tr><?php
					foreach( $cols as $col => $icon ) {
						?>
						<td>
							<input type="radio"
								id="<?php echo $this->get_field_id( 'bgc_menu_align_' . $row . $col ); ?>"
								name="<?php echo $this->get_field_name( 'bgc_menu_align' ); ?>"
								value="<?php echo $row . ' ' . $col;?>"
								<?php echo $row . ' ' . $col === $align ? 'checked' : ''; ?>
							>
							<span class="dashicons dashicons-<?php echo $icon . ' ' . $col; ?>"></span>
						</td>
						<?php
					}
					?></tr><?php
				}
	}

}
