<?php
/**
 * Class: Boldgrid_Editor_Setting
 *
 * Handle settings.
 *
 * @since      1.9.0
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Setting
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Setting
 *
 * Handle settings.
 *
 * @since      1.9.0
 */
class Boldgrid_Editor_Setting {

	/**
	 * Bind events.
	 *
	 * @since 1.9.0
	 *
	 * @param  integer $post_id Current Post ID.
	 */
	public function init( $post_id ) {
		add_action( 'admin_init', function () use ( $post_id ) {
			Boldgrid_Editor_Service::get( 'settings' )->save_meta_editor( $post_id );
		} );

		add_action( 'save_post', array( $this, 'save_meta_editor' ), 10, 2 );
	}

	/**
	 * Update the list of available editors.
	 *
	 * @since 1.9.0
	 *
	 * @param array $configs Configurations.\
	 */
	public static function set_available_editors( $configs ) {
		if ( function_exists( 'register_block_type' ) ) {
			$configs['valid_editors'][] = 'modern';
		}

		return $configs;
	}

	/**
	 * Get the editor override.
	 *
	 * @since 1.9.0
	 *
	 * @return string Text field
	 */
	public static function get_editor_override() {
		return ! empty( $_POST['bgppb_default_editor_post'] ) ?
			sanitize_text_field( $_POST['bgppb_default_editor_post'] ) : null;
	}

	/**
	 *  Save the default editor used for the post.
	 *
	 * @since 1.9.0
	 *
	 * @param  WP_Post $post_id Post Object.
	 */
	public function save_meta_editor( $post_id ) {
		$post = get_post( $post_id );
		$default_editor = self::get_editor_override();

		if ( $default_editor && $post ) {
			update_post_meta(
				$post->ID,
				'_bgppb_default_editor',
				$default_editor
			);
		}
	}

	/**
	 * Get the Default Editor.
	 *
	 * @since 1.9.0
	 *
	 * @param WP_Post A post to check.
	 * @return string Name of the default editor.
	 */
	public function get_default_editor( $post, $post_type ) {
		$default_editor = $this->get_saved_editor_options();
		$post_type = ! empty( $post->post_type ) ? $post->post_type : $post_type;
		return ! empty( $default_editor[ $post_type ] ) ?
			$default_editor[ $post_type ] : 'default';
	}

	/**
	 * Get all saved settings.
	 *
	 * @since 1.9.0
	 *
	 * @return array Settings
	 */
	public function get_all() {
		global $post;

		return [
			'current_editor' => $this->get_current_editor( $post ),
			'default_editor' => $this->get_saved_editor_options()
		];
	}

	/**
	 * Get the editor options saved and to be used by default.
	 *
	 * @since 1.9.0
	 *
	 * @return array Options.
	 */
	public function get_saved_editor_options() {
		$default_editor = Boldgrid_Editor_Option::get( 'default_editor', [] );

		$valid_editors = Boldgrid_Editor_Service::get( 'config' )['valid_editors'];
		$initial_editor_setting = [];
		$all_post_types = $this->get_all_cpts();
		foreach( $all_post_types as $post_type ) {
			$initial_editor_setting[ $post_type ] = ! empty( $default_editor[ $post_type ] )
				&& in_array( $default_editor[ $post_type ], $valid_editors, true ) ?
				$default_editor[ $post_type ] : $this->get_initial_editor_option( $post_type );
		}

		return $initial_editor_setting;
	}

	/**
	 * Get the custom post types used.
	 *
	 * @since 1.9.0
	 *
	 * @return array Custom post types.
	 */
	public function get_custom_post_types() {
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

		// Add Crio Page headers to the Settings list.
		if ( post_type_exists( 'crio_page_header' ) ) {
			$formatted[] = array(
				'value' => 'crio_page_header',
				'label' => 'Crio Page Headers'
			);
		}

		usort( $formatted, function ( $a, $b ) {
			return strcmp( $a['label'], $b['label'] );
		} );

		return $formatted;
	}

	/**
	 * Are we using gutenberg?
	 *
	 * @since 1.9.0
	 *
	 * @return boolean
	 */
	public function is_block_editor( $use_block_editor ) {
		global $post;

		$editor = $this->get_current_editor( $post );
		if ( in_array( $editor, [ 'classic', 'bgppb' ] ) ) {
			$use_block_editor = false;
		} else if ( 'modern' === $editor ) {
			$use_block_editor = true;
		}

		return $use_block_editor;
	}

	/**
	 * Save the default editor choices to the DB.
	 *
	 * @since 1.9.0
	 *
	 * @param  array $choices Editor choices.
	 * @return                Editor choice.
	 */
	public function save_default_editor( $choices ) {
		$saved_options = Boldgrid_Editor_Option::get( 'default_editor' );
		$all_post_types = $this->get_all_cpts();
		$valid_editors = Boldgrid_Editor_Service::get( 'config' )['valid_editors'];

		// Loop through all post types and validate the choice.
		foreach( $all_post_types as $post_type ) {
			if ( ! empty( $choices[ $post_type ] ) ) {
				$editor = in_array( $choices[ $post_type ], $valid_editors, true ) ?
					$choices[ $post_type ] : $this->get_initial_editor_option( $post_type );

				$saved_options[ $post_type ] = $editor;
			}
		}

		Boldgrid_Editor_Option::update( 'default_editor', $saved_options );

		return $saved_options;
	}

	/**
	 * Get the initial editor option.
	 *
	 * Basically Custom Post types should continue to use whatever editor they
	 * currently use unless the user explicitly sets it otherwise.
	 *
	 * @since 1.9.0
	 *
	 * @param  string $post_type Post Type.
	 * @return string            Editor option.
	 */
	public function get_initial_editor_option( $post_type ) {
		$configs = Boldgrid_Editor_Service::get( 'config' );

		$initial_editor_option = 'default';

		if ( in_array( $post_type, $configs[ 'allowed_post_types' ] ) ) {
			$initial_editor_option = 'bgppb';
		}

		return $initial_editor_option;
	}

	/**
	 * Get the editor chosen for the current post.
	 *
	 * @since 1.9.0
	 *
	 * @return string editor.
	 */
	public function get_current_editor( $post = null, $post_type = null ) {
		$default_editor_override = ! empty( $_POST['bgppb_default_editor_post'] ) ?
			sanitize_text_field( $_POST['bgppb_default_editor_post'] ) : null;

		$default_editor = $default_editor_override ?: $this->get_default_editor( $post, $post_type );
		if ( ! $default_editor_override && $post ) {
			$default_editor = get_post_meta( $post->ID, '_bgppb_default_editor', true ) ?: $default_editor;
		}

		return $default_editor;
	}

	/**
	 * Get all Custom Post Types.
	 *
	 * @since 1.9.0
	 *
	 * @return array Custom Post Type names.
	 */
	protected function get_all_cpts() {
		/*
		 * As of 1.14.0 this is broken down into multiple statements
		 * to make it easier to add other custom post types to the list that
		 * may not be public, such as the 'crio_page_headers'.
		 */
		$wp_post_types = array( 'post', 'page' );
		$cpts          = get_post_types(
			array(
				'public'   => true,
				'_builtin' => false,
			),
			'names'
		);

		$all_cpts = array_merge( $wp_post_types, $cpts );

		if ( post_type_exists( 'crio_page_header' ) ) {
			$page_headers  = array( 'crio_page_header' => 'crio_page_header' );
			$all_cpts = array_merge( $all_cpts, $page_headers );
		}
		return $all_cpts;
	}
}
