#!/usr/bin/env bash

# Manual only: replace WordPress.org SVN trunk with an existing tag (sets the stable release).
# Not called from CI. Run only after the release workflow has published tags/<version>.
#
# Usage:
#   WP_USERNAME=... WP_PASSWORD=... ./bin/deploy.sh [options] [version]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PLUGIN_SLUG="post-and-page-builder"
PLUGIN_FILE="${PLUGIN_ROOT}/post-and-page-builder.php"
WP_SVN_REPO="${WP_SVN_REPO:-https://plugins.svn.wordpress.org/${PLUGIN_SLUG}}"
WP_API_URL="https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=${PLUGIN_SLUG}"

DRY_RUN=0
AUTO_YES=0
CHECK_API=1
STRICT_API=0
TAG_NUMBER=""

usage() {
	cat <<EOF
Manual-only helper to publish an existing WordPress.org SVN tag to trunk.

Usage:
  WP_USERNAME=... WP_PASSWORD=... $0 [options] [version]

Arguments:
  version       Semantic version (X.Y.Z). Defaults to Version header in post-and-page-builder.php.

Options:
  -n, --dry-run     Validate tag and readme Stable tag, print planned svnmucc action, do not commit.
  -y, --yes         Skip the interactive confirmation prompt before committing to SVN.
      --strict-api  Exit non-zero if the WordPress.org plugin_information API does not yet report <version>.
      --skip-api    Skip querying the WordPress.org plugin_information API.
  -h, --help        Show this help message and exit.

Environment:
  WP_USERNAME / SVN_USERNAME  WordPress.org SVN username (prompted interactively if unset).
  WP_PASSWORD / SVN_PASSWORD  WordPress.org SVN password (prompted silently if unset).
  WP_SVN_REPO                 Override SVN base URL (default: ${WP_SVN_REPO}).
EOF
}

detect_plugin_version() {
	if [[ ! -f "${PLUGIN_FILE}" ]]; then
		return 1
	fi
	sed -n 's/^ \* Version:[[:space:]]*\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)[[:space:]]*$/\1/p' "${PLUGIN_FILE}" | head -n 1
}

extract_stable_tag() {
	tr -d '\r' | sed -n 's/^Stable tag:[[:space:]]*\([^[:space:]]*\)[[:space:]]*$/\1/p' | head -n 1
}

query_wp_api_version() {
	local payload=""

	if ! command -v curl >/dev/null 2>&1; then
		echo "Warning: curl not found; skipping WordPress.org API check." >&2
		return 2
	fi

	if ! payload="$(curl -fsSL --max-time 15 "${WP_API_URL}" 2>/dev/null)"; then
		echo "Warning: failed to query WordPress.org plugin_information API." >&2
		return 2
	fi

	if command -v jq >/dev/null 2>&1; then
		printf '%s' "${payload}" | jq -r '.version // empty'
	elif command -v php >/dev/null 2>&1; then
		printf '%s' "${payload}" | php -r '$d = json_decode(stream_get_contents(STDIN), true); echo isset($d["version"]) ? $d["version"] : "";'
	else
		printf '%s' "${payload}" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p'
	fi
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		-n|--dry-run)
			DRY_RUN=1
			shift
			;;
		-y|--yes)
			AUTO_YES=1
			shift
			;;
		--strict-api)
			CHECK_API=1
			STRICT_API=1
			shift
			;;
		--skip-api)
			CHECK_API=0
			shift
			;;
		-h|--help)
			usage
			exit 0
			;;
		-*)
			echo "Error: unknown option: $1" >&2
			usage >&2
			exit 1
			;;
		*)
			if [[ -n "${TAG_NUMBER}" ]]; then
				echo "Error: unexpected extra argument: $1" >&2
				usage >&2
				exit 1
			fi
			TAG_NUMBER="$1"
			shift
			;;
	esac
done

if [[ -z "${TAG_NUMBER}" ]]; then
	TAG_NUMBER="$(detect_plugin_version || true)"
fi

