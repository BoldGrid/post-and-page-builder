#!/usr/bin/env bash
#
# Syntax-check every shipped PHP file with the PHP binary on PATH (override with PHP=php8.4).
#
# `php -l` exits 0 for compile-time deprecations and warnings (a constructor that returns a value,
# an implicitly nullable parameter, a removed constant), so this also fails on any output other than
# the single "No syntax errors detected" line. Covers the plugin and the BoldGrid library it ships.
#
# Usage: bin/php-lint.sh
#
set -u

cd "$(dirname "$0")/.." || exit 1

php_bin="${PHP:-php}"
status=0
checked=0

lint_file() {
	local file="$1" output
	output="$("$php_bin" -d error_reporting=-1 -d display_errors=1 -d log_errors=0 -l "$file" 2>&1)"
	checked=$((checked + 1))

	if [ "$output" != "No syntax errors detected in $file" ]; then
		echo "$output" >&2
		status=1
	fi
}

while IFS= read -r -d '' file; do
	lint_file "$file"
done < <(find . \( -name vendor -o -name node_modules -o -name build -o -name tmp -o -name .git \) -prune -o -name '*.php' -print0)

if [ -d vendor/boldgrid ]; then
	while IFS= read -r -d '' file; do
		lint_file "$file"
	done < <(find vendor/boldgrid \( -name node_modules -o -name tests \) -prune -o -name '*.php' -print0)
fi

echo "Linted ${checked} PHP files with $("$php_bin" -r 'echo PHP_VERSION;')."
exit "$status"
