import { EditorChoice } from './editor-choice';
import { Intro } from './intro';
import { BgControl } from './bg-control';
import { OnbVideos } from './onb-videos';

/**
 * Load one time notices, on first editor load.
 *
 * @since 1.9.0
 *
 * @type {Object}
 */
export class Loader {
	constructor() {
		this.notices = {
			intro: Intro,

			// eslint-disable-next-line
			editor_choice: EditorChoice,

			// eslint-disable-next-line
			bg_control: BgControl,

			// eslint-disable-next-line
			onb_videos: OnbVideos,
		};

		window.BOLDGRID = window.BOLDGRID || {};
		BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
		BOLDGRID.EDITOR.NOTICE = BOLDGRID.EDITOR.NOTICE || {};

		BOLDGRID.EDITOR.NOTICE.Loader = this;
	}

	/**
	 * Initialize the appropriate classes based on the passed configs.
	 *
	 * @since 1.9.0
	 */
	init() {
		for ( let notice of BoldgridEditor.notices ) {
			if ( notice.enabled ) {
				$( 'body' ).addClass( 'bg-editor-intro' );
				setTimeout( () => new this.notices[notice.name]().init() );
				break;
			}
		}
	}
}
