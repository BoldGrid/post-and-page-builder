<?php
/**
* File: PostDate.php
*
* Create an PostDate component.
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
class PostDate extends \WP_Widget {

	/**
	 * Default widget wrappers.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	public static $widgetArgs = array(
		'before_title'  => '',
		'after_title'   => '',
		'before_widget' => '<div class="widget">',
		'after_widget'  => '</div>',
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
			'boldgrid_component_post_date',
			__( 'Post Date', 'boldgrid-editor' ),
			array(
				'classname'   => 'bgc-post-date',
				'description' => __( 'Inserts the posted / updated time for the page / post.', 'boldgrid-editor' ),
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
		$selected_align = ! empty( $instance['bgc_post_date_align'] ) ? $instance['bgc_post_date_align'] : 'center';
		$align_class    = $this->get_align_class( $selected_align );
		$date_format    = ! empty( $instance['bgc_post_date_format'] ) ? $instance['bgc_post_date_format'] : 'date';
		?>
		<div class="bgc_component_post_date" style="display:flex; justify-content:<?php echo esc_attr( $align_class ); ?>">
			<?php $this->print_date( $date_format ); ?>
		</div>
		<?php
	}

	/**
	 * Print Date
	 *
	 * @since 1.14.0
	 *
	 * @param string $date_format Date Format
	 */
	public function print_date( $date_format ) {
		global $post;

		if ( ! $post && 'date' === $date_format ) {
			?>
				<p class="bgc_post_date <?php echo esc_attr( $date_format ); ?>"><?php echo 'Posted On [POSTED DATE]'; ?></p>
			<?php
			return;
		}

		if ( ! $post && 'timeago' === $date_format ) {
			?>
				<p class="bgc_post_date <?php echo esc_attr( $date_format ); ?>"><?php echo 'Posted [TIME AGO]'; ?></p>
			<?php
			return;
		}

		$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
		$time_string = sprintf(
			$time_string,
			esc_attr( get_the_date( 'c' ) ),
			esc_html( get_the_date() ),
		);
		if ( get_the_time( 'U', $post->ID ) !== get_the_modified_time( 'U', $post->ID ) ) {
			$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
			$time_string = sprintf(
				$time_string,
				esc_attr( get_the_modified_date( 'c' ) ),
				esc_html( get_the_modified_date() )
			);
		}

		if ( 'timeago' === $date_format ) {
			if ( get_the_time( 'U', $post->ID ) !== get_the_modified_time( 'U', $post->ID ) ) {
				$posted_on = sprintf(
					esc_html_x( 'Updated %s ago', '%s = human-readable time difference', 'boldgrid-editor' ),
					human_time_diff( get_the_modified_time( 'U', $post->ID ), current_time( 'U' ) )
				);
			}
		}

		if ( 'date' === $date_format ) {
			$posted_on = sprintf(
				esc_html_x( 'Posted on %s', 'post date', 'boldgrid-editor' ),
				$time_string
			);
			if ( get_the_time( 'U', $post->ID ) !== get_the_modified_time( 'U', $post->ID ) ) {
				$posted_on = sprintf(
					esc_html_x( 'Updated on %s', 'post date', 'boldgrid-editor' ),
					$time_string
				);
			}
		}
		?>
		<p class="bgc_post_date <?php echo esc_attr( $date_format ); ?>"><?php echo wp_kses_post( $posted_on ); ?></p>
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
	 * Prints Posted On format control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_format_control( $instance ) {
		$field_name      = $this->get_field_name( 'bgc_post_date_format' );
		$selected_format = ! empty( $instance['bgc_post_date_format'] ) ? $instance['bgc_post_date_format'] : 'date';

		?>
		<h4><?php _e( 'Choose Date Display Type', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">
			<input class="switch-input screen-reader-text bgc" type="radio" value="date"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_date_format_date' ); ?>"
				<?php echo 'date' === $selected_format ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_post_date_format_date' ); ?>"><span class="fa fa-calendar"></span>Date</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="timeago"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_date_format_timeago' ); ?>"
				<?php echo 'timeago' === $selected_format ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_post_date_format_timeago' ); ?>"><span class="fa fa-cc"></span>Human Readable</label>

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
		$field_name     = $this->get_field_name( 'bgc_post_date_align' );
		$selected_align = ! empty( $instance['bgc_post_date_align'] ) ? $instance['bgc_post_date_align'] : 'center';
		?>
		<h4><?php _e( 'Choose Alignment', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">
			<input class="switch-input screen-reader-text bgc" type="radio" value="left"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_date_align_left' ); ?>"
				<?php echo 'left' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_post_date_align_left' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="center"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_date_align_center' ); ?>"
				<?php echo 'center' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_post_date_align_center' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="right"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_date_align_right' ); ?>"
				<?php echo 'right' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_post_date_align_right' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
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
		$this->print_format_control( $instance );
		$this->print_alignment_control( $instance );
		$this->print_form_styles();
	}
}
