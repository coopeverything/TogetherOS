#!/bin/bash
#
# DeeperLayers.com SEO & Speed Optimization Script
#
# Usage: SSH into server, cd to WordPress root, run this script
#   ssh user@deeperlayers.com
#   cd /path/to/wordpress
#   bash /path/to/optimize.sh
#
# Prerequisites:
#   - WP-CLI installed (wp command available)
#   - SSH access to server
#   - Write access to wp-content directory
#
# What this script does:
#   1. Installs Rank Math SEO plugin
#   2. Fixes duplicate H1 tags (changes second H1 to H2)
#   3. Adds alt text to images missing it
#   4. Creates optimized child theme (reduced fonts, lightweight GA4)
#   5. Installs ShortPixel for WebP conversion
#   6. Removes Monster Insights overhead

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verify we're in a WordPress directory
if [ ! -f "wp-config.php" ]; then
    log_error "wp-config.php not found. Please run this script from the WordPress root directory."
    exit 1
fi

# Verify WP-CLI is available
if ! command -v wp &> /dev/null; then
    log_error "WP-CLI (wp) command not found. Please install WP-CLI first."
    exit 1
fi

log_info "Starting DeeperLayers.com optimization..."

# ============================================
# PHASE 1: SEO FIXES
# ============================================

log_info "=== PHASE 1: SEO Fixes ==="

# 1.1 Install Rank Math SEO
log_info "Installing Rank Math SEO plugin..."
if wp plugin is-installed seo-by-rank-math 2>/dev/null; then
    log_info "Rank Math already installed, ensuring it's active..."
    wp plugin activate seo-by-rank-math 2>/dev/null || true
else
    wp plugin install seo-by-rank-math --activate
fi
log_info "Rank Math SEO installed and activated"

# 1.2 Fix duplicate H1 tags
log_info "Fixing duplicate H1 tags (THERAPY, NOT TREATMENT -> H2)..."
# Check if the H1 exists before attempting replacement
H1_COUNT=$(wp db query "SELECT COUNT(*) FROM $(wp db prefix)posts WHERE post_content LIKE '%<h1>THERAPY, NOT TREATMENT</h1>%'" --skip-column-names 2>/dev/null || echo "0")

if [ "$H1_COUNT" != "0" ]; then
    wp search-replace '<h1>THERAPY, NOT TREATMENT</h1>' '<h2>THERAPY, NOT TREATMENT</h2>' $(wp db prefix)posts --dry-run
    wp search-replace '<h1>THERAPY, NOT TREATMENT</h1>' '<h2>THERAPY, NOT TREATMENT</h2>' $(wp db prefix)posts
    log_info "H1 tag fixed"
else
    # Try Divi-specific patterns (may be encoded differently)
    log_warn "Standard H1 not found, checking for Divi-encoded patterns..."
    wp search-replace 'header_level="h1">THERAPY, NOT TREATMENT' 'header_level="h2">THERAPY, NOT TREATMENT' $(wp db prefix)posts 2>/dev/null || true
fi

# 1.3 Bulk update missing alt texts from filenames
log_info "Updating missing image alt texts from filenames..."
wp eval '
$args = array(
    "post_type" => "attachment",
    "post_mime_type" => "image",
    "posts_per_page" => -1,
    "post_status" => "inherit"
);
$images = get_posts($args);
$updated = 0;
foreach ($images as $img) {
    $alt = get_post_meta($img->ID, "_wp_attachment_image_alt", true);
    if (empty($alt)) {
        $filename = pathinfo(get_attached_file($img->ID), PATHINFO_FILENAME);
        // Convert filename to readable text: "Elbow-Trap-Full-scaled" -> "Elbow Trap Full Scaled"
        $alt = ucwords(str_replace(array("-", "_"), " ", $filename));
        // Remove common suffixes
        $alt = preg_replace("/\s+(Scaled|Large|Medium|Thumbnail|[0-9]+x[0-9]+)$/i", "", $alt);
        update_post_meta($img->ID, "_wp_attachment_image_alt", $alt);
        $updated++;
    }
}
echo "Updated $updated images with alt text\n";
'

