echo "Copying to Build Directory"
rm -Rf build
mkdir -p build/post-and-page-builder
rsync -azPq --exclude "bin/" --exclude ".git/" --exclude ".github/" --exclude "node_modules/" --exclude "build/" --exclude "tmp/" --exclude ".cursor/" --exclude ".claude/" . build/post-and-page-builder
cd build/post-and-page-builder
echo "Removing unwanted files"

rm -Rf tests
rm -Rf .cursor
rm -Rf .claude
rm -f .sec-project.yaml
rm -Rf apigen
rm -Rf coverage
rm -Rf node_modules
rm -Rf bin
rm -Rf tools
rm -Rf tmp
rm -Rf bower_components
rm -f .gitattributes
rm -f .gitignore
rm -f .gitmodules
rm -f .travis.yml
rm -f .nvmrc
rm -f release.sh
rm -f Gruntfile.js
rm -f gulpfile.js
rm -f bower.json
rm -f karma.conf.js
rm -f karma.config.js
rm -f yarn.lock
rm -f webpack.config.js
rm -f package.json
rm -f .jscrsrc
rm -f .jshintrc
rm -f composer.json
rm -f composer.lock
rm -f phpunit.xml
rm -f phpunit.xml.dist
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

echo "Creating Zip File"
cd ..
zip -rq "post-and-page-builder.zip" "post-and-page-builder"

echo "Verifying no development-only paths were packaged"
leaked=$(unzip -l "post-and-page-builder.zip" \
	| grep -E "post-and-page-builder/(\.cursor/|\.claude/|\.sec-project\.yaml|tmp/)" || true)
if [ -n "$leaked" ]; then
	echo "error: development-only paths present in post-and-page-builder.zip:" >&2
	echo "$leaked" >&2
	exit 1
fi