<?php
/**
* File: class-bgcs-single.php
*
* Create a post component.
*
* @since      1.8.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

/**
* Class: Boldgrid_Components_Post
*
* Create a post component.
*
* @since 1.8.0
*/
class Boldgrid_Components_Post extends WP_Widget {

	/**
	 * Default widget wrappers.
	 *
	 * @since 1.8.0
	 * @var array
	 */
	public static $default_params = array(
		'before_title' => '<h2 class="widget-title">',
		'after_title' => '</h2>',
		'before_widget' => '<div class="widget">',
		'after_widget' => '</div>',
	);

	/**
	 * Setup the widget configurations.
	 *
	 * @since 1.8.0
	 */
	public function __construct() {
		$id = 'boldgrid_component_post';

		parent::__construct(
			$id,
			__( 'Single Post', 'boldgrid-editor' ),
			array(
				'classname' => 'boldgrid-component-single',
				'description' => __( 'Display a Post Excerpt.', 'boldgrid-editor' )
			)
		);
	}

	/**
	 * Render a widget.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $args     General widget configurations.
	 * @param  array $instance Widget instance arguments.
	 */
	public function widget( $args, $instance )  {
		global $post;

		$args = array_merge( self::$default_params, $args );

		echo $args['before_widget'];

		$post = ! empty( $instance['selected_post'] ) ? get_post( $instance['selected_post'] ) : null;

		if ( $post ) {
			setup_postdata( $post );
			 ?>

			<a href="<?php print get_the_permalink( $post ); ?>">
				<?php if ( ! empty( $instance['show_title'] ) ) {
					echo $args['before_title'];
					print get_the_title( $post );
					echo $args['after_title'];
				} ?>
			</a>

			<?php if ( ! empty( $instance['thumbnail'] ) ) {
				print get_the_post_thumbnail( $post, $instance['image_size'] );
			} ?>

			<?php if ( ! empty( $instance['excerpt'] ) ) { ?>
				<p class="bgc-single-readmore">
					<?php print get_the_excerpt( $post ); ?>
				</p>
			<?php } ?>

			<?php if ( ! empty( $instance['read_more'] ) ) {
				?>
				<p class="bgc-single-readmore">
					<a href="<?php print get_the_permalink( $post ); ?>"><?php _e( 'Read More', 'boldgrid-editor' ); ?></a>
				</p>
		<?php	}
		} else { ?>
			<?php
			echo $args['before_title'];
			_e( 'No post selected yet', 'boldgrid-editor' );
			echo $args['after_title'];
			?>
		<?php }

		echo $args['after_widget'];
	}