# Specific alt for hero image
log_info "Setting specific alt for hero image..."
wp eval '
global $wpdb;
$hero = $wpdb->get_var("SELECT ID FROM {$wpdb->posts} WHERE guid LIKE \"%Elbow-Trap-Full%\" LIMIT 1");
if ($hero) {
    update_post_meta($hero, "_wp_attachment_image_alt", "Functional Muscle Manipulation therapy technique on trapezius muscle");
    echo "Hero image alt text set\n";
} else {
    echo "Hero image not found in media library\n";
}
'

# ============================================
# PHASE 2: SPEED FIXES
# ============================================

log_info "=== PHASE 2: Speed Fixes ==="

# 2.1 Create child theme with optimized fonts and lightweight GA4
log_info "Creating optimized child theme..."

CHILD_THEME_DIR="wp-content/themes/divi-child"
mkdir -p "$CHILD_THEME_DIR"

# Child theme style.css
cat > "$CHILD_THEME_DIR/style.css" << 'STYLE_EOF'
/*
 Theme Name: Divi Child - Optimized
 Description: Performance-optimized Divi child theme for DeeperLayers.com
 Template: Divi
 Version: 1.0.0
 Author: DeeperLayers
*/

/* Optimizations applied via functions.php:
 * - Reduced font loading (4 weights vs 16+)
 * - Lightweight GA4 (no Monster Insights overhead)
 * - WebP image delivery
 */
STYLE_EOF

# Child theme functions.php (from our child-theme directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/child-theme/functions.php" ]; then
    cp "$SCRIPT_DIR/child-theme/functions.php" "$CHILD_THEME_DIR/functions.php"
    log_info "Child theme functions.php copied from script directory"
else
    # Inline fallback if running standalone
    cat > "$CHILD_THEME_DIR/functions.php" << 'FUNCTIONS_EOF'
<?php
/**
 * Divi Child Theme - Performance Optimizations
 * DeeperLayers.com
 */

// ======================
// FONT OPTIMIZATION
// ======================
// Reduce from 16+ font files to 4 weights

add_action('wp_enqueue_scripts', function() {
    // Dequeue Divi's heavy font loading
    wp_dequeue_style('et-builder-googlefonts-cached');
    wp_dequeue_style('divi-fonts');
}, 100);

add_action('wp_head', function() {
    // Load optimized font subset (only weights actually used)
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
    echo '<link href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">';
}, 1);

// ======================
// LIGHTWEIGHT ANALYTICS
// ======================
// Replace Monster Insights (30KB+) with minimal GA4 snippet

add_action('wp_head', function() {
    // Only load for non-logged-in users (skip for admin testing)
    if (is_user_logged_in()) {
        return;
    }
    ?>
    <!-- Global site tag (gtag.js) - Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-P60F4568DX"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-P60F4568DX', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
        });
    </script>
    <?php
}, 2);

// Disable Monster Insights frontend output if still active
add_filter('monsterinsights_frontend_output_analytics_src', '__return_false');

// ======================
// IMAGE OPTIMIZATION
// ======================

// Add responsive image sizes for hero
add_action('after_setup_theme', function() {
    add_image_size('hero-mobile', 768, 512, true);
    add_image_size('hero-tablet', 1024, 683, true);
    add_image_size('hero-desktop', 1920, 1280, true);
});

// Lazy load images by default (native browser lazy loading)
add_filter('wp_get_attachment_image_attributes', function($attr) {
    if (!isset($attr['loading'])) {
        $attr['loading'] = 'lazy';
    }
    return $attr;
});

// ======================
// PERFORMANCE TWEAKS
// ======================

// Remove jQuery migrate (not needed for modern Divi)
add_action('wp_default_scripts', function($scripts) {
    if (!is_admin() && isset($scripts->registered['jquery'])) {
        $script = $scripts->registered['jquery'];
        if ($script->deps) {
            $script->deps = array_diff($script->deps, array('jquery-migrate'));
        }
    }
});

