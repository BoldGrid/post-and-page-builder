<?php
/**
* File: SiteTitle.php
*
* Creates a SiteTitle HeadingWidget.
*
* @since      1.14.0
* @package    Boldgrid_Components
* @subpackage Boldgrid_Components_Shortcode
* @author     BoldGrid <support@boldgrid.com>
* @link       https://boldgrid.com
*/

namespace Boldgrid\PPB\Widget;

/**
* Class: SiteTitle
*
* Creates a SiteTitle HeadingWidget.
*
* @since 1.14.0
*/
class SiteTitle extends HeadingWidget {

	/**
	 * Setup the widget configurations.
	 *
	 * @since 1.14.0
	 */
	public function __construct() {
		parent::__construct(
			'boldgrid_component_site_title',
			__( 'Site Title', 'boldgrid-editor' ),
			'bgc-site-title',
			__( 'Inserts the website\'s title into your template.', 'boldgrid-editor' ),
			get_bloginfo( 'name' )
		);
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
		$this->print_link_control( $instance );
		$this->print_default_font( $instance );
		$this->print_form_styles();
	}

	/**
	 * Prints Link Control
	 *
	 * @since 1.14.0
	 *
	 * @param array $instance Widget instance configs.
	 */
	public function print_link_control( $instance ) {
		$field_name      = $this->get_field_name( 'bgc_link_to_home' );
		$link_to_home    = isset( $instance['bgc_link_to_home'] ) ? $instance['bgc_link_to_home'] : '1';
		?>
		<h4><?php _e( 'Link to Home?', 'boldgrid-editor' ); ?></h4>
		<div class="buttonset bgc">

			<input class="switch-input screen-reader-text bgc" type="radio" value="1"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'link_to_home_on' ); ?>"
				<?php echo '1' === $link_to_home ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-on bgc" for="<?php echo $this->get_field_id( 'link_to_home_on' ); ?>"><span class="dashicons dashicons-yes"></span></label>

			<input class="switch-input screen-reader-text bgc" type="radio" value="0"
				name="<?php echo $field_name; ?>"
				id="<?php echo $this->get_field_id( 'link_to_home_off' ); ?>"
				<?php echo '0' === $link_to_home ? 'checked' : '';?>
			>
				<label class="switch-label switch-label-off bgc" for="<?php echo $this->get_field_id( 'link_to_home_off' ); ?>"><span class="dashicons dashicons-no"></span></label>
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
		$default_typography = get_theme_mod( 'bgtfw_site_title_typography' );
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
			<p><?php esc_html_e( 'You can change the default font styles for your site title in the customizer under Design > Header > Site Title, or by ', 'boldgrid-editor' ); ?>
				<a class="bgc_goto_customizer" data-section="site_title" data-customize="<?php echo admin_url( '/customize.php' ); ?>" href="#"><?php esc_html_e( 'clicking here', 'boldgrid-editor' ); ?></a>
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
		$default_typography = get_theme_mod( 'bgtfw_site_title_typography' );
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
	 * Render a widget.
	 *
	 * @since 1.14.0
	 *
	 * @param  array $args     General widget configurations.
	 * @param  array $instance Widget instance arguments.
	 */
	public function widget( $args, $instance )  {
		$alignment    = ! empty( $instance['bgc_title_alignment'] ) ? $instance['bgc_title_alignment'] : 'center';
		$htag         = ! empty( $instance['bgc_heading_type'] ) ? $instance['bgc_heading_type'] : 'h1';
		$link_to_home = isset( $instance['bgc_link_to_home'] ) && '0' === $instance['bgc_link_to_home'] ? false : true;
		$styles = 'text-decoration: inherit; font-weight: inherit; text-transform: inherit; line-height: inherit; font-family: inherit; font-style: inherit; font-size: inherit; color: inherit; text-align:' . $alignment . ';';
		$home_link_markup   = '<a href ="' . get_home_url() . '" style="' . $styles . '">' . $this->text_string . '</a>';
		$site_title         = $link_to_home ? $home_link_markup : $this->text_string;

		echo '<' . $htag . ' class="bgc_site_title ' . ( $link_to_home ? 'site-title' : '' ) . '" style="' . $styles . '">' . $site_title . '</' . $htag . '>';
	}
}