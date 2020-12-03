<?php
/**
* File: Logo.php
*
* Create a post component.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: Logo
*
* Create a logo component.
*
* @since 1.14.0
*/
class Logo extends \WP_Widget {

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
	 * Setup the widget configurations.
	 *
	 * @since 1.14.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_logo',
			__( 'Site Logo', 'boldgrid-editor' ),
			array(
				'classname' => 'bgc-logo',
				'description' => __( 'Inserts the site\'s logo into your header.', 'boldgrid-editor' )
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
	public function widget( $args, $instance ) {
		$logo_switch_val = isset( $instance['bgc_logo_switch'] ) ? $instance['bgc_logo_switch'] : 'site_logo';
		$alt_logo = isset( $instance['bgc_alt_logo'] );
		if ( 'site_logo' === $logo_switch_val ) {
			$logo_id = get_theme_mod( 'custom_logo' );
		} else {
			$logo_id = $alt_logo ? $instance['bgc_alt_logo'] : '';
		}

		$align_class = ! empty( $instance['bgc_logo_alignment'] ) ? $this->get_align_class( $instance['bgc_logo_alignment'] ) : 'center';

		echo '<a class="bgc_logo' . ( $alt_logo ? '' : ' custom-logo-link' ) . '" style="display:flex;justify-content:' . $align_class . ';" href="'. get_home_url() . '">';
		if ( wp_get_attachment_image( $logo_id, 'full' ) ) {
			echo wp_get_attachment_image( $logo_id, 'full', false, array( 'class' => 'custom-logo' ) );
		} else {
			echo '<p class="bgc_logo_placeholder custom-logo"><span class="dashicons dashicons-format-image"></span><span class="placeholder_text">';
			esc_html_e( '[Site Logo]', 'boldgrid-editor' );
		}
		echo '</span></p></a>';
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
				$align_class = 'flex-start';
				break;
			case ( 'right' ):
				$align_class = 'flex-end';
				break;
			default:
				$align_class = 'center';
				break;
		}

		return $align_class;
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
	 * Prints Logo Switch Control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_logo_switch( $instance ) {
		$field_name      = $this->get_field_name( 'bgc_logo_switch' );
		$selected_switch = ! empty( $instance['bgc_logo_switch'] ) ? $instance['bgc_logo_switch'] : 'site_logo';
		?>
		<h4><?php _e( 'Choose Logo', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc logo_switch">
			<input class="switch-input screen-reader-text bgc" type="radio" value="site_logo"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_logo_switch_site_logo' ); ?>"
				<?php echo 'site_logo' === $selected_switch ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_logo_switch_site_logo' ); ?>">Use Site Logo</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="alt_logo"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_logo_switch_alt_logo' ); ?>"
				<?php echo 'alt_logo' === $selected_switch ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_logo_switch_alt_logo' ); ?>">Use Alternate Logo</label>

		</div>
		<?php
	}

	/**
	 * Print Site Logo selector / previewer
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_site_logo( $instance ) {
		$name             = 'crio-premium-site-logo-preview';
		$value            = get_theme_mod( 'custom_logo' );
		$image_size       = 'full';
		$image_attributes = wp_get_attachment_image_src( $value, $image_size );
		?>
		<div class="bgc site_logo_selection">
			<div class="bgtfw-custom-meta__description">
				<p class="description">
					<?php esc_html_e( 'Site Logo', 'boldgrid-editor' ); ?>
				</p>
			</div>
		<?php

		if ( $image_attributes ) {
			?>
			<div>
				<a href="#" class="crio_premium_image_button"><img src="<?php echo esc_attr( $image_attributes[0] ); ?>" style="max-width:95%;display:block;" /></a>
				<?php wp_nonce_field( 'crio_premium_update_site_logo', 'crio_premium_update_site_logo_nonce' ); ?>
				<input type="hidden" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" />
				<p class="crio_premium_image_desc" style="display:inline-block"><?php esc_html_e( 'Click the image to edit or update', 'boldgrid-editor' ); ?></p>
				<a href="#" class="crio_premium_remove_image_button" style="display:inline-block;display:inline-block"><?php esc_html_e( 'Remove Image', 'boldgrid-editor' ); ?></a>
			</div>
			<?php

		} else {
			?>
			<div>
				<a href="#" class="crio_premium_image_button button"><?php esc_html_e( 'Upload Image', 'boldgrid-editor' ); ?></a>
				<?php wp_nonce_field( 'crio_premium_update_site_logo', 'crio_premium_update_site_logo_nonce' ); ?>
				<input type="hidden" name="<?php echo esc_attr( $name ); ?>" id="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>" />
				<p class="crio_premium_image_desc" style="display:none"><?php esc_html_e( 'Click the image to edit or update', 'boldgrid-editor' ); ?></p>
				<a href="#" class="crio_premium_remove_image_button" style="display:inline-block;display:none"><?php esc_html_e( 'Remove Image', 'boldgrid-editor' ); ?></a>
			</div>
			<?php
		}
		?>
		</div>
		<?php
	}

	/**
	 * Print Alt Logo selector / previewer
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_alt_logo( $instance ) {
		$name              = 'crio-premium-alt-logo-preview';
		$field_name        = $this->get_field_name( 'bgc_alt_logo' );
		$selected_alt_logo = ! empty( $instance['bgc_alt_logo'] ) ? $instance['bgc_alt_logo'] : '';
		$image_size        = 'full';
		$image_attributes  = wp_get_attachment_image_src( $selected_alt_logo, $image_size );
		?>
		<div class="bgc alt_logo_selection">
			<div class="bgtfw-custom-meta__description">
				<p class="description">
					<?php esc_html_e( 'Alternate Logo', 'boldgrid-editor' ); ?>
				</p>
			</div>
		<?php

		if ( $image_attributes ) {
			?>
			<div>
				<a href="#" class="crio_premium_image_button"><img src="<?php echo esc_attr( $image_attributes[0] ); ?>" style="max-width:95%;display:block;" /></a>
				<input type="hidden" name="<?php echo $field_name; ?>" id="<?php echo $field_name; ?>" value="<?php echo esc_attr( $selected_alt_logo ); ?>" />
				<p class="crio_premium_image_desc" style="display:inline-block"><?php esc_html_e( 'Click the image to edit or update', 'boldgrid-editor' ); ?></p>
				<a href="#" class="crio_premium_remove_image_button" style="display:inline-block;display:inline-block"><?php esc_html_e( 'Remove Image', 'boldgrid-editor' ); ?></a>
			</div>
			<?php

		} else {
			?>
			<div>
				<a href="#" class="crio_premium_image_button button"><?php esc_html_e( 'Upload Image', 'boldgrid-editor' ); ?></a>
				<input type="hidden" name="<?php echo $field_name; ?>" id="<?php echo $field_name; ?>" value="<?php echo esc_attr( $selected_alt_logo ); ?>" />
				<p class="crio_premium_image_desc" style="display:none"><?php esc_html_e( 'Click the image to edit or update', 'boldgrid-editor' ); ?></p>
				<a href="#" class="crio_premium_remove_image_button" style="display:inline-block;display:none"><?php esc_html_e( 'Remove Image', 'boldgrid-editor' ); ?></a>
			</div>
			<?php
		}
		?>
		</div>
		<?php
	}

	/**
	 * Prints Alignment Control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_alignment_control( $instance ) {
		$field_name     = $this->get_field_name( 'bgc_logo_alignment' );
		$selected_align = ! empty( $instance['bgc_logo_alignment'] ) ? $instance['bgc_logo_alignment'] : 'center';
		?>
		<h4><?php _e( 'Choose Logo Alignment', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">
			<input class="switch-input screen-reader-text bgc" type="radio" value="left"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_logo_align_left' ); ?>"
				<?php echo 'left' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_logo_align_left' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="center"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_logo_align_center' ); ?>"
				<?php echo 'center' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_logo_align_center' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="right"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_logo_align_right' ); ?>"
				<?php echo 'right' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_logo_align_right' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
		</div>
		<?php
	}


	/**
	 * Print our a form that allowing the widget configs to be updated.
	 *
	 * @since 1.14.0
	 *
	 * @param  array $instance Widget instance configs.
	 */
	public function form( $instance ) {
		$this->print_logo_switch( $instance );
		$this->print_site_logo( $instance );
		$this->print_alt_logo( $instance );
		$this->print_alignment_control( $instance );
		$this->print_form_styles();
	}

}
