const path = require( 'path' ),
	fs = require( 'fs' );

let args = process.argv.slice( 2 );

if ( ! args && ! 2 !== args.length ) {
	console.log( 'You must enter a version number to update to.' );
	process.exit( 1 );
}

let sourcePath = path.resolve( args[0] ),
	version    = args[1];

	console.log( version );

let inputFilePatterns = {
		'readme.txt': /Stable tag: (\d+\.\d+\.\d+\S*)/i,
		'package.json': /"version": "(\d+\.\d+\.\d+[^\s\"]*)"/i,
		'post-and-page-builder.php': /Version: (\d+\.\d+\.\d+\S*)/i
};

for ( let fileName in inputFilePatterns ) {
	let file = path.join( sourcePath, fileName );

	if ( ! fs.existsSync ( file ) ) {
		console.log( 'File does not exist: ' + file );
		continue;
	}

	fs.readFile( file, 'utf8', function( err, content ) {
		if ( err ) {
			return console.log( err );
		}

		let regex = inputFilePatterns[fileName],
			match = regex.exec( content );

		if ( ! match ) {
			console.log( file );
			console.log( 'Could not find version in ' + file );
			return;
		} else if ( match[1] ) {
			match = match[1];
			content = content.replace( match, version );

			fs.writeFile( file, content, 'utf8', function( err ) {
				if ( err ) {
					return console.log( err );
				}

				console.log( 'Updated version in ' + file + '!' );
			}
		);
		}
	} );
}