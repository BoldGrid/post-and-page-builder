<?php
/**
 * Run PHP_CodeSniffer (phpcs.ruleset.xml) and report only lines this change adds or modifies.
 *
 * The legacy tree does not pass the WordPress Coding Standards, so a whole-file run would fail on code a change
 * never touched. This compares the working tree with the merge base of BASE and HEAD, runs phpcs on the changed
 * PHP files, and keeps the reports that fall on changed lines. New files are therefore checked in full. Untracked
 * PHP files count as new, so a local run sees work that is not committed yet.
 *
 * Usage: php bin/phpcs-changed.php [BASE]
 * BASE defaults to $PHPCS_BASE, then origin/master. CI passes the pull request base commit.
 *
 * @package Boldgrid_Editor
 */

if ( 'cli' !== PHP_SAPI ) {
	exit( 1 );
}

chdir( dirname( __DIR__ ) );

/**
 * Run a command and return its standard output, or exit when it fails.
 *
 * @param string $command Shell command.
 * @return string
 */
function ppb_phpcs_changed_run( $command ) {
	exec( $command . ' 2>&1', $output, $status );

	if ( 0 !== $status ) {
		fwrite( STDERR, "Command failed ({$status}): {$command}\n" . implode( "\n", $output ) . "\n" );
		exit( 2 );
	}

	return implode( "\n", $output );
}

$base = isset( $argv[1] ) && '' !== $argv[1] ? $argv[1] : (string) getenv( 'PHPCS_BASE' );
$base = '' !== $base ? $base : 'origin/master';

$merge_base = trim( ppb_phpcs_changed_run( 'git merge-base ' . escapeshellarg( $base ) . ' HEAD' ), " \n\r\t" );
$diff       = ppb_phpcs_changed_run( 'git -c core.quotePath=false diff --no-color --no-ext-diff -U0 -M --diff-filter=AMR ' . escapeshellarg( $merge_base ) . " -- '*.php'" );

$changed = array();
$file    = null;

foreach ( explode( "\n", $diff ) as $line ) {
	if ( 0 === strpos( $line, '+++ ' ) ) {
		$file = 0 === strpos( $line, '+++ b/' ) ? substr( $line, 6 ) : null;

		if ( null !== $file ) {
			$changed[ $file ] = array();
		}

		continue;
	}

	if ( null !== $file && preg_match( '/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/', $line, $hunk ) ) {
		$start = (int) $hunk[1];
		$count = isset( $hunk[2] ) && '' !== $hunk[2] ? (int) $hunk[2] : 1;

		for ( $i = 0; $i < $count; $i++ ) {
			$changed[ $file ][ $start + $i ] = true;
		}
	}
}

$untracked = ppb_phpcs_changed_run( "git -c core.quotePath=false ls-files --others --exclude-standard -- '*.php'" );

foreach ( array_filter( explode( "\n", $untracked ) ) as $new_file ) {
	$changed[ $new_file ] = true;
}

$changed = array_filter(
	$changed,
	function ( $lines ) {
		return true === $lines || ! empty( $lines );
	}
);

if ( empty( $changed ) ) {
	echo "No changed PHP lines since {$base} ({$merge_base}).\n";
	exit( 0 );
}

$by_path = array();

foreach ( $changed as $relative => $lines ) {
	$real = realpath( $relative );

	if ( false !== $real ) {
		$by_path[ $real ] = array( $relative, $lines );
	}
}

$command = escapeshellarg( PHP_BINARY ) . ' vendor/bin/phpcs --standard=phpcs.ruleset.xml --report=json -q '
	. implode( ' ', array_map( 'escapeshellarg', array_column( $by_path, 0 ) ) );

exec( $command, $output, $status );
$report = json_decode( implode( "\n", $output ), true );

if ( ! is_array( $report ) || ! isset( $report['files'] ) ) {
	fwrite( STDERR, "phpcs did not return a JSON report ({$status}):\n" . implode( "\n", $output ) . "\n" );
	exit( 2 );
}

$found = 0;

foreach ( $report['files'] as $reported => $result ) {
	$real = realpath( $reported );

	if ( false === $real || ! isset( $by_path[ $real ] ) ) {
		continue;
	}

	list( $relative, $lines ) = $by_path[ $real ];

	foreach ( $result['messages'] as $message ) {
		if ( true !== $lines && ! isset( $lines[ $message['line'] ] ) ) {
			continue;
		}

		++$found;
		printf( "%s:%d:%d: %s %s (%s)\n", $relative, $message['line'], $message['column'], $message['type'], $message['message'], $message['source'] );
	}
}

$checked = count( $by_path );

if ( $found > 0 ) {
	echo "\n{$found} coding standards report(s) on changed lines in {$checked} file(s) since {$base}. vendor/bin/phpcbf FILE fixes many of them, but review what it changes outside your lines.\n";
	exit( 1 );
}

echo "No coding standards reports on changed lines in {$checked} file(s) since {$base}.\n";
exit( 0 );
