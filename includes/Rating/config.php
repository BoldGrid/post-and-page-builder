<?php
/**
 * File: config.php
 *
 * @link https://www.boldgrid.com
 * @since 1.10.0
 *
 * @package    Boldgrid
 * @package    Boldgrid\PPB\Rating
 * @copyright  BoldGrid
 * @author     BoldGrid <support@boldgrid.com>
 *
 * @link https://github.com/BoldGrid/library/wiki/Library-RatingPrompt
 */

// Prevent direct calls.
if ( ! defined( 'WPINC' ) ) {
	header( 'Status: 403 Forbidden' );
	header( 'HTTP/1.1 403 Forbidden' );
	exit();
}

$allowed_tags = array(
	'a' => array(
		'href'   => array(),
		'target' => array(),
	),
);

$lang = array(
	'feel_good_value' => __( 'If you feel you\'re getting really good value from the Post and Page Builder by BoldGrid, could you do us a favor and rate us 5 stars on WordPress?', 'boldgrid-editor' ),
);

$default_prompt = array(
	'plugin' => BOLDGRID_EDITOR_KEY,
	'name'   => 'REPLACE_THIS_NAME',
	'slides' => array(
		'start'       => array(
			'text'      => $lang['feel_good_value'],

			/*
			 * Decisions
			 *
			 * @param string text   The text used as the decision.
			 * @param string link   A link to navigate to if the decision is clicked.
			 * @param string slide  The name of a slide to show after clicking this decision.
			 * @param int    snooze A number to indicate how long a prompt should be snoozed for if
			 *                      the decision
			 *                      is selected. If no snooze is set, the decision will dismiss the
			 *                      prompt.
			 */
			'decisions' => array(
				'sure_will'           => array(
					'text'  => __( 'Yes, I sure will!', 'boldgrid-editor' ),
					'link'  => 'https://wordpress.org/support/plugin/post-and-page-builder/reviews/',
					'slide' => 'thanks',
				),
				'maybe_still_testing' => array(
					'text'   => __( 'Maybe later, I\'m still testing the plugin.', 'boldgrid-editor' ),
					'snooze' => WEEK_IN_SECONDS,
					'slide'  => 'maybe_later',
				),
				'already_did'         => array(
					'text'  => __( 'I already did', 'boldgrid-editor' ),
					'slide' => 'already_did',
				),
			),
		),
		'thanks'      => array(
			'text' => sprintf(
				wp_kses(
					/* translators: The URL to the boldgrid-editor plugin in the plugin repo. */
					__( 'Thanks! A new page should have opened to the Post and Page Builder ratings page on WordPress.org. You will need to log in to your WordPress.org account before you can post a review. If the page didn\'t open, please click the following link: <a href="%1$s" target="_blank">%1$s</a>', 'boldgrid-editor' ),
					$allowed_tags
				),
				'https://wordpress.org/support/plugin/post-and-page-builder/reviews/'
			),
		),
		'maybe_later' => array(
			'text' => sprintf(
				wp_kses(
					/* translators: The URL to submit boldgrid-editor bug reports and feature requests. */
					__( 'No problem, maybe now is not a good time. We want to be your WordPress page builder of choice. If you\'re experiencing a problem or want to make a suggestion, please %1$sclick here%2$s.', 'boldgrid-editor' ),
					$allowed_tags
				),
				'<a href="https://www.boldgrid.com/feedback" target="_blank">',
				'</a>'
			),
		),
		'already_did' => array(
			'text' => sprintf(
				wp_kses(
					/* translators: The URL to submit boldgrid-editor bug reports and feature requests. */
					__( 'Thank you for the previous rating! You can help us to continue improving the Post and Page Builder by reporting any bugs or submitting feature requests %1$shere%2$s. Thank you for using the Post and Page Builder by BoldGrid!', 'boldgrid-editor' ),
					$allowed_tags
				),
				'<a href="https://www.boldgrid.com/feedback" target="_blank">',
				'</a>'
			),
		),
	),
);

// Install a number of blocks.
$block_install_prompt                            = $default_prompt;
$block_install_prompt['name']                    = 'block_install';
$block_install_prompt['slides']['start']['text'] = __( 'You\'re doing a great job of adding blocks to your site. It\'s looking great! Starting with Blocks is the most popular way to build pages.', 'boldgrid-editor' ) . ' ' . $lang['feel_good_value'];

// Save blocks to your library.
$block_save_prompt                            = $default_prompt;
$block_save_prompt['name']                    = 'block_save';
$block_save_prompt['slides']['start']['text'] = __( 'You\'re making a really nice collection of blocks. Nice Job! You can build pages much faster by using your saved blocks.', 'boldgrid-editor' ) . ' ' . $lang['feel_good_value'];

// Upgrades 2 minor versions
$dedicated_user                            = $default_prompt;
$dedicated_user['name']                    = 'dedicated_user';
$dedicated_user['slides']['start']['text'] = __( 'Great job keeping your plugin up to date and thank you for being a dedicated BoldGrid user.', 'boldgrid-editor' ) . ' ' . $lang['feel_good_value'];

return array(
	'block_save'  => array(
		'threshold' => 5,
		'prompt'    => $block_save_prompt,
	),
	'block_install' => array(
		'threshold' => 10,
		'prompt'    => $block_install_prompt,
	),
	'dedicated_user' => array(
		'threshold' => 1,
		'prompt'    => $dedicated_user,
	),
);
