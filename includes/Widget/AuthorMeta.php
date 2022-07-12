<?php
/**
* File: AuthorMeta.php
*
* Create an AuthorMeta component.
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
class AuthorMeta extends \WP_Widget {

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
			'boldgrid_component_author_meta',
			__( 'Author Meta', 'boldgrid-editor' ),
			array(
				'classname' => 'bgc-author-meta',
				'description' => __( 'Inserts the chosen meta data for a post\'s author into your header.', 'boldgrid-editor' )
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
	public function widget( $args, $instance ) {
		$meta_name = ! empty( $instance['bgc_author_meta_fields'] ) ? $instance['bgc_author_meta_fields'] : 'display_name';
		$selected_align = ! empty( $instance['bgc_author_meta_alignment'] ) ? $instance['bgc_author_meta_alignment'] : 'center';
		$align_class = $this->get_align_class( $selected_align );
		?>
		<div class="bgc_component_author_meta" style="display:flex; justify-content:<?php echo esc_attr( $align_class ); ?>">
		<?php
			if ( 'avatar' === $meta_name ) {
				$this->print_avatar_image();
			} else {
				$this->print_author_meta( $meta_name );
			}
		?>
		</div>
		<?php
	}

	/**
	 * Print Avatar Image
	 *
	 * @since 1.14.0
	 */
	public function print_avatar_image() {
		$post          = get_post();
		$author_avatar = get_avatar( $post, 96, '', '', array( 'class' => 'bgc_avatar' ) );
		if ( $author_avatar ) {
			echo $author_avatar;
		} else {
			?>
			<p class="bgc_avatar_fail"><?php esc_html_e( 'Unable to retrieve avatar', 'boldgrid-editor' ); ?></p>
			<?php
		}
	}

	/**
	 * Print Author Meta
	 *
	 * @since 1.14.0
	 *
	 * @param string $meta_name The name of the meta field to display.
	 */
	public function print_author_meta( $meta_name ) {
		$meta_data = get_the_author_meta( $meta_name );
		if( ! $meta_data ) {
			$meta_data = '[' . strtoupper( str_replace( '_', ' ', $meta_name ) ) . ']';
		}
		?>
		<p class="bgc_author_meta <?php echo esc_attr( $meta_name ); ?>"><?php echo esc_html( $meta_data ); ?></p>
		<?php
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
	 * Prints Author Meta Field selector
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_field_selector( $instance ) {
		$field_name = $this->get_field_name( 'bgc_author_meta_fields' );
		$fields = array(
			'display_name' => 'Display Name',
			'first_name'   => 'First Name',
			'last_name'    => 'Last Name',
			'nickname'     => 'Nickname',
			'avatar'       => 'Avatar',
		);
		$selected_meta = ! empty( $instance['bgc_author_meta_fields'] ) ? $instance['bgc_author_meta_fields'] : 'display_name';
		?>
		<div class="bgc author_meta_field_selector">
			<h4><?php _e( 'Choose Author Meta Fields', 'boldgrid-editor' ); ?></h4>
			<div class="buttonset bgc">
			<?php foreach( $fields as $key => $value ) { ?>
				<input class="switch-input screen-reader-text bgc" type="radio" value="<?php echo esc_attr( $key ); ?>"
					name="<?php echo $field_name; ?>"
					id="<?php echo $this->get_field_id( 'bgc_author_meta_fields_' . $key ); ?>"
					<?php echo $key === $selected_meta ? 'checked' : '';?>
				>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_author_meta_fields_' . $key ); ?>"><?php echo esc_attr( $value ); ?></label>
			<?php } ?>
			</div>
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
		$field_name     = $this->get_field_name( 'bgc_author_meta_alignment' );
		$selected_align = ! empty( $instance['bgc_author_meta_alignment'] ) ? $instance['bgc_author_meta_alignment'] : 'center';
		?>
		<h4><?php _e( 'Choose Alignment', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">
			<input class="switch-input screen-reader-text bgc" type="radio" value="left"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_left' ); ?>"
				<?php echo 'left' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_left' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="center"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_center' ); ?>"
				<?php echo 'center' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_center' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="right"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_right' ); ?>"
				<?php echo 'right' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_author_meta_alignment_right' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
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
	 * Print our a form that allowing the widget configs to be updated.
	 *
	 * @since 1.0.0
	 *
	 * @param  array $instance Widget instance configs.
	 */
	public function form( $instance ) {
		$this->print_field_selector( $instance );
		$this->print_alignment_control( $instance );
		$this->print_form_styles();
	}

}
