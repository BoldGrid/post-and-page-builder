<?php
/**
* File: PostTags.php
*
* Create an PostTags component.
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
class PostTags extends \WP_Widget {

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
			'boldgrid_component_post_tags',
			__( 'Post Tags', 'boldgrid-editor' ),
			array(
				'classname'   => 'bgc-post-tags',
				'description' => __( 'Inserts the posts tags links.', 'boldgrid-editor' ),
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
		$selected_align = ! empty( $instance['bgc_post_tags_align'] ) ? $instance['bgc_post_tags_align'] : 'center';
		$align_class    = $this->get_align_class( $selected_align );

		?>
		<div class="bgc_component_post_tags" style="display:flex; justify-content:<?php echo esc_attr( $align_class ); ?>">
			<?php $this->print_tags(); ?>
		</div>
		<?php
	}

	/**
	 * Print Categories
	 *
	 * @since 1.14.0
	 *
	 */
	public function print_tags() {
		global $post;
		$single_tag_icon   = get_theme_mod( 'bgtfw_posts_tag_icon' );
		$multiple_tag_icon = get_theme_mod( 'bgtfw_posts_tags_icon' );
		/* translators: used between each tag list item, there is a space after the comma */
		$tags_list = get_the_tag_list( '', esc_html__( ', ', 'boldgrid-editor' ) );

		if ( $tags_list ) {
			$icon  = $single_tag_icon;
			$class = 'singular';

			$tags_count = count( explode( ', ', $tags_list ) );

			if ( $tags_count > 1 ) {
				$icon  = $multiple_tag_icon;
				$class = 'multiple';
			}

			// Note: The variable $tags_list uses get_the_tag_list above, which internally calls get_the_term_list, and is considered safe for output without escaping.
			printf(
				'<span class="tags-links %1$s"><i class="fa fa-fw fa-%2$s" aria-hidden="true"></i> %3$s</span>',
				esc_attr( $class ),
				esc_attr( $icon ),
				$tags_list // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			);
		}

		if ( ! $post ) {
			printf(
				'<span class="tags-links"><i class="fa fa-fw fa-%1$s" aria-hidden="true"></i><a>[TAGS]</a></span>',
				esc_attr( $single_tag_icon ),
			);
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
	 * Prints Alignment Control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_alignment_control( $instance ) {
		$field_name     = $this->get_field_name( 'bgc_post_tags_align' );
		$selected_align = ! empty( $instance['bgc_post_tags_align'] ) ? $instance['bgc_post_tags_align'] : 'center';
		?>
		<h4><?php _e( 'Choose Alignment', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">
			<input class="switch-input screen-reader-text bgc" type="radio" value="left"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_tags_align_left' ); ?>"
				<?php echo 'left' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_post_tags_align_left' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="center"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_tags_align_center' ); ?>"
				<?php echo 'center' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_post_tags_align_center' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="right"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_post_tags_align_right' ); ?>"
				<?php echo 'right' === $selected_align ? 'checked' : ''; ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_post_tags_align_right' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
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
		$this->print_alignment_control( $instance );
		$this->print_form_styles();
	}

}