	/**
	 * Update a widget with a new configuration.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $new_instance New instance configuration.
	 * @param  array $old_instance Old instance configuration.
	 * @return array               Updated instance config.
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = array();

		$instance['selected_post'] =  ! empty( $new_instance['selected_post'] ) ?
			intval( $new_instance['selected_post'] ) : '';

		$instance['show_title'] = ! empty( $new_instance['show_title'] ) ?
			strip_tags( $new_instance['show_title'] ) : '';

		$instance['thumbnail'] = ! empty( $new_instance['thumbnail'] ) ?
			strip_tags( $new_instance['thumbnail'] ) : '';

		$instance['excerpt'] = ! empty( $new_instance['excerpt'] ) ?
			strip_tags( $new_instance['excerpt'] ) : '';

		$instance['read_more'] = ! empty( $new_instance['read_more'] ) ? '1' : '';

		$instance['image_size'] = ! empty( $new_instance['image_size'] ) ?
			strip_tags( $new_instance['image_size'] ) : 'medium';

		return $instance;
	}

	/**
	 * Print our a form that allowing the widget configs to be updated.
	 *
	 * @since 1.8.0
	 *
	 * @param  array $instance Widget instance configs.
	 */
	public function form( $instance ) {
		global $_wp_additional_image_sizes;

		$defaults = array(
			'selected_post' => '0',
			'title' => 'title',
			'thumbnail' => 'thumbnail',
			'excerpt' => 'excerpt',
			'read_more' => '1',
			'image_size' => 'medium'
		);

		$instance = wp_parse_args( (array) $instance, $defaults ); ?>
		<p>
			<h4><?php _e( 'Select your post:', 'boldgrid-editor' ); ?></h4>

		<?php
		$wp_query = new WP_Query( array(
			'post_type' => 'post',
			'posts_per_page' => -1
		) );

		if ( $wp_query->have_posts() ) { ?>
			<select style="width: 100%;"
				id='<?php echo $this->get_field_id( 'selected_post' ); ?>'
				name="<?php echo $this->get_field_name( 'selected_post' ); ?>">
			<option value="0" <?php selected( $instance['selected_post'], '0' );
				?>><?php _e( 'No Post Selected', 'boldgrid-editor' ); ?></option>
			<?php
			while ( $wp_query->have_posts() ) {
				$wp_query->the_post(); ?>
				<option value="<?php echo get_the_ID(); ?>"
					<?php selected( $instance['selected_post'], get_the_ID() ); ?>><?php the_title(); ?></option>
			<?php } ?>
			</select>
			<?php
		} else {
			?><p><strong><?php _e( 'No posts found', 'boldgrid-editor' ); ?></strong></p><?php
		}
		?>
		</p>

		<p>
			<h4><?php _e( 'Choose the layout options:', 'boldgrid-editor' ) ?></h4>

			<input type="checkbox" class="checkbox" id="<?php echo $this->get_field_id( 'show_title' ); ?>"
				name="<?php echo $this->get_field_name( 'show_title' ); ?>"
				value="title" <?php echo ( 'title' === $instance['title'] ) ? 'checked' : ''; ?> />
			<label for="<?php echo $this->get_field_id( 'show_title' ); ?>"><?php _e( 'Show Title', 'boldgrid-editor' ) ?></label>
			<br>

			<input type="checkbox" class="checkbox" id="<?php echo $this->get_field_id( 'excerpt' ); ?>"
				name="<?php echo $this->get_field_name( 'excerpt' ); ?>"
				value="excerpt" <?php echo ( 'excerpt' === $instance['excerpt'] ) ? 'checked' : ''; ?> />
			<label for="<?php echo $this->get_field_id('excerpt'); ?>"><?php _e( 'Post excerpt', 'boldgrid-editor' ) ?></label>
			<br>

			<input type="checkbox" class="checkbox" id="<?php echo $this->get_field_id( 'read_more' ); ?>"
				name="<?php echo $this->get_field_name( 'read_more' ); ?>"
				value="thumbnail" <?php checked( $instance['read_more'], '1' ); ?> />
			<label for="<?php echo $this->get_field_id('thumbnail'); ?>"><?php _e( 'Read More Link', 'boldgrid-editor' ) ?></label>
			<br>

			<input type="checkbox" class="checkbox" id="<?php echo $this->get_field_id( 'thumbnail' ); ?>"
				name="<?php echo $this->get_field_name( 'thumbnail' ); ?>"
				value="thumbnail" <?php echo ( 'thumbnail' === $instance['thumbnail'] ) ? 'checked' : ''; ?> />
			<label for="<?php echo $this->get_field_id('thumbnail'); ?>"><?php _e( 'Post thumbnail', 'boldgrid-editor' ) ?></label>
			<br>

			<h4><?php _e( 'Choose the post image size:', 'boldgrid-editor' ) ?></h4>

			<select name="<?php echo $this->get_field_name( 'image_size' ); ?>"
				id="<?php echo $this->get_field_id('image_size'); ?>">
				<?php
				foreach ( get_intermediate_image_sizes() as $image_size ) {
					$label = preg_replace( '/[\-\_]/', ' ', $image_size );
					$label = ucfirst( $label ); ?>
					<option <?php selected( $instance['image_size'], $image_size ); ?>
						value="<?php echo $image_size; ?>">
						<?php echo $label; ?>
					</option>
					<?php
				}
				?>
			</select>
		</p>

		<?php
	}
}
