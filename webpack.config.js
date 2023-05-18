let env = process.env.NODE_ENV || 'development';

if ( process.argv.includes( '--mode=development') ) {
	env = 'development';
} else {
	env = 'production';
}

function buildConfig( env ) {
	return require( './tools/config/webpack.' + env + '.js' );
}

module.exports = buildConfig( 'production' === env ? 'prod' : 'dev' );
