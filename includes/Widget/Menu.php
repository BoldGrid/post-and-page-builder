<?php
/**
* File: Menu.php
*
* Create a menu component widget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: Menu
*
* Create a menu component widget.
*
* @since 1.14.0
*/
class Menu extends \WP_Widget {

	/**
	 * Default widget wrappers.
	 *
	 * @since 1.14.0
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
	 * @since 1.14.0
	 * @var array Default values.
	 */
	public $defaults = [
	];

	/**
	 * Widget Id
	 *
	 * @since 1.14.0
	 * @var string
	 */
	public $widget_id;


	/**
	 * Setup the widget configurations.
	 *
	 * @since 1.14.0
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
	 * @since 1.14.0
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
	 * @since 1.14.0
	 *
	 * @param  array $args     General widget configurations.
	 * @param  array $instance Widget instance arguments.
	 */
	public function widget( $args, $instance )  {
		$class = 'sm bgc-header-template-menu color3-border-color';

		$menu_id = isset( $instance['bgc_menu'] ) && 0 !== (int) $instance['bgc_menu'] ? (int) $instance['bgc_menu'] : null;

		$bgc_menu_align = isset( $instance[ 'bgc_menu_align' ] ) ? $instance[ 'bgc_menu_align' ] : 'c c';

		$align = $this->get_align_class( $bgc_menu_align );

		$class .= ' ' . $align;

		$registered_locations = get_nav_menu_locations();

		$this->_register();
		if ( isset( $instance['bgc_menu_location'] ) && ! $this->location_is_valid( $instance['bgc_menu_location'] ) ) {
			?>
			<p class="bgc_no_menu_notice"><?php echo __('Menu Location Name can only contain letters, numbers, and spaces.', 'boldgrid-editor' ) ?></p>
			<?php
		} else if ( isset( $instance['bgc_menu_location_id'] ) && isset( $menu_id ) ) {

			$menu_ul_id = str_replace( '_', '-', $instance['bgc_menu_location_id'] ) . '-menu';

			echo '<div id="' . $instance['bgc_menu_location_id'] . '-wrap" class="bgtfw-menu-wrap">';

			// Make sure that if there is a registerd location already, that it is used.
			$menu_id = isset( $registered_locations[ $instance['bgc_menu_location_id'] ] )
				&& 0 !== $registered_locations[ $instance['bgc_menu_location_id'] ]
				? $registered_locations[ $instance['bgc_menu_location_id'] ] : $menu_id;
			do_action( 'boldgrid_menu_' . $instance['bgc_menu_location_id'], [ 'menu_class' => 'flex-row ' . $class, 'menu' => $menu_id, 'menu_id' => $menu_ul_id ] );
			echo '</div>';
		} else if ( isset( $instance['bgc_menu_location_id'] ) && isset( $registered_locations[ $instance['bgc_menu_location_id'] ] ) ) {
			$menu_ul_id = str_replace( '_', '-', $instance['bgc_menu_location_id'] ) . '-menu';

			echo '<div id="' . $instance['bgc_menu_location_id'] . '-wrap" class="bgtfw-menu-wrap">';

			$menu_id = $registered_locations[ $instance['bgc_menu_location_id'] ];
			do_action( 'boldgrid_menu_' . $instance['bgc_menu_location_id'], [ 'menu_class' => 'flex-row ' . $class, 'menu' => $menu_id, 'menu_id' => $menu_ul_id ] );
			echo '</div>';
		} else if ( isset( $instance['bgc_menu_location_id'] ) ) {
			?>
			<p class="bgc_no_menu_notice"><?php echo __('You must choose a menu to display in this location', 'boldgrid-editor' ) ?></p>
			<?php
		} else {
			?>
			<p class="bgc_no_menu_notice"><?php echo __('You must register a menu location for this component to render', 'boldgrid-editor' ) ?></p>
			<?php
		}
	}

