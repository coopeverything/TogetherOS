# DeeperLayers.com Optimization Scripts

Automated SEO and speed optimization for deeperlayers.com (WordPress + Divi).

## Quick Start

```bash
# SSH to your server
ssh user@deeperlayers.com

# Navigate to WordPress root
cd /path/to/wordpress

# Download and run the optimization script
curl -sL https://raw.githubusercontent.com/coopeverything/TogetherOS/yolo/scripts/external/deeperlayers/optimize.sh | bash
```

## What Gets Fixed

### Critical SEO Issues
| Issue | Solution |
|-------|----------|
| Missing meta description | Rank Math SEO plugin installed |
| Multiple H1 tags | Second H1 changed to H2 |
| Missing image alt text | Auto-generated from filenames |
| Large inline CSS | Divi static CSS enabled |

### Speed Issues
| Issue | Solution |
|-------|----------|
| 16+ font files | Reduced to 4 weights (~400KB saved) |
| Monster Insights overhead | Replaced with lightweight GA4 (~28KB saved) |
| No WebP images | ShortPixel installed (needs API key) |
| No lazy loading | Native lazy loading enabled |

## Files Included

```
scripts/external/deeperlayers/
├── optimize.sh              # Main automation script
├── verify.sh                # Post-optimization verification
├── README.md                # This file
└── child-theme/
    ├── style.css            # Child theme declaration
    └── functions.php        # All optimizations
```

## Manual Steps After Running

### 1. Add Meta Description (Required)
1. Go to wp-admin > Rank Math > Titles & Meta
2. Edit homepage settings
3. Add meta description:
   > "Functional Muscle Manipulation therapy in [Your Location]. Expert treatment for chronic pain, mobility issues, and muscle dysfunction."

### 2. Configure ShortPixel (Required for WebP)
1. Go to wp-admin > Settings > ShortPixel
2. Sign up at [shortpixel.com](https://shortpixel.com) (free: 100 images/month)
3. Enter your API key
4. Run "Bulk ShortPixel" to optimize existing images

## Verification

Run the verification script to check everything worked:

```bash
curl -sL https://raw.githubusercontent.com/coopeverything/TogetherOS/yolo/scripts/external/deeperlayers/verify.sh | bash
```

Or run PageSpeed Insights:
https://pagespeed.web.dev/analysis?url=https://deeperlayers.com

## Rollback

If something breaks:

```bash
# Revert to original Divi theme
wp theme activate Divi

# Reactivate Monster Insights if needed
wp plugin activate google-analytics-for-wordpress

# Remove child theme
rm -rf wp-content/themes/divi-child
```

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Font files loaded | 16+ | 4 |
| Analytics JS size | ~30KB | ~2KB |
| H1 tags | 2 | 1 |
| Image alt coverage | Partial | 100% |
| Meta description | None | Present |

## Requirements

- SSH access to server
- WP-CLI installed
- WordPress with Divi theme
- Write access to wp-content directory
