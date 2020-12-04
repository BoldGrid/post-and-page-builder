[![Build Status](https://travis-ci.org/BoldGrid/post-and-page-builder.svg?branch=master)](https://travis-ci.org/BoldGrid/post-and-page-builder)
[![License](https://img.shields.io/badge/license-GPL--2.0%2B-orange.svg)](https://raw.githubusercontent.com/BoldGrid/boldgrid-editor/master/LICENSE)
[![PHP Version](https://img.shields.io/badge/PHP-5.4%2B-blue.svg)](https://php.net)
[![Greenkeeper badge](https://badges.greenkeeper.io/BoldGrid/post-and-page-builder.svg)](https://greenkeeper.io/)

Plugin Page:
[https://wordpress.org/plugins/post-and-page-builder/](https://wordpress.org/plugins/post-and-page-builder/)

Official Download Link:
[https://downloads.wordpress.org/plugin/post-and-page-builder.zip](https://downloads.wordpress.org/plugin/post-and-page-builder.zip)

# Post and Page Builder

**Contributors:** boldgrid, rramo012, imh_brad, timph, joemoto

**Tags:** page builder, drag and drop, tinymce, editor, landing page

**Requires at least:** 4.7

**Tested up to:** 5.6

**License:** GPLv2 or later

**License URI:** http://www.gnu.org/licenses/gpl-2.0.html

## Description

Post and Page Builder is a standalone plugin which adds functionality to the existing TinyMCE Editor
used in the WordPress page and post editor.

## Requirements

* PHP 5.4 or higher.

## Installation

1. Upload the entire post-and-page-builder folder to the /wp-content/plugins/ directory.

2. Activate the plugin through the Plugins menu in WordPress.

## Development

### Installing Dependencies
Before you can use the development version of this plugin you must install the dependencies.

```
composer install
yarn install
```
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