if [[ ! "${TAG_NUMBER}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
	echo "Error: invalid or missing version '${TAG_NUMBER}'. Expected X.Y.Z (for example: 1.27.16)." >&2
	usage >&2
	exit 1
fi

for required_cmd in svn svnmucc; do
	if ! command -v "${required_cmd}" >/dev/null 2>&1; then
		echo "Error: required command '${required_cmd}' was not found on PATH." >&2
		exit 1
	fi
done

TAG_URL="${WP_SVN_REPO}/tags/${TAG_NUMBER}"
TRUNK_URL="${WP_SVN_REPO}/trunk"

echo "Plugin: ${PLUGIN_SLUG}"
echo "Version: ${TAG_NUMBER}"
echo "SVN repo: ${WP_SVN_REPO}"

if ! svn info "${TAG_URL}" >/dev/null 2>&1; then
	echo "Error: tag ${TAG_NUMBER} was not found at ${WP_SVN_REPO}/tags/." >&2
	exit 1
fi

TAG_README="$(svn cat "${TAG_URL}/readme.txt" 2>/dev/null || true)"
if [[ -z "${TAG_README}" ]]; then
	echo "Error: could not read ${TAG_URL}/readme.txt." >&2
	exit 1
fi

TAG_STABLE_TAG="$(printf '%s\n' "${TAG_README}" | extract_stable_tag)"
if [[ "${TAG_STABLE_TAG}" != "${TAG_NUMBER}" ]]; then
	echo "Error: ${TAG_URL}/readme.txt Stable tag is '${TAG_STABLE_TAG}', expected '${TAG_NUMBER}'." >&2
	exit 1
fi
echo "Verified ${TAG_URL}/readme.txt Stable tag matches ${TAG_NUMBER}."

if [[ "${DRY_RUN}" -eq 1 ]]; then
	echo "[dry-run] Would execute: svnmucc -m \"Releasing ${TAG_NUMBER} to trunk\" --username <redacted> --password-from-stdin --non-interactive --no-auth-cache rm \"${TRUNK_URL}\" cp HEAD \"${TAG_URL}\" \"${TRUNK_URL}\""
	if [[ "${CHECK_API}" -eq 1 ]]; then
		API_VERSION="$(query_wp_api_version || true)"
		if [[ -n "${API_VERSION}" ]]; then
			echo "[dry-run] WordPress.org plugin_information API currently reports version: ${API_VERSION}"
		fi
	fi
	echo "[dry-run] No changes were committed to SVN."
	exit 0
fi

WP_USERNAME="${WP_USERNAME:-${SVN_USERNAME:-}}"
WP_PASSWORD="${WP_PASSWORD:-${SVN_PASSWORD:-}}"

if [[ -z "${WP_USERNAME}" ]]; then
	if [[ -t 0 ]]; then
		read -r -p "WordPress.org SVN username: " WP_USERNAME
	else
		echo "Error: WP_USERNAME (or SVN_USERNAME) must be set when stdin is not interactive." >&2
		exit 1
	fi
fi

if [[ -z "${WP_PASSWORD}" ]]; then
	if [[ -t 0 ]]; then
		read -r -s -p "WordPress.org SVN password: " WP_PASSWORD
		echo
	else
		echo "Error: WP_PASSWORD (or SVN_PASSWORD) must be set when stdin is not interactive." >&2
		exit 1
	fi
fi

if [[ -z "${WP_USERNAME}" || -z "${WP_PASSWORD}" ]]; then
	echo "Error: SVN credentials cannot be empty." >&2
	exit 1
fi

if [[ "${AUTO_YES}" -ne 1 ]]; then
	if [[ ! -t 0 ]]; then
		echo "Error: confirmation required (pass --yes for non-interactive runs)." >&2
		exit 1
	fi
	read -r -p "Replace ${TRUNK_URL} with ${TAG_URL}? [y/N] " CONFIRM
	case "${CONFIRM}" in
		y|Y|yes|YES)
			;;
		*)
			echo "Aborted without modifying SVN."
			exit 1
			;;
	esac
fi

echo "Replacing trunk with tags/${TAG_NUMBER} at ${WP_SVN_REPO}..."
printf '%s\n' "${WP_PASSWORD}" | svnmucc \
	-m "Releasing ${TAG_NUMBER} to trunk" \
	--username "${WP_USERNAME}" \
	--password-from-stdin \
	--non-interactive \
	--no-auth-cache \
	rm "${TRUNK_URL}" \
	cp HEAD "${TAG_URL}" "${TRUNK_URL}"

TRUNK_README="$(svn cat "${TRUNK_URL}/readme.txt" 2>/dev/null || true)"
TRUNK_STABLE_TAG="$(printf '%s\n' "${TRUNK_README}" | extract_stable_tag)"
if [[ "${TRUNK_STABLE_TAG}" != "${TAG_NUMBER}" ]]; then
	echo "Error: ${TRUNK_URL}/readme.txt Stable tag is '${TRUNK_STABLE_TAG}', expected '${TAG_NUMBER}'." >&2
	exit 1
fi
echo "Confirmed ${TRUNK_URL}/readme.txt Stable tag matches ${TAG_NUMBER}."

if [[ "${CHECK_API}" -eq 1 ]]; then
	API_VERSION="$(query_wp_api_version || true)"
	if [[ -n "${API_VERSION}" ]]; then
		echo "WordPress.org plugin_information API reports version: ${API_VERSION}"
		if [[ "${API_VERSION}" != "${TAG_NUMBER}" ]]; then
			echo "Note: WordPress.org API CDN cache may take a few minutes to reflect ${TAG_NUMBER}." >&2
			if [[ "${STRICT_API}" -eq 1 ]]; then
				exit 1
			fi
		fi
	elif [[ "${STRICT_API}" -eq 1 ]]; then
		exit 1
	fi
fi

echo "Trunk now matches tags/${TAG_NUMBER}."
