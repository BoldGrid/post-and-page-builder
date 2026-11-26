#!/usr/bin/env bash
set -euo pipefail

echo "Copying to Build Directory"
rm -Rf build
mkdir -p build/post-and-page-builder
rsync -azPq --exclude "bin/" --exclude ".git" --exclude ".github/" --exclude "node_modules/" --exclude "build/" --exclude "tmp/" --exclude ".cursor/" --exclude ".claude/" --exclude "test-results/" --exclude "playwright-report/" . build/post-and-page-builder
cd build/post-and-page-builder
echo "Removing Composer dev dependencies"
composer install --no-dev --no-interaction --prefer-dist -o --no-progress
echo "Removing unwanted files"

rm -Rf tests
rm -Rf .cursor
rm -Rf .claude
rm -f .sec-project.yaml
rm -Rf apigen
rm -Rf coverage
rm -Rf docs
rm -Rf node_modules
rm -Rf bin
rm -Rf tools
rm -Rf tmp
rm -Rf bower_components
rm -Rf test-results
rm -Rf playwright-report
rm -f .browserslistrc
rm -f .codeclimate.yml
rm -f .eslintignore
rm -f .eslintrc.js
rm -f .gitattributes
rm -f .gitignore
rm -f .gitmodules
rm -f .nvmrc
rm -f .prettierrc
rm -f release.sh
rm -f Gruntfile.js
rm -f gulpfile.js
rm -f bower.json
rm -f karma.conf.js
rm -f karma.config.js
rm -f yarn.lock
rm -f yarn-error.log
rm -f webpack.config.js
rm -f package.json
rm -f package-lock.json
rm -f .jscrsrc
rm -f .jshintrc
rm -f composer.json
rm -f composer.lock
rm -f phpunit.xml
rm -f phpunit.xml.dist
rm -f phpcompat.xml.dist
rm -f phpcs.ruleset.xml
rm -f .phpunit.result.cache
rm -f README.md
rm -f .coveralls.yml
rm -f .editorconfig
rm -f .scrutinizer.yml
rm -f apigen.neon
rm -f CHANGELOG.txt
rm -f stylelint.config.js
rm -f .stylelintignore
rm -f CONTRIBUTING.md
rm -f post-and-page-builder.zip
rm -f babel.config.json

# Remove compiled JS/SCSS sources while preserving runtime assets (builder/css and color-palette-scss).
rm -f assets/js/classic.js assets/js/editor.js assets/js/gutenberg.js assets/js/public.js assets/js/settings.js
rm -Rf assets/js/forms assets/js/view
find assets/js/builder -mindepth 1 -maxdepth 1 ! -name css -exec rm -Rf {} +
find assets/scss -mindepth 1 -maxdepth 1 ! -name color-palette-scss -exec rm -Rf {} +
rm -f includes/config/.gitignore

# Remove non-runtime development files bundled inside vendor/boldgrid/library.
rm -Rf vendor/bin vendor/boldgrid/library/bin vendor/boldgrid/library/tests
rm -f vendor/boldgrid/library/.editorconfig vendor/boldgrid/library/.eslintignore vendor/boldgrid/library/.eslintrc.js vendor/boldgrid/library/.gitignore vendor/boldgrid/library/.prettierrc vendor/boldgrid/library/.travis.yml vendor/boldgrid/library/README.md vendor/boldgrid/library/composer.json vendor/boldgrid/library/composer.lock vendor/boldgrid/library/package.json vendor/boldgrid/library/phpunit.xml vendor/boldgrid/library/yarn.lock

echo "Creating Zip File"
cd ..
zip -rq "post-and-page-builder.zip" "post-and-page-builder"

echo "Verifying no development-only paths were packaged"
unzip -Z1 "post-and-page-builder.zip" > zip-entries.txt
leaked=$(grep -E "^post-and-page-builder/(\.git(/|$)|\.github/|\.travis\.yml$|\.sec-project\.yaml$|\.cursor/|\.claude/|\.browserslistrc$|\.codeclimate\.yml$|\.editorconfig$|\.eslintignore$|\.eslintrc\.js$|\.gitattributes$|\.gitignore$|\.gitmodules$|\.nvmrc$|\.phpunit\.result\.cache$|\.prettierrc$|\.stylelintignore$|README\.md$|CONTRIBUTING\.md$|CHANGELOG\.txt$|babel\.config\.json$|composer\.(json|lock)$|gulpfile\.js$|package(-lock)?\.json$|phpcompat\.xml\.dist$|phpcs\.ruleset\.xml$|phpunit\.xml(\.dist)?$|stylelint\.config\.js$|webpack\.config\.js$|yarn\.lock$|bin/|docs/|playwright-report/|test-results/|tests/|tmp/|tools/|includes/config/\.gitignore$|assets/js/(classic|editor|gutenberg|public|settings)\.js$|assets/js/(forms|view)/|assets/js/builder/([^c]|c[^s]|cs[^s]|css[^/])|assets/scss/([^c]|c[^o]|co[^l])|vendor/bin/|vendor/boldgrid/library/(bin/|tests/|\.|composer\.|package\.json$|phpunit\.xml$|yarn\.lock$|README\.md$)|vendor/(phpunit|yoast|squizlabs|wp-coding-standards|phpcompatibility|phpcsstandards|dealerdirect)/)" zip-entries.txt || true)
if [ -n "$leaked" ]; then
	echo "error: development-only paths present in post-and-page-builder.zip:" >&2
	echo "$leaked" >&2
	rm -f zip-entries.txt
	exit 1
fi

echo "Verifying the plugin's runtime files were packaged"
missing=''
for required in post-and-page-builder.php readme.txt .htaccess vendor/autoload.php vendor/boldgrid/library/src/Util/Load.php assets/dist/editor.min.js assets/dist/editor.min.css assets/dist/public.min.js assets/js/builder/css/before-theme.css assets/js/builder/css/draggable.css assets/scss/color-palette-scss/buttons/buttons.scss support/wpforms/assets/js/shortcode.js; do
	if ! grep -qxF "post-and-page-builder/${required}" zip-entries.txt; then
		missing="$missing $required"
	fi
done
rm -f zip-entries.txt
if [ -n "$missing" ]; then
	echo "error: post-and-page-builder.zip is missing:$missing (run npm run build first)" >&2
	exit 1
fi

echo "Verifying the production autoloader loads the BoldGrid library"
if ! php -r 'require $argv[1]; exit( class_exists( "Boldgrid\\Library\\Util\\Load" ) ? 0 : 1 );' "post-and-page-builder/vendor/autoload.php"; then
	echo "error: post-and-page-builder/vendor/autoload.php does not load Boldgrid\\Library\\Util\\Load" >&2
	exit 1
fi
