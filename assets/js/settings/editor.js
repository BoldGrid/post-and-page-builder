export class Editor {
	constructor() {
		this.labels = [
			{ name: 'bgppb', value: 'bgppb', label: 'Post and Page Builder' },
			{ name: 'basic', value: 'basic', label: 'WordPress Editor' },
			{ name: 'classic', value: 'basic', label: 'Classic Editor' }
		];
	}

	changeType( editorType ) {
		this.postForm( { 'bgppb_default_editor_post': editorType } );
	}

	postForm( params, newTab = false ) {
		const form = jQuery( '<form method=\'POST\' style=\'display:none;\'></form>' ).appendTo(
			document.body
		);

		if ( newTab ) {
			form.attr( 'target', '_blank' );
		}

		for ( const i in params ) {
			if ( params.hasOwnProperty( i ) ) {
				$( '<input type="hidden" />' )
					.attr( {
						name: i,
						value: params[i]
					} )
					.appendTo( form );
			}
		}

		form.submit();
		form.remove();
	}
}
