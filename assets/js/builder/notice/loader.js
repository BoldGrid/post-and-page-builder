import { EditorChoice } from './editor-choice';
import { Intro } from './intro';

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
			editor_choice: EditorChoice
		};
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