	/**
	 * Location is Valid
	 *
	 * Validates location id to be sure it contains
	 * alphanumeric characters only.
	 *
	 * @since 1.14.0
	 *
	 * @param string $id Location ID to validate
	 *
	 * @return bool True if valid, False if not.
	 */
	public function location_is_valid( $id ) {
		if ( preg_match( '/^[a-z\s0-9][a-z\s0-9]*$/i', $id ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Get Alignment Class
	 *
	 * This takes the alignment information passed from the form
	 * and converts it into a usable class name for bgtfw.
	 *
	 * @since 1.14.0
	 *
	 * @param string $align_value Value passed from form.
	 * @return string Alignment class.
	 */
	public function get_align_class( $align_value ) {
		$align_class = 'c';
		switch ( $align_value ) {
			case ( 'left' ):
				$align_class = 'w';
				break;
			case ( 'right' ):
				$align_class = 'e';
				break;
			default:
				$align_class = 'c';
				break;
		}

		return $align_class;
	}

	/**
	 * Get Unique Id.
	 *
	 * @since 1.14.0
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
	 * Print Menu Registration Controls
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function menu_registration_controls( $instance ) {
		$registered_locations = get_nav_menu_locations();
		$location_managed_elsewhere = false;
		if ( isset( $instance ['bgc_menu_location'] ) ) {
			$location_managed_elsewhere = isset( $registered_locations[ $instance['bgc_menu_location_id'] ] );
		}

		if ( isset( $instance['bgc_menu'] ) ) {
			$instance['bgc_menu'] = $location_managed_elsewhere ? $registered_locations[ $instance['bgc_menu_location_id'] ] : $instance['bgc_menu'];
		} else {
			$instance['bgc_menu'] = $location_managed_elsewhere ? $registered_locations[ $instance['bgc_menu_location_id'] ] : 0;
		}

		?>
		<div class="bgc_menu_registration_container">
			<h4><?php _e( 'Register this Menu Location', 'boldgrid-editor' ); ?></h4>
			<p><?php _e( 'In order to customize this menu, a menu location must be registered. To do so, you must enter a location name and click "Register this Menu Location"', 'boldgrid-editor' ); ?></p>
			<p class="invalid_characters" style="display:none" ><?php _e( 'Menu Location Name can only contain letters, numbers, and spaces', 'boldgrid-editor' ); ?></p>
			<input type="text" required class="bgc_menu_location"
				id="<?php echo $this->get_field_id( 'bgc_menu_location' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_menu_location' ); ?>"
				value="<?php echo isset( $instance['bgc_menu_location'] ) ? $instance['bgc_menu_location'] : '' ?>"
			>
			<p>
				<span class="hidden register_menu_nonce"><?php echo wp_create_nonce( 'crio_premium_register_menu_location' ); ?></span>
				<button class="button bgc_register_location"><?php _e( 'Register Menu Location', 'boldgrid-editor' ) ?></button>
				<span class="spinner" style="float: none"></span>

				<input id="<?php echo $this->get_field_id( 'bgc_menu_location_id' ) ?>" type="hidden" required class="bgc_menu_location_id"
					id="<?php echo $this->get_field_id( 'bgc_menu_location_id' ); ?>"
					name="<?php echo $this->get_field_name( 'bgc_menu_location_id' ); ?>"
					value="<?php echo isset( $instance['bgc_menu_location_id'] ) ? $instance['bgc_menu_location_id'] : '' ?>"
				>
			</p>

			<h4><?php _e( 'Select a menu:', 'boldgrid-editor' ) ?></h4>
			<p class="<?php echo ( $location_managed_elsewhere ) ? 'menu_location_notice' : 'menu_location_notice hidden'; ?>">
				<?php esc_html_e( 'A menu has been assigned to this location elsewhere. ', 'boldgrid-editor' ); ?>
				<a class="button bgc_goto_menu_assignment" href="<?php echo admin_url( 'nav-menus.php?action=locations'); ?>"><?php esc_html_e( 'Go To Menu Assignment', 'boldgrid-editor' ); ?></a>
			</p>
			<p>
				<select id="<?php echo $this->get_field_id( 'bgc_menu' ); ?>" class="bgc_menu"
					name="<?php echo $this->get_field_name( 'bgc_menu' ); ?>"
					<?php echo ( $location_managed_elsewhere ) ? 'disabled' : ''; ?>>
					<option value="0">Select a Menu</option>
					<?php
						foreach ( wp_get_nav_menus() as $menu ) {
							$selected = ( ! empty( $instance['bgc_menu'] ) && $menu->term_id === (int) $instance['bgc_menu'] ) ? 'selected' : '';
							echo '<option value="' . $menu->term_id . '" ' . $selected . '>' . $menu->name . '</option>';
						}
					?>
				</select>
				<?php
				if ( 0 === count( wp_get_nav_menus() ) ) {
					?>
					<a class="button" href="<?php echo admin_url( 'nav-menus.php' ) ?>"><?php esc_html_e( 'Create a Menu', 'boldgrid-editor' ); ?></a>
					<?php
				}
				?>
			</p>
		</div>
		<?php
	}

	/**
	 * Print Menu Alignment Controls
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function menu_alignment_controls( $instance ) {
		$field_name     = $this->get_field_name( 'bgc_menu_align' );
		$selected_align = ! empty( $instance['bgc_menu_align'] ) ? $instance['bgc_menu_align'] : 'center';
		?>
		<div class="bgc_menu_container">
			<h4><?php _e( 'Choose Menu Alignment', 'boldgrid-editor' ); ?></h4>
			<div class="buttonset bgc">
				<input class="switch-input screen-reader-text bgc" type="radio" value="left"
					name="<?php echo $field_name; ?>"
					id="<?php echo $this->get_field_id( 'bgc_menu_align_left' ); ?>"
					<?php echo 'left' === $selected_align ? 'checked' : '';?>
				>
					<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_menu_align_left' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

				<input class="switch-input screen-reader-text bgc" type="radio" value="center"
					name="<?php echo $field_name; ?>"
					id="<?php echo $this->get_field_id( 'bgc_menu_align_center' ); ?>"
					<?php echo 'center' === $selected_align ? 'checked' : '';?>
				>
					<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_menu_align_center' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

				<input class="switch-input screen-reader-text bgc" type="radio" value="right"
					name="<?php echo $field_name; ?>"
					id="<?php echo $this->get_field_id( 'bgc_menu_align_right' ); ?>"
					<?php echo 'right' === $selected_align ? 'checked' : '';?>
				>
					<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_menu_align_right' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
			</div>
		</div>
		<?php
	}

	/**
	 * Print Customizer Button.
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance An array of widget coni
	 */
	public function print_customizer_button( $instance ) {
		?>
			<div class="bgc_menu_container">
				<h4><?php _e( 'Additional Customization', 'boldgrid-editor' ); ?></h4>
				<p><?php _e( 'There are additional customization options available for this menu in the Customizer.', 'boldgrid-editor' ); ?></p>
				<button class="button bgc_goto_customizer" data-panel="headings" data-customize="<?php echo admin_url( '/customize.php' ); ?>"><?php _e( 'Go To Customizer', 'boldgrid-editor' ); ?></button>
			</div>
		<?php
	}

	/**
	 * Print Return to Editor Button.
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance An array of widget coni
	 */
	public function return_to_editor( $instance ) {
		?>
			<div class="bgc_menu_container">
				<h4><?php _e( 'What\'s Next?', 'boldgrid-editor' ); ?></h4>
				<p><?php _e( 'If you wish to continue editing your header layout, that can be done within the editor.', 'boldgrid-editor' ); ?></p>
				<button class="button bgc_return_to_editor" data-customize="<?php echo admin_url( '/customize.php' ); ?>"><?php _e( 'Return to Editor', 'boldgrid-editor' ); ?></button>
			</div>
		<?php
	}

	/**
	 * Print form styles
	 *
	 * @since 1.14.0
	 */
	public function print_form_styles() {
		?>
		<style>
		.bgc.buttonset {
			display: flex;
			flex-wrap: wrap;
		}
		.bgc.buttonset .switch-label {
			background: rgba(0, 0, 0, 0.1);
			border: 1px rgba(0, 0, 0, 0.1);
			color: #555d66;
			margin: 0;
			text-align: center;
			padding: 0.5em 1em;
			flex-grow: 1;
			display: -ms-flexbox;
			display: flex;
			-ms-flex-align: center;
			align-items: center;
			-ms-flex-pack: center;
			justify-content: center;
			justify-items: center;
			-ms-flex-line-pack: center;
			align-content: center;
			cursor: pointer;
		}

		.bgc.buttonset .switch-input:checked + .switch-label {
			background-color: #00a0d2;
			color: rgba(255, 255, 255, 0.8);
		}
		</style>
		<?php
	}

	/**
	 * Print form to adjust menu configs.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $instance Widget instance configs.
	 */
	public function form( $instance ) {
		$this->menu_registration_controls( $instance );
		$this->menu_alignment_controls( $instance );
		$this->print_customizer_button( $instance );
		$this->return_to_editor( $instance );
		$this->print_form_styles( $instance );
	}
}
