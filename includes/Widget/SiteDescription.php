<?php
/**
* File: SiteDescription.php
*
* Creates a SiteDescription HeadingWidget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: SiteDescription
*
* Creates a SiteDescription HeadingWidget.
*
* @since 1.14.0
*/
class SiteDescription extends HeadingWidget {

		/**
	 * Setup the widget configurations.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_site_description',
			__( 'Site Description', 'boldgrid-editor' ),
			'bgc-site-description',
			__( 'Inserts the website\'s description ( tagline ) into your template.', 'boldgrid-editor' ),
			get_bloginfo( 'description' )
		);
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

		echo '<' . $htag . ' class="bgc_site_description" style="' . $styles . '">' . $this->text_string . '</' . $htag . '>';
	}

	/**
	 * Prints Default Font Notice
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_default_font( $instance ) {
		$default_typography = get_theme_mod( 'bgtfw_tagline_typography' );
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
			<p><?php esc_html_e( 'You can change the default font styles for your site description in the customizer under Design > Header > Tagline, or by ', 'boldgrid-editor' ); ?>
				<a class="bgc_goto_customizer" data-section="tagline" data-customize="<?php echo admin_url( '/customize.php' ); ?>" href="#"><?php esc_html_e( 'clicking here', 'boldgrid-editor' ); ?></a>
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
		$default_typography = get_theme_mod( 'bgtfw_tagline_typography' );
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