// Disable emoji scripts (saves 2 HTTP requests)
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('admin_print_styles', 'print_emoji_styles');

// Remove WordPress version number (minor security improvement)
remove_action('wp_head', 'wp_generator');

// Disable XML-RPC (security + performance)
add_filter('xmlrpc_enabled', '__return_false');
FUNCTIONS_EOF
    log_info "Child theme functions.php created inline"
fi

# Activate child theme
log_info "Activating child theme..."
wp theme activate divi-child

# 2.2 Install WebP image optimizer
log_info "Installing ShortPixel for WebP conversion..."
if wp plugin is-installed shortpixel-image-optimiser 2>/dev/null; then
    log_info "ShortPixel already installed"
    wp plugin activate shortpixel-image-optimiser 2>/dev/null || true
else
    wp plugin install shortpixel-image-optimiser --activate
fi
log_info "ShortPixel installed - configure API key in wp-admin > Settings > ShortPixel"

# 2.3 Deactivate Monster Insights (if present)
log_info "Checking for Monster Insights..."
if wp plugin is-active google-analytics-for-wordpress 2>/dev/null || wp plugin is-active monster-insights 2>/dev/null; then
    log_warn "Deactivating Monster Insights (replaced with lightweight GA4 in child theme)..."
    wp plugin deactivate google-analytics-for-wordpress 2>/dev/null || true
    wp plugin deactivate monster-insights 2>/dev/null || true
    log_info "Monster Insights deactivated"
else
    log_info "Monster Insights not found or already inactive"
fi

# 2.4 Regenerate thumbnails for responsive images
log_info "Regenerating thumbnails with new responsive sizes..."
wp media regenerate --only-missing --yes 2>/dev/null || {
    log_warn "Some thumbnails may have failed to regenerate (this is usually fine)"
}

# 2.5 Enable Divi static CSS if available
log_info "Enabling Divi static CSS generation..."
wp eval '
$options = get_option("et_divi");
if ($options) {
    $options["divi_static_css_file"] = "on";
    $options["divi_css_inline"] = "off";
    update_option("et_divi", $options);
    echo "Divi static CSS enabled\n";
} else {
    echo "Divi options not found (may be using different storage)\n";
}
'

# ============================================
# CLEANUP
# ============================================

log_info "=== Cleanup ==="

# Clear all caches
log_info "Flushing caches..."
wp cache flush 2>/dev/null || true
wp transient delete --all 2>/dev/null || true

# Clear Divi cache if present
if [ -d "wp-content/et-cache" ]; then
    rm -rf wp-content/et-cache/*
    log_info "Divi cache cleared"
fi

# ============================================
# VERIFICATION
# ============================================

log_info "=== Verification ==="

echo ""
echo "=========================================="
echo "OPTIMIZATION COMPLETE - Manual Steps Needed:"
echo "=========================================="
echo ""
echo "1. META DESCRIPTION (Required):"
echo "   - Go to wp-admin > Rank Math > Titles & Meta"
echo "   - Edit homepage and add meta description:"
echo "   \"Functional Muscle Manipulation therapy in [Your Location]."
echo "    Expert treatment for chronic pain, mobility issues, and muscle dysfunction.\""
echo ""
echo "2. SHORTPIXEL API KEY (Required for WebP):"
echo "   - Go to wp-admin > Settings > ShortPixel"
echo "   - Sign up at shortpixel.com and enter your API key"
echo "   - Click 'Bulk ShortPixel' to optimize existing images"
echo ""
echo "3. VERIFICATION (Test these manually):"
echo "   - Check H1 tags: View page source, search for '<h1'"
echo "   - Check meta description: View page source, search for 'description'"
echo "   - Check fonts: DevTools Network tab, filter 'font'"
echo "   - Check WebP: DevTools Network tab, check image formats"
echo ""
echo "4. RUN PAGESPEED INSIGHTS:"
echo "   https://pagespeed.web.dev/analysis?url=https://deeperlayers.com"
echo ""
log_info "Script completed successfully!"
