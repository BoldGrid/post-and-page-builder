<?php
if ( ! class_exists( 'Boldgrid_Editor_Media_Tab' ) ) {
	require_once BOLDGRID_EDITOR_PATH . '/includes/media/class-boldgrid-editor-media-tab.php';
}

require_once BOLDGRID_EDITOR_PATH . '/autoload.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-config.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-crop.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-ajax.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-assets.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-mce.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-theme.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-preview.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-fs.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-version.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-option.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-premium.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-setup.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-activate.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-uninstall.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-service.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-upgrade.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-postmeta.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-setting.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-templater.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/class-boldgrid-editor-widget.php';

// Controls.
require_once BOLDGRID_EDITOR_PATH . '/controls/class-boldgrid-controls-page-title.php';

// Component.
require_once BOLDGRID_EDITOR_PATH . '/components/class-boldgrid-components-shortcode.php';

// Media.
require_once BOLDGRID_EDITOR_PATH . '/includes/media/class-boldgrid-editor-media.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/media/class-boldgrid-editor-media-tab.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/media/class-boldgrid-editor-layout.php';

// Gridblock Post types.
require_once BOLDGRID_EDITOR_PATH . '/includes/gridblock/class-boldgrid-editor-gridblock-post.php';

// Builder.
require_once BOLDGRID_EDITOR_PATH . '/includes/builder/class-boldgrid-editor-builder.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/builder/class-boldgrid-editor-builder-fonts.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/builder/class-boldgrid-editor-builder-styles.php';
require_once BOLDGRID_EDITOR_PATH . '/includes/builder/class-boldgrid-editor-builder-components.php';

// External resources support.
require_once BOLDGRID_EDITOR_PATH . '/support/wpforms/includes/class-boldgrid-editor-wpforms.php';
require_once BOLDGRID_EDITOR_PATH . '/support/bgtfw/class-boldgrid-editor-bgtfw-template.php';
