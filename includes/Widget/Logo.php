<?php
/**
* File: PageTitle.php
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
class Logo extends \WP_Widget {

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
		the_custom_logo();
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
		<h4><?php _e( 'Choose Logo Alignment', 'boldgrid-editor' ); ?></h4>
		<p>
			<input type="radio"
				id="<?php echo $this->get_field_id( 'bgc_title_left_align' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_title_alignment' ); ?>"
				value="left"
				<?php echo ( ! empty( $instance['bgc_title_alignment'] ) && 'left' === $instance['bgc_title_alignment'] ) ? 'checked' : '';?>
			>
			<label for="<?php echo $this->get_field_id( 'bgc_title_left_align' ); ?>">Left</label>
			<input type="radio"
				id="<?php echo $this->get_field_id( 'bgc_title_center_align' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_title_alignment' ); ?>"
				value="center"
				<?php echo ( ! empty( $instance['bgc_title_alignment'] ) && 'center' === $instance['bgc_title_alignment'] ) ? 'checked' : '';?>
			>
			<label for="<?php echo $this->get_field_id( 'bgc_title_center_align' ); ?>">Center</label>
			<input type="radio"
				id="<?php echo $this->get_field_id( 'bgc_title_right_align' ); ?>"
				name="<?php echo $this->get_field_name( 'bgc_title_alignment' ); ?>"
				value="right"
				<?php echo ( ! empty( $instance['bgc_title_alignment'] ) && 'right' === $instance['bgc_title_alignment'] ) ? 'checked' : '';?>
			>
			<label for="<?php echo $this->get_field_id( 'bgc_title_right_align' ); ?>">Right</label>
		</p>
	<?php
	}

}
