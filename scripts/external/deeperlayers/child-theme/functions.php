<?php
/**
 * Divi Child Theme - Performance Optimizations
 * DeeperLayers.com
 *
 * This file contains all performance optimizations for the site:
 * 1. Font loading reduction (16+ files -> 4 weights)
 * 2. Lightweight GA4 (replaces Monster Insights ~30KB overhead)
 * 3. Responsive image sizes for hero
 * 4. Various performance tweaks
 */

// ======================
// FONT OPTIMIZATION
// ======================
// Reduce from 16+ font files (500KB+) to 4 weights (~100KB)
// Fonts: Abhaya Libre (400, 700) + Poppins (400, 600)

add_action('wp_enqueue_scripts', function() {
    // Dequeue Divi's heavy font loading
    wp_dequeue_style('et-builder-googlefonts-cached');
    wp_dequeue_style('divi-fonts');
}, 100);

add_action('wp_head', function() {
    // Preconnect for faster font loading
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">';
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';

    // Load optimized font subset (only weights actually used on the site)
    // Using display=swap for better CLS scores
    echo '<link href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">';
}, 1);


// ======================
// LIGHTWEIGHT ANALYTICS
// ======================
// Replace Monster Insights (~30KB JS + 3 network requests) with minimal GA4 snippet (~2KB)
// Property ID: G-P60F4568DX (from current Monster Insights config)

add_action('wp_head', function() {
    // Only load for non-logged-in users
    // This allows admin testing without inflating analytics
    if (is_user_logged_in()) {
        return;
    }
    ?>
    <!-- Google Analytics 4 - Lightweight Implementation -->
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

// Disable Monster Insights frontend output if plugin still active
add_filter('monsterinsights_frontend_output_analytics_src', '__return_false');
add_filter('monsterinsights_tracking_disabled', '__return_true');


// ======================
// IMAGE OPTIMIZATION
// ======================

// Add responsive image sizes for hero images
// These will be used with srcset for responsive loading
add_action('after_setup_theme', function() {
    add_image_size('hero-mobile', 768, 512, true);   // Mobile devices
    add_image_size('hero-tablet', 1024, 683, true);  // Tablet devices
    add_image_size('hero-desktop', 1920, 1280, true); // Desktop/retina
});

// Enable native browser lazy loading for all images
add_filter('wp_get_attachment_image_attributes', function($attr) {
    // Add loading="lazy" to images that don't have it
    // Except for images with loading="eager" explicitly set
    if (!isset($attr['loading'])) {
        $attr['loading'] = 'lazy';
    }

    // Add decoding="async" for better performance
    if (!isset($attr['decoding'])) {
        $attr['decoding'] = 'async';
    }

    return $attr;
});


// ======================
// PERFORMANCE TWEAKS
// ======================

// Remove jQuery migrate (not needed for modern Divi 4.x)
// Saves ~10KB of JavaScript
add_action('wp_default_scripts', function($scripts) {
    if (!is_admin() && isset($scripts->registered['jquery'])) {
        $script = $scripts->registered['jquery'];
        if ($script->deps) {
            $script->deps = array_diff($script->deps, array('jquery-migrate'));
        }
    }
});

// Disable WordPress emoji scripts
// Saves 2 HTTP requests and ~15KB
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('admin_print_styles', 'print_emoji_styles');

// Remove WordPress version from head (minor security improvement)
remove_action('wp_head', 'wp_generator');

// Disable XML-RPC (improves security, reduces server load from attacks)
add_filter('xmlrpc_enabled', '__return_false');

// Remove shortlink from head
remove_action('wp_head', 'wp_shortlink_wp_head');

// Remove RSD link (Really Simple Discovery)
remove_action('wp_head', 'rsd_link');

// Remove wlwmanifest link (Windows Live Writer)
remove_action('wp_head', 'wlwmanifest_link');


// ======================
// OPTIONAL: DEFER NON-CRITICAL CSS
// ======================
// Uncomment if you want to defer render-blocking CSS
// Note: May cause FOUC (flash of unstyled content) if not careful

/*
add_filter('style_loader_tag', function($html, $handle, $href) {
    // List of stylesheets to defer
    $defer_styles = array(
        'dashicons',
        'wp-block-library',
    );

    if (in_array($handle, $defer_styles)) {
        return '<link rel="preload" as="style" href="' . esc_url($href) . '" onload="this.onload=null;this.rel=\'stylesheet\'">' .
               '<noscript><link rel="stylesheet" href="' . esc_url($href) . '"></noscript>';
    }

    return $html;
}, 10, 3);
*/


// ======================
// CUSTOM CSS TWEAKS
// ======================
// Add any custom CSS optimizations here

add_action('wp_head', function() {
    ?>
    <style id="deeperlayers-perf-fixes">
    /* Ensure smooth font loading */
    body {
        font-display: swap;
    }

    /* Optimize image rendering */
    img {
        content-visibility: auto;
    }

    /* Reduce layout shift on images */
    img:not([width]):not([height]) {
        aspect-ratio: attr(width) / attr(height);
    }
    </style>
    <?php
}, 99);
