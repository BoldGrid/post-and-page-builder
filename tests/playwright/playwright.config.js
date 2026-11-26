// @ts-check
const { defineConfig, devices } = require( '@playwright/test' );
const os = require( 'os' );
const path = require( 'path' );

const outRoot = process.env.PPB_PLAYWRIGHT_OUT || path.join( os.homedir(), 'tmp', 'ppb-playwright' );

module.exports = defineConfig( {
	testDir: './specs',
	outputDir: path.join( outRoot, 'test-results' ),
	timeout: 30000,
	fullyParallel: true,
	forbidOnly: !! process.env.CI,
	retries: 0,
	reporter: process.env.CI ? [ [ 'list' ], [ 'github' ] ] : [ [ 'list' ] ],
	use: {
		screenshot: 'only-on-failure',
		trace: 'off',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],
} );
