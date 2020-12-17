<?php
/**
* File: HeadingWidget.php
*
* Creates a Heading Text widget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: HeadingWidget
*
* This is the base class for HeadingWidgets. This is extended by
* other widget classes ( such as SiteTitle, PageTitle, SisteDescription )
* to create different text based heading widgets for page header templates.
*
* @since 1.14.0
*/
class HeadingWidget extends \WP_Widget {

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
	 * Text String.
	 *
	 * @since 1.14.0
	 * @var string The string to be placed within the heading tags.
	 */
	public $text_string;

	/**
	 * Setup the widget configurations.
	 *
	 * @since 1.14.0
	 *
	 * @param string $component_slug  The component slug used for js instance as component.name.
	 * @param string $component_title The translatable title of the widget displayed to the user
	 * @param string $class_name      The class name to be used by the text element.
	 * @param string $component_desc  The translatable description used for the top of the settings form.
	 * @param string $text            The actual text to be displayed by the widget.
	 */
	public function __construct( $component_slug, $component_title, $class_name, $component_desc, $text ) {
		parent::__construct(
			$component_slug,
			$component_title,
			array(
				'classname' => $class_name,
				'description' => $component_desc
			)
		);

		$this->text_string = $text;
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
		$alignment = ! empty( $instance['bgc_title_alignment'] ) ? $instance['bgc_title_alignment'] : 'center';
		$htag      = ! empty( $instance['bgc_heading_type'] ) ? $instance['bgc_heading_type'] : 'h1';

		$styles = 'font-weight: inherit; text-transform: inherit; line-height: inherit; font-family: inherit; font-style: inherit; font-size: inherit; color: inherit; text-align:' . $alignment . ';';

		echo '<' . $htag . ' class="bgc_page_title" style="' . $styles . '">' . $this->text_string . '</' . $htag . '>';
	}


	/**
	 * Prints Heading Type Control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function heading_type_control( $instance ) {
		$field_name = $this->get_field_name( 'bgc_heading_type' );

		$selected_size = ! empty ( $instance['bgc_heading_type'] ) ? $instance['bgc_heading_type'] : 'h1';

		?>
		<h4><?php _e( 'Heading Type', 'boldgrid-builder' ); ?></h4>
		<div id="<?php echo $field_name ?>" class="buttonset bgc">

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h1" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h1' ); ?>"
				<?php echo ( 'h1' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-on bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h1' ); ?>">H1</label>

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h2" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h2' ); ?>"
				<?php echo ( 'h2' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h2' ); ?>">H2</label>

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h3" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h3' ); ?>"
				<?php echo ( 'h3' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h3' ); ?>">H3</label>

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h4" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h4' ); ?>"
				<?php echo ( 'h4' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h4' ); ?>">H4</label>

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h5" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h5' ); ?>"
				<?php echo ( 'h5' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h5' ); ?>">H5</label>

			<input class="switch-input screen-reader-text bgc"
				type="radio" value="h6" name="<?php echo $field_name ?>"
				id="<?php echo $this->get_field_id( 'bgc_heading_type_h6' ); ?>"
				<?php echo ( 'h6' === $selected_size ? 'checked' : '' ); ?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_heading_type_h6' ); ?>">H6</label>
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
		$field_name     = $this->get_field_name( 'bgc_title_alignment' );
		$selected_align = ! empty( $instance['bgc_title_alignment'] ) ? $instance['bgc_title_alignment'] : 'center';
		?>
		<h4><?php _e( 'Choose Heading Alignment', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">

			<input class="switch-input screen-reader-text bgc" type="radio" value="left"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_title_left_align' ); ?>"
				<?php echo 'left' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-on " for="<?php echo $this->get_field_id( 'bgc_title_left_align' ); ?>"><span class="dashicons dashicons-editor-alignleft"></span>Left</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="center"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_title_center_align' ); ?>"
				<?php echo 'center' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_title_center_align' ); ?>"><span class="dashicons dashicons-editor-aligncenter"></span>Center</label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="right"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'bgc_title_right_align' ); ?>"
				<?php echo 'right' === $selected_align ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'bgc_title_right_align' ); ?>"><span class="dashicons dashicons-editor-alignright"></span>Right</label>
		</div>
		<?php
	}

	/**
	 * Prints Default Font Notice
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_default_font( $instance ) {
		$default_typography = get_theme_mod( 'bgtfw_headings_typography' );
		?>
		<div class="bgc default-font-notice">
			<h4><?php esc_html_e( 'Default Heading', 'boldgrid-editor' ); ?></h4>
			<p><?php esc_html_e( 'The default typography styles used for this component are:', 'boldgrid-editor' ); ?>
			<?php
				foreach( $default_typography as $key => $value ) {
					?>
					<span class="bgc-default-style label"><?php echo esc_attr( $key ); ?>: </span>
					<span class="bgc-default-style <?php echo esc_attr( $key ); ?>"><?php echo esc_attr( $value ); ?></span><br/>
					<?php
				}
			?>
			</p>
			<p><?php esc_html_e( 'You can change the default font styles for your headings in the customizer under Fonts > Headings, or by ', 'boldgrid-editor' ); ?>
				<a class="bgc_goto_customizer" data-section="headings" data-customize="<?php echo admin_url( '/customize.php' ); ?>" href="#"><?php esc_html_e( 'clicking here', 'boldgrid-editor' ); ?></a>
			</p>
		</div>
		<?php
	}

	/**
	 * Print form styles
	 *
	 * @since 1.14.0
	 */
	public function print_form_styles() {
		$default_typography = get_theme_mod( 'bgtfw_headings_typography' );
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

		.bgc-default-style.label {
			padding-left: 5px;
			font-weight: 600;
		}

		.bgc-default-style.font-family {
			font-size: 20px;
			font-family: <?php echo esc_attr( $default_typography['font-family'] ); ?>;
		}
		</style>
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
		$this->print_alignment_control( $instance );
		$this->heading_type_control( $instance );
		$this->print_default_font( $instance );
		$this->print_form_styles();
	}
}
