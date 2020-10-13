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
	 * Widget Id
	 *
	 * @since 1.1.0
	 * @var string
	 */
	public $widget_id;


		/**
	 * Setup the widget configurations.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_menu',
			__( 'Navigation Menu', 'boldgrid-editor' ),
			array(
				'classname' => 'bgc-menu',
				'description' => __( 'A customizable menu for use in Crio Premium Header Templates.', 'boldgrid-editor' ),
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

		if ( isset( $instance['bgc_menu_direction'] ) && 'vertical' === $instance['bgc_menu_direction'] ) {
			$class .= ' vertical';
		} else {
			$class .= ' horizontal';
		}

		$menu_id = isset( $instance['bgc_menu'] ) ? (int) $instance['bgc_menu'] : 0;

		$bgc_menu_align = isset( $instance[ 'bgc_menu_align' ] ) ? $instance[ 'bgc_menu_align' ] : 'c c';

		$align = ' align-' . explode( ' ', $bgc_menu_align )[0];
		$just  = ' just-' . explode( ' ', $bgc_menu_align )[1];

		$class .= $align . $just;

		$this->_register();

		$this->update_post_meta( $instance['bgc_menu_id'] );

		do_action( 'boldgrid_menu_' . $instance['bgc_menu_id'], [ 'menu_class' => 'flex-row ' . $class ] );

		echo wp_nav_menu( array( 'menu' => $menu_id, 'menu_class' => $class ) );
	}

	/**
	 * Update Post Meta
	 *
	 * Adds new nav menus to post_meta field.
	 *
	 * @since 1.1.0
	 *
	 * @param string $menu_id Menu Id.
	 */
	public function update_post_meta( $menu_id ) {
		$referer  = wp_get_referer();
		$matches  = array();
		preg_match( '/post=(\d+)/', $referer, $matches );

		$page_header = get_post( $matches[1] );

		$page_header_menus = get_post_meta( $page_header->ID, 'crio-premium-menus', true );

		if( is_string( $page_header_menus ) ) {
			$page_header_menus = array( $menu_id );
		}

		if( is_array( $page_header_menus ) && ! in_array( $menu_id, $page_header_menus ) ) {
			$page_header_menus[] = $menu_id;
		}

		update_post_meta(
			$page_header->ID,
			'crio-premium-menus',
			$page_header_menus
		);
	}

	/**
	 * Get Unique Id.
	 *
	 * @since 1.1.0
	 *
	 * @return string Unique ID for this nav menu.
	 */
	public function get_unique_id() {
		$referer  = wp_get_referer();
		$matches  = array();
		preg_match( '/post=(\d+)/', $referer, $matches );

		$page_header = get_post( $matches[1] );

		$header_name  = $page_header->post_name;
		if ( ! empty( $page_header ) ) {
			return uniqid( $header_name . '-menu_' );
		} else {
			return '';
		}
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
			<h4><?php _e( 'Register this Menu Location', 'boldgrid-editor' ); ?></h4>
			<input type="text" required class="bgc_menu_location"
				id="<?php echo $this->get_field_id( 'bgc_menu_location' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_menu_location' ); ?>"
				value="<?php echo $instance['bgc_menu_location'] ?>">
			<p>
				<span class="hidden register_menu_nonce"><?php echo wp_create_nonce( 'crio_premium_register_menu_location' ); ?></span>
				<button class="button bgc_register_location"><?php _e( 'Register Menu Location', 'boldgrid-editor' ) ?></button>
				<span class="spinner" style="float: none"></span>
			</p>
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
