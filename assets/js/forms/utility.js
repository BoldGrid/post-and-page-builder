export class Utility {

	/**
	 * Submit a post request via JS.
	 *
	 * @since 1.9.0
	 *
	 * @param  {object}  params         List of params to post.
	 * @param  {Boolean} [newTab=false] Wehther to open in a new tab or not.
	 */
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
