[![CI](https://github.com/BoldGrid/post-and-page-builder/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/BoldGrid/post-and-page-builder/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-GPL--2.0%2B-orange.svg)](https://raw.githubusercontent.com/BoldGrid/boldgrid-editor/master/LICENSE)
[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg)](https://php.net)

Plugin Page:
[https://wordpress.org/plugins/post-and-page-builder/](https://wordpress.org/plugins/post-and-page-builder/)

Official Download Link:
[https://downloads.wordpress.org/plugin/post-and-page-builder.zip](https://downloads.wordpress.org/plugin/post-and-page-builder.zip)

# Post and Page Builder

**Contributors:** boldgrid, rramo012, imh_brad, timph, joemoto, jamesros161

**Tags:** page builder, drag and drop, tinymce, editor, landing page

**Requires at least:** 4.7

**Tested up to:** 7.2

**License:** GPLv2 or later

**License URI:** http://www.gnu.org/licenses/gpl-2.0.html

## Description

Post and Page Builder is a standalone plugin which adds functionality to the existing TinyMCE Editor
used in the WordPress page and post editor.

## Requirements

* PHP 7.4 or higher.

## Installation

1. Upload the entire post-and-page-builder folder to the /wp-content/plugins/ directory.

2. Activate the plugin through the Plugins menu in WordPress.

## Development

### Installing Dependencies
Before you can use the development version of this plugin you must install the dependencies.

First, install the Node version listed in `.nvmrc` (the same version CI uses), and set the build to use it.
```
nvm install
nvm use
```
Then, proceed to install the dependencies.
```
composer install
yarn install
```
### Tests
The plugin supports PHP 7.4 and later and is tested on every PHP minor from 7.4 through 8.6. CI runs the same checks listed here, across that PHP range.

PHPUnit needs a MySQL or MariaDB database and the WordPress test library. Create an empty database, then install the library (the last argument skips creating the database):
```
composer install
bash bin/install-wp-tests.sh wordpress_test root '' 127.0.0.1 latest true

# Default suite, then the ajax group, which phpunit.xml excludes from the default run.
vendor/bin/phpunit --no-coverage
vendor/bin/phpunit --no-coverage --group ajax

# Multisite, and the branch taken when mbstring's mb_encode_numericentity() is missing.
WP_MULTISITE=1 vendor/bin/phpunit --no-coverage
php -d disable_functions=mb_encode_numericentity vendor/bin/phpunit --no-coverage
```
Run PHPUnit once per PHP version you care about (`php8.4 vendor/bin/phpunit`, and so on). The suite fails on any deprecation, warning or notice raised by plugin code, including while the plugin loads.

Static checks:
```
# Syntax check; also fails on compile-time deprecations.
yarn php-lint

# PHPCompatibility 10 for PHP 7.4 through 8.6 (PHP_CodeSniffer 4, locked in tests/phpcompat).
yarn phpcompat:install
yarn phpcompat

# PHPStan level 1 with WordPress stubs (locked in tests/phpstan). Fails only on reports missing from the baseline.
yarn phpstan:install
yarn phpstan

# WordPress Coding Standards (phpcs.ruleset.xml) on the lines you changed since a base branch, plus the
# text domain sniff on every file.
yarn phpcs:changed origin/master
yarn phpcs:i18n

# Release zip in build/; fails on development-only files, missing built assets or a broken production autoloader.
yarn build
yarn zip

# Line coverage (PHP 7.4 only, with the pcov or Xdebug extension; the locked PHPUnit 8.5 cannot collect it on PHP 8).
yarn test:php:coverage

# Playwright browser tests (section validation, util and tables specs).
yarn test
```
The same checks run through Composer: `composer test`, `composer test:ajax`, `composer lint:php`, `composer phpcompat`, `composer phpstan`, `composer phpcs:changed -- origin/master` and `composer phpcs:i18n`.

When you add support for a newer PHP version, add it to the `php` matrix in `.github/workflows/ci.yml` and to `testVersion` in `phpcompat.xml.dist` together. A test fails if they drift.

Baselines and legacy code:
- The plugin does not pass the WordPress Coding Standards as a whole, so CI checks only the lines a pull request adds or modifies; a new file is checked in full. Changing one line of an aligned array or assignment block can require aligning the rest of the block.
- `tests/phpstan/phpstan-baseline.neon` lists the PHPStan reports the code already had. When you fix one, run `yarn phpstan:baseline` so it cannot come back; do not add new code to the baseline.
- The PHP 7.4 (WordPress latest, MySQL 8.4) PHPUnit job in CI reports line coverage on the run page and uploads Clover XML. There is no threshold. Coverage is on 7.4 because the locked PHPUnit 8.5 cannot collect it on PHP 8.
- `tests/test-boldgrid-editor-release-metadata.php` fails when the plugin header version, the readme Stable tag, the newest changelog entry and `package.json` disagree. A release tag must match the plugin header version.

### CSS/JS Development
If you plan on modifying any front end assets you will need to start the webpack dev server.
```
# Run localhost:4000 with hot reload
yarn dev

# Add the following to your wp-config.php
define( 'SCRIPT_DEBUG', true );
define( 'BGEDITOR_SCRIPT_DEBUG', true );
```

### Build for production
The full build is committed to github (changing soon). Before pushing up your changes, run the following command to ensure all assets are updated.
```
yarn build
```

### Publishing an SVN Tag to Trunk
The release workflow publishes Git tags to `tags/<version>` in WordPress.org SVN. Once that tag is verified, manually promote it to SVN `trunk` with:
```
bash bin/deploy.sh --dry-run <version>
WP_USERNAME=... WP_PASSWORD=... bash bin/deploy.sh <version>
```
If `<version>` is omitted, the script detects it from `post-and-page-builder.php`. It prompts for missing credentials and confirmation before committing, then verifies `trunk/readme.txt` `Stable tag` and queries the WordPress.org `plugin_information` API.
