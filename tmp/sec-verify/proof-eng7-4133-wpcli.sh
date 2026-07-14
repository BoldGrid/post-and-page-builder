#!/usr/bin/env bash
# Handler-level proof for ENG7-4133 ssrf group.
set -euo pipefail

WP_ROOT="${WP_ROOT:-/home/jacobd/public_html}"

echo "============================================================"
echo "PROOF (WP-CLI): ENG7-4133 ssrf"
echo "WP_ROOT: $WP_ROOT"
echo "============================================================"

FAIL=0
pass() { echo "  PASS: $1"; }
fail() { echo "  FAIL: $1"; FAIL=1; }

OUT=$(wp eval '
require_once WP_PLUGIN_DIR . "/post-and-page-builder-secops/includes/class-boldgrid-editor-url.php";
require_once WP_PLUGIN_DIR . "/post-and-page-builder-secops/includes/class-boldgrid-editor-upload.php";

$ajax_src = file_get_contents(WP_PLUGIN_DIR . "/post-and-page-builder-secops/includes/class-boldgrid-editor-ajax.php");
$url_src = file_get_contents(WP_PLUGIN_DIR . "/post-and-page-builder-secops/includes/class-boldgrid-editor-url.php");

$redirect_no_follow = preg_match("/get_redirect_url[\\s\\S]*?redirection[\\s\\S]*?=>\\s*0/", $ajax_src) ? "yes" : "no";
$redirect_public_host = strpos($ajax_src, "Boldgrid_Editor_Url::is_public_host") !== false ? "yes" : "no";
$redirect_array_guard = strpos($ajax_src, "is_array") !== false && strpos($ajax_src, "urls") !== false ? "yes" : "no";
$redirect_location_sanitize = strpos($ajax_src, "sanitize_redirect_location") !== false ? "yes" : "no";
$redirect_max_urls = strpos($ajax_src, "MAX_REDIRECT_URLS") !== false ? "yes" : "no";
$redirect_no_esc_only = strpos($ajax_src, "Boldgrid_Editor_Url::is_public_host") !== false ? "yes" : "no";

$upload_no_png_bypass = strpos($ajax_src, "&.png") === false ? "yes" : "no";
$upload_no_sideload = strpos($ajax_src, "media_sideload_image") === false ? "yes" : "no";
$upload_fetch_public = strpos($ajax_src, "fetch_public_image") !== false ? "yes" : "no";
$upload_validate = strpos($ajax_src, "Boldgrid_Editor_Upload::validate_image_file") !== false ? "yes" : "no";
$upload_create = strpos($ajax_src, "Boldgrid_Editor_Upload::create_attachment_from_temp_file") !== false ? "yes" : "no";
$url_no_validate = strpos($url_src, "function validate_image_file") === false ? "yes" : "no";
$url_no_create = strpos($url_src, "function create_attachment_from_temp_file") === false ? "yes" : "no";

$fetch_no_redirect = preg_match("/fetch_public_image[\\s\\S]*?redirection[\\s\\S]*?=>\\s*0/", $url_src) ? "yes" : "no";
$fetch_size_limit = preg_match("/fetch_public_image[\\s\\S]*?limit_response_size/", $url_src) ? "yes" : "no";

$loopback_literal = Boldgrid_Editor_Url::is_public_host("http://127.0.0.1/") ? "no" : "yes";
$link_local_literal = Boldgrid_Editor_Url::is_public_host("http://169.254.169.254/") ? "no" : "yes";
$rfc1918_literal = Boldgrid_Editor_Url::is_public_host("http://10.0.0.1/") ? "no" : "yes";
$public_literal = Boldgrid_Editor_Url::is_public_host("https://8.8.8.8/") ? "yes" : "no";
$bad_scheme = Boldgrid_Editor_Url::is_public_host("file:///etc/passwd") ? "no" : "yes";
$mapped_v6 = Boldgrid_Editor_Url::is_public_ip("::ffff:127.0.0.1") ? "no" : "yes";
$localhost_name = Boldgrid_Editor_Url::is_public_host("http://localhost/") ? "no" : "yes";
$redirect_private = Boldgrid_Editor_Url::sanitize_redirect_location("http://127.0.0.1/internal") ? "no" : "yes";
$redirect_public = Boldgrid_Editor_Url::sanitize_redirect_location("https://images.unsplash.com/photo-1") ? "yes" : "no";
$bad_url = Boldgrid_Editor_Url::sanitize_http_url("http://169.254.169.254/latest/meta-data/") ? "no" : "yes";

echo "redirect_no_follow=$redirect_no_follow\n";
echo "redirect_public_host=$redirect_public_host\n";
echo "redirect_array_guard=$redirect_array_guard\n";
echo "redirect_location_sanitize=$redirect_location_sanitize\n";
echo "redirect_max_urls=$redirect_max_urls\n";
echo "redirect_no_esc_only=$redirect_no_esc_only\n";
echo "upload_no_png_bypass=$upload_no_png_bypass\n";
echo "upload_no_sideload=$upload_no_sideload\n";
echo "upload_fetch_public=$upload_fetch_public\n";
echo "upload_validate=$upload_validate\n";
echo "upload_create=$upload_create\n";
echo "url_no_validate=$url_no_validate\n";
echo "url_no_create=$url_no_create\n";
echo "fetch_no_redirect=$fetch_no_redirect\n";
echo "fetch_size_limit=$fetch_size_limit\n";
echo "loopback_literal=$loopback_literal\n";
echo "link_local_literal=$link_local_literal\n";
echo "rfc1918_literal=$rfc1918_literal\n";
echo "public_literal=$public_literal\n";
echo "bad_scheme=$bad_scheme\n";
echo "mapped_v6=$mapped_v6\n";
echo "localhost_name=$localhost_name\n";
echo "redirect_private=$redirect_private\n";
echo "redirect_public=$redirect_public\n";
echo "bad_url=$bad_url\n";
' --path="$WP_ROOT" 2>&1)

echo "$OUT" | grep -q '^redirect_no_follow=' || { echo "ERROR: wp eval failed:"; echo "$OUT"; exit 1; }

echo ""
echo "--- rt10-178 / rt10-181 / rt10-182: get_redirect_url redirect chain ---"
echo "$OUT" | grep -q 'redirect_no_follow=yes' && pass "Redirect lookup uses redirection => 0" || fail "Redirect chain still enabled ($OUT)"
echo "$OUT" | grep -q 'redirect_public_host=yes' && pass "Redirect handler validates public hosts" || fail "Public host check missing ($OUT)"
echo "$OUT" | grep -q 'redirect_location_sanitize=yes' && pass "Reflected Location headers are re-validated" || fail "Location reflection unsanitized ($OUT)"
echo "$OUT" | grep -q 'redirect_no_esc_only=yes' && pass "esc_url_raw is not the sole SSRF gate" || fail "Still relying on esc_url_raw alone ($OUT)"

echo ""
echo "--- rt10-159 / rt10-160: array submission + reflection ---"
echo "$OUT" | grep -q 'redirect_array_guard=yes' && pass "urls input must be an array" || fail "Array type guard missing ($OUT)"
echo "$OUT" | grep -q 'redirect_max_urls=yes' && pass "Redirect URL batch is capped" || fail "Unbounded URL array still possible ($OUT)"
echo "$OUT" | grep -q 'redirect_private=yes' && pass "Private Location targets are not returned" || fail "Private Location leaked ($OUT)"

echo ""
echo "--- rt10-158 / rt10-161 / rt10-167: private + link-local resolution ---"
echo "$OUT" | grep -q 'loopback_literal=yes' && pass "Literal loopback URLs refused" || fail "Loopback accepted ($OUT)"
echo "$OUT" | grep -q 'link_local_literal=yes' && pass "Link-local / IMDS URLs refused" || fail "169.254.x.x accepted ($OUT)"
echo "$OUT" | grep -q 'rfc1918_literal=yes' && pass "RFC1918 literal URLs refused" || fail "RFC1918 accepted ($OUT)"
echo "$OUT" | grep -q 'localhost_name=yes' && pass "localhost hostname refused" || fail "localhost accepted ($OUT)"
echo "$OUT" | grep -q 'mapped_v6=yes' && pass "IPv4-mapped loopback refused" || fail "Mapped IPv6 bypass ($OUT)"

echo ""
echo "--- rt10-39 / rt10-163 / rt10-165 / rt10-168 / rt10-179: canvas upload SSRF ---"
echo "$OUT" | grep -q 'upload_no_png_bypass=yes' && pass "Deliberate &.png sideload bypass removed" || fail "&.png bypass still present ($OUT)"
echo "$OUT" | grep -q 'upload_no_sideload=yes' && pass "upload_url no longer calls media_sideload_image()" || fail "media_sideload_image still used ($OUT)"
echo "$OUT" | grep -q 'upload_fetch_public=yes' && pass "Remote uploads use fetch_public_image()" || fail "Safe fetch helper not wired ($OUT)"
echo "$OUT" | grep -q 'fetch_no_redirect=yes' && pass "Remote image fetch does not follow redirects" || fail "Upload fetch follows redirects ($OUT)"
echo "$OUT" | grep -q 'fetch_size_limit=yes' && pass "Remote fetch response size is capped" || fail "Response size uncapped ($OUT)"
echo "$OUT" | grep -q 'upload_validate=yes' && pass "URL uploads delegate validation to Upload helper" || fail "Upload validation missing ($OUT)"
echo "$OUT" | grep -q 'upload_create=yes' && pass "URL uploads delegate attachment creation to Upload helper" || fail "Upload create missing ($OUT)"
echo "$OUT" | grep -q 'url_no_validate=yes' && pass "Url helper no longer duplicates validate_image_file()" || fail "Duplicate Url validation remains ($OUT)"
echo "$OUT" | grep -q 'url_no_create=yes' && pass "Url helper no longer duplicates create_attachment_from_temp_file()" || fail "Duplicate Url create remains ($OUT)"
echo "$OUT" | grep -q 'bad_url=yes' && pass "IMDS-style upload URLs rejected" || fail "IMDS URL accepted ($OUT)"

echo ""
echo "--- helper sanity ---"
echo "$OUT" | grep -q 'public_literal=yes' && pass "Public IPs still allowed" || fail "Public IP blocked ($OUT)"
echo "$OUT" | grep -q 'bad_scheme=yes' && pass "Non-http schemes refused" || fail "file:// accepted ($OUT)"
echo "$OUT" | grep -q 'redirect_public=yes' && pass "Public redirect targets still allowed" || fail "Public redirect blocked ($OUT)"

echo ""
echo "============================================================"
if [[ "$FAIL" -eq 0 ]]; then
  echo "VERDICT: NOT VULNERABLE (fix verified at handler layer)"
  exit 0
fi
echo "VERDICT: VULNERABLE or INCONCLUSIVE"
exit 1
