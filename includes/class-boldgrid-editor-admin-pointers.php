<?php
/**
 * Class: class-boldgrid-editor-admin-pointers.php
 *
 * Adds admin pointers.
 *
 * @since      1.15.0
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Admin_Pointers
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Admin_Pointers.
 *
 * Register widget areas.
 *
 * @since      1.15.0
 */
class Boldgrid_Editor_Admin_Pointers {

	/**
	 * Constructor.
	 *
	 * @since 1.15.0
	 */
	public function __construct() {
		add_filter( 'boldgrid_editor_admin_pointers-post', array( $this, 'editor_pointers' ) );
		add_filter( 'boldgrid_editor_admin_pointers-page', array( $this, 'editor_pointers' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'pointer_load' ) );
	}

	/**
	 * Editor Pointers.
	 *
	 * Adds pointers to the Page / Post 'Edit' screen.
	 * This is a filter for the 'boldgrid_editor_admin_pointers-post' filter.
	 *
	 * @since 1.15.0
	 *
	 * @param array $pointers An array of pointers.
	 *
	 * @return array $pointers
	 */
	public function editor_pointers( $pointers ) {
		$pointers['fse1150'] = array(
			'target'  => '#mceu_18-button',
			'options' => array(
				'content'  => sprintf(
					'<h3> %s </h3> <p> %s </p>',
					__( 'Full Screen Editing', 'boldgrid-editor' ),
					__( 'This button will now allow you to switch to "fullscreen" while using Post and Page Builder. You can toggle this with Ctrl+Shift+F.','boldgrid-editor' )
				),
				'position' => array(
					'edge'  => 'right',
					'align' => 'middle',
				),
			),
		);
		return $pointers;
	}

	/**
	 * Pointer Load.
	 *
	 * Helper method to load pointers.
	 *
	 * @since 1.15.0
	 *
	 * @param string $hook_suffix The current admin page.
	 */
	public function pointer_load( $hook_suffix ) {
		error_log( json_encode( $hook_suffix ) );
		// Don't run on WP < 3.3
		if ( get_bloginfo( 'version' ) < '3.3' ) {
			return;
		}

		// Get the screen ID
		$screen    = get_current_screen();
		$screen_id = $screen->id;

		error_log( json_encode( $screen ) );
		// Get pointers for this screen
		$pointers = apply_filters( 'boldgrid_editor_admin_pointers-' . $screen_id, array() ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores

		error_log( json_encode( $pointers ) );
		// No pointers? Then we stop.
		if ( ! $pointers || ! is_array( $pointers ) ) {
			return;
		}

		// Get dismissed pointers
		$dismissed      = explode(
			',',
			(string) get_user_meta(
				get_current_user_id(),
				'dismissed_wp_pointers',
				true
			)
		);
		$valid_pointers = array();

		// Check pointers and remove dismissed ones.
		foreach ( $pointers as $pointer_id => $pointer ) {

			// Sanity check
			if ( in_array( $pointer_id, $dismissed )
				|| empty( $pointer )
				|| empty( $pointer_id )
				|| empty( $pointer['target'] )
				|| empty( $pointer['options'] ) ) {
				continue;
			}

			$pointer['pointer_id'] = $pointer_id;

			// Add the pointer to $valid_pointers array
			$valid_pointers['pointers'][] = $pointer;
		}

		// No valid pointers? Stop here.
		if ( empty( $valid_pointers ) ) {
			return;
		}

		error_log( json_encode( $valid_pointers ) );

		// Add pointers style to queue.
		wp_enqueue_script( 'wp-pointer' );
		wp_enqueue_style( 'wp-pointer' );

		error_log( plugins_url( '/assets/js/pointers.js', BOLDGRID_EDITOR_ENTRY ) );
		// Add pointers script to queue. Add custom script.
		wp_register_script(
			'boldgrid-editor-pointers',
			plugins_url( '/assets/js/pointers.js', BOLDGRID_EDITOR_ENTRY ),
			array( 'wp-pointer', 'boldgrid-editor-drag' ),
			BOLDGRID_EDITOR_VERSION,
			true
		);

		wp_enqueue_script( 'boldgrid-editor-pointers' );

		// Add pointer options to script.
		wp_localize_script( 'boldgrid-editor-pointers', 'boldgridEditorPointers', $valid_pointers );
	}
}
