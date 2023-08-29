<?php
/**
 * File: Settings.php
 *
 * Settings Page View.
 *
 * @since      1.9.0
 * @package    Boldgrid
 * @subpackage Boldgrid\PPB\View\Settings
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */
namespace Boldgrid\PPB\View;

/**
 * Class: Settings
 *
 * Settings Page View.
 *
 * @since      1.9.0
 */
class Settings {

	/**
	 * Add new page.
	 *
	 * @since 1.9.0
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'addPage' ) );
		add_action( 'admin_init', array( $this, 'settingsPageHooks' ) );
		add_action( 'admin_init', array( $this, 'formActionRoute' ) );
		add_action( 'bgppb_form_default_editor', array( $this, 'submitDefaultEditor' ) );
	}

	/**
	 * Add the Builders settings page.
	 *
	 * @since 1.9.0
	 */
	public function addPage() {
		add_submenu_page(
			'edit.php?post_type=bg_block',
			'Post and Page Builder Settings',
			'Settings',
			'manage_options',
			'bgppb-settings',
			array( $this, 'getPageContent' )
		);
	}

	/**
	 * Is this the settings page.
	 *
	 * @since 1.9.0
	 *
	 * @return boolean
	 */
	public function isSettingsPage() {
		$page = ! empty( $_REQUEST['page'] ) ? $_REQUEST['page'] : null;
		return ( 'bgppb-settings' === $page );
	}

	/**
	 * Settings Page Hooks.
	 *
	 * @since 1.9.0
	 */
	public function settingsPageHooks() {
		if ( ! $this->isSettingsPage() ) {
			return;
		}

		$this->enqueueScripts();

		add_filter( 'admin_body_class', function( $classes ) {
			$classes .= ' bgppb-page bgppb-page--settings ';
			return $classes;
		} );
	}

	/**
	 * Enqueue Scripts and Styles.
	 *
	 * @since 1.9.0
	 */
	public function enqueueScripts() {
		add_action( 'admin_enqueue_scripts', function () {
			wp_enqueue_script(
				'bgppb-settings',
				\Boldgrid_Editor_Assets::get_webpack_script( 'settings' ),
				array( 'jquery', 'underscore' ), BOLDGRID_EDITOR_VERSION, true );

			wp_localize_script(
				'bgppb-settings',
				'BoldgridEditor = BoldgridEditor || {}; BoldgridEditor',
				$this->getJSVars()
			);

			\Boldgrid_Editor_Assets::enqueue_webpack_style( 'settings' );
		} );
	}

	/**
	 * Get any JS Variables needed for page.
	 *
	 * @since 1.9.0
	 *
	 * @return array List of JS Variables.
	 */
	public function getJSVars() {
		return array_merge( \Boldgrid_Editor_Service::get( 'assets' )->get_shared_vars(), [
			'adminColors' => self::getAdminColors(),
			'cards' => $this->getCards(),
		] );
	}

	/**
	 * Get colors used by the admin interface.
	 *
	 * @since 1.9.0
	 *
	 * @return array Colors Used.
	 */
	public static function getAdminColors() {
		global $_wp_admin_css_colors;
		$palette = get_user_option( 'admin_color' );

		$colors = [];
		if ( ! empty( $_wp_admin_css_colors ) && ! empty( $palette ) && ! empty( $_wp_admin_css_colors[ $palette ]->colors ) ) {
			$colors = $_wp_admin_css_colors[ $palette ];
		}

		return $colors;
	}

	/**
	 * Get the settings page content.
	 *
	 * @since 1.9.0
	 *
	 * @return string Page Content.
	 */
	public function getPageContent() {
		echo '<div class="wrap bg-content"><bgppb-settings-view/></div>';
	}

	/**
	 * Route form actions where needed.
	 *
	 * @since 1.9.0
	 */
	public function formActionRoute() {

		// User must be authenticated
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Only handle ppb form actions
		if ( empty( $_REQUEST['bgppb-form-action'] ) ) {
			return;
		}

		// Only accept forms with a nonce
		if ( empty( $_REQUEST['bgppb-form-action-nonce'] ) ) {
			return;
		}

		// Validate the nonce
		if ( wp_verify_nonce( $_REQUEST['bgppb-form-action-nonce'], 'bgppb_form_action_nonce' ) ) {
			$action = sanitize_text_field( $_REQUEST['bgppb-form-action'] );
			do_action( 'bgppb_form_' . $action );
		}
	}

	/**
	 * Handle the form submission for default editor.
	 *
	 * This action is called by the formActionRoute method.
	 * Nonce validation is handled by the formActionRoute method.
	 *
	 * @since 1.9.0
	 */
	public function submitDefaultEditor() {
		$post_types = ! empty( $_POST['bgppb_post_type'] ) ? $_POST['bgppb_post_type'] : [];
		\Boldgrid_Editor_Service::get( 'settings' )->save_default_editor( $post_types );
	}

	/**
	 * Get HTML for cards.
	 *
	 * @since 1.11.2
	 *
	 * @return array List of cards.
	 */
	protected function getCards() {
		$premium = new Card\Premium();
		$premium->init();

		$editor = new Card\Editor();
		$editor->init();

		return [
			'premium' => $premium->printCard( false ),
			'editor' => $editor->printCard( false ),
		];
	}
}
