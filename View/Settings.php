<?php
namespace Boldgrid\PPB\View;

class Settings {

	/**
	 * Add new page.
	 *
	 * @since 1.9.0
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'addPage' ) );
		add_action( 'admin_init', array( $this, 'settingsPageHooks' ) );

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

	public function isSettingsPage() {
		global $pagenow;

		$post_type = ! empty( $_GET['post_type'] ) ? $_GET['post_type'] : null;
		$page = ! empty( $_GET['page'] ) ? $_GET['page'] : null;

		return ( $pagenow && 'edit.php' === $pagenow && 'bgppb-settings' === $page && 'bg_block' === $post_type );
	}

	/**
	 * Settings Page Hooks.
	 *
	 * @return [type] [description]
	 */
	public function settingsPageHooks() {
		if ( ! $this->isSettingsPage() ) {
			return;
		}

		$this->enqueueScripts();
	}

	public function enqueueScripts() {
		add_action( 'admin_enqueue_scripts', function () {
			wp_enqueue_script(
				'bgppb-settings',
				\Boldgrid_Editor_Assets::get_webpack_script( 'settings' ),
				array( 'jquery', 'underscore' ), BOLDGRID_EDITOR_VERSION, true );

			wp_localize_script(
				'bgppb-settings',
				'BoldgridEditor = BoldgridEditor || {}; BoldgridEditor',
				[
					'customPostTypes' => $this->getCustomPostTypes(),
					'pluginVersion' => BOLDGRID_EDITOR_VERSION,
					'adminColors' => self::getAdminColors()
				]
			);

			wp_enqueue_script( 'bgppb-settings' );
		} );
	}

	public function getCustomPostTypes() {
		$types = get_post_types( [
			'public'   => true,
			'_builtin' => false
		], 'objects' );

		$formatted = [];
		foreach( $types as $type ) {
			if ( ! empty( $type->label ) ) {
				$formatted[] = [
					'value' => $type->name,
					'label' => $type->label,
				];
			}
		}

		return $formatted;
	}

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
		global $_wp_admin_css_colors;
		echo '<div class="wrap bg-content"><bgppb-settings-form/></div>';
	}
}
