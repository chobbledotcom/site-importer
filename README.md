# Site Importer

Universal website content extraction and conversion tool. Downloads any website and converts it to structured markdown or JSON format.

## Quick Start

```bash
# Import a website as markdown files
npm run import https://www.example.com

# Import as JSON
npm run import https://www.example.com --format=json
```

For detailed usage instructions, see [USAGE.md](USAGE.md).

## Project Structure

```
site-importer/
├── import.js                 # Entry point - handles downloads and orchestration
├── index.js                  # Main converter orchestrator
├── converters/
│   ├── index.js                  # Exports all converters
│   ├── page-converter.js         # Converts static pages
│   ├── blog-converter.js         # Converts blog posts to news
│   ├── product-converter.js      # Converts product pages
│   ├── category-converter.js     # Converts category pages
│   ├── special-pages-converter.js # Generates special pages from data
│   ├── home-converter.js         # Converts homepage content
│   ├── blog-index-converter.js   # Generates blog index
│   └── reviews-index-converter.js # Generates reviews index
├── utils/
│   ├── base-converter.js         # Base class for all converters
│   ├── category-scanner.js       # Scans for product categories
│   ├── cli-args.js               # Command-line argument parsing
│   ├── content-processor.js      # Content cleaning and extraction
│   ├── directory-cleaner.js      # Output directory management
│   ├── favicon-extractor.js      # Extracts favicon files
│   ├── filesystem.js             # File operations
│   ├── frontmatter-generator.js  # YAML frontmatter generation
│   ├── html-patterns.js          # HTML selector patterns
│   ├── html-table-extractor.js   # Extracts data from HTML tables
│   ├── image-downloader.js       # Downloads embedded images
│   ├── json-exporter.js          # Exports data as JSON
│   ├── markdown-table-parser.js  # Parses markdown tables
│   ├── markdown-writer.js        # Writes markdown files
│   ├── metadata-extractor.js     # HTML metadata extraction
│   ├── pandoc-converter.js       # HTML to Markdown via pandoc
│   ├── results-tracker.js        # Tracks conversion results
│   ├── site-downloader.js        # Downloads websites using wget
│   └── test-runner.js            # Test execution framework
└── tests/
    ├── data-structure-tests.js   # Validates internal data structure
    └── markdown-output-tests.js  # Validates markdown output files
```

## How It Works

1. **Download Phase** (`import.js`)
   - Checks if `old_site/` directory exists
   - If not, downloads the website using `wget` with mirror settings
   - Caches downloaded site for future runs (much faster)

2. **Conversion Phase** (`index.js`)
   - Extracts favicons and assets
   - Processes homepage content
   - Converts static pages, blog posts, products, and categories
   - Generates special pages and index pages
   - Builds internal data structure

3. **Validation Phase** (`tests/`)
   - Validates data structure integrity
   - Checks for duplicate slugs, missing fields
   - Validates frontmatter format
   - Verifies image references (markdown mode only)

4. **Output Phase**
   - **Markdown mode**: Writes individual `.md` files with YAML frontmatter
   - **JSON mode**: Writes single `content.json` file with all data
   - Downloads and organizes images

## Output Structure

### Markdown Format (default)

```
output/
├── pages/          # Static pages with frontmatter
├── news/           # Blog posts converted to news items
├── products/       # Product pages with pricing
├── categories/     # Category landing pages
├── images/         # Downloaded and organized images
└── assets/
    └── favicon/    # Favicon files
```

### JSON Format

```
output/
├── content.json    # Single file with all structured data
├── images/         # Downloaded images
└── assets/
    └── favicon/    # Favicon files
```

The JSON structure includes pages, news, products, categories, home content, and metadata.

## Architecture

### Entry Point (`import.js`)
The main entry point that:
- Parses command-line arguments (`--format=json`)
- Manages the `old_site/` download cache
- Downloads websites using `wget` when needed
- Cleans and prepares the `output/` directory
- Orchestrates the conversion process
- Runs validation tests

### Main Orchestrator (`index.js`)
Coordinates all converters in the correct order:
1. Favicon extraction
2. Homepage content
3. Static pages
4. Special pages
5. Blog posts
6. Products and categories
7. Index pages

Handles both markdown and JSON output modes.

### Converters

All converters extend `BaseConverter` which provides:
- HTML file loading and parsing
- Metadata extraction
- Content processing
- Result tracking

**Content Type Converters:**
- `page-converter.js` - Static pages from the site
- `blog-converter.js` - Blog posts to news articles
- `product-converter.js` - Product pages with pricing and specs
- `category-converter.js` - Category landing pages
- `home-converter.js` - Homepage banners, features, sections
- `special-pages-converter.js` - Generates special pages from data
- `blog-index-converter.js` - Creates blog listing page
- `reviews-index-converter.js` - Creates reviews listing page

### Utilities

**Content Processing:**
- `content-processor.js` - Removes navigation, cleans HTML, normalizes whitespace
- `metadata-extractor.js` - Extracts titles, descriptions, prices, dates, og:tags
- `pandoc-converter.js` - HTML to Markdown conversion wrapper
- `frontmatter-generator.js` - Generates YAML frontmatter

**Data Extraction:**
- `html-table-extractor.js` - Extracts structured data from HTML tables
- `markdown-table-parser.js` - Parses markdown table syntax
- `category-scanner.js` - Scans for product categories
- `html-patterns.js` - Common HTML selector patterns

**I/O Operations:**
- `filesystem.js` - File reading, writing, directory management
- `site-downloader.js` - Website downloading via wget
- `image-downloader.js` - Downloads and organizes images
- `favicon-extractor.js` - Extracts favicon files
- `directory-cleaner.js` - Cleans output directories

**Export & Output:**
- `json-exporter.js` - Manages JSON export with data collection
- `markdown-writer.js` - Writes markdown files with frontmatter

**Testing & Validation:**
- `test-runner.js` - Test execution framework
- `results-tracker.js` - Tracks conversion statistics
- `cli-args.js` - Command-line argument parsing

### Tests

**Data Structure Tests (`tests/data-structure-tests.js`):**
- Validates all required fields present
- Checks for duplicate slugs
- Verifies frontmatter structure
- Ensures content has H1 headings
- Validates metadata completeness

**Markdown Output Tests (`tests/markdown-output-tests.js`):**
- Verifies file structure
- Validates YAML frontmatter syntax
- Checks image references exist
- Ensures proper filename formatting
- Verifies no duplicate files

## Extending the Importer

### Adding a New Content Type

1. **Create a converter** in `converters/`:
```javascript
const BaseConverter = require('../utils/base-converter')

class NewTypeConverter extends BaseConverter {
  async convert() {
    const files = this.loadHtmlFiles('new-type')
    // Process files...
    return { converted: files.length, failed: 0 }
  }
}

module.exports = NewTypeConverter
```

2. **Export from** `converters/index.js`:
```javascript
const convertNewType = require('./new-type-converter')
module.exports = { convertNewType, /* ... */ }
```

3. **Add to orchestrator** in `index.js`:
```javascript
tracker.add('New Type', await convertNewType())
```

### Modifying Content Processing

Edit `utils/content-processor.js` to:
- Remove additional HTML elements
- Clean specific patterns
- Normalize content structure

### Adding Metadata Fields

1. Extract in `utils/metadata-extractor.js`
2. Add to frontmatter in `utils/frontmatter-generator.js`
3. Update relevant converter to use new fields

### Custom HTML Selectors

Add patterns to `utils/html-patterns.js` for reusable selectors across converters.

## Requirements

### System Dependencies
- **Node.js 14+** - JavaScript runtime
- **pandoc** - HTML to Markdown conversion
- **wget** - Website downloading

### Installation

**Ubuntu/Debian:**
```bash
apt-get install nodejs pandoc wget
```

**macOS:**
```bash
brew install node pandoc wget
```

**Windows:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Install pandoc from [pandoc.org](https://pandoc.org/installing.html)
- Install wget from [gnu.org/software/wget](https://www.gnu.org/software/wget/)

### Node Dependencies
None! This project uses only Node.js built-in modules for simplicity and portability.

## Development Workflow

**First run** - Downloads the website:
```bash
npm run import https://www.example.com
```

**Subsequent runs** - Reuses cached site (much faster):
```bash
npm run import https://www.example.com
```

**Force re-download** - Delete the cache first:
```bash
rm -rf old_site
npm run import https://www.example.com
```

**Test changes without download**:
```bash
# After first download, just run the converter directly
node index.js
```

## Testing

Tests run automatically after each conversion. They validate:

- Data structure integrity (all modes)
- Required fields present
- No duplicate slugs
- Valid frontmatter format
- Markdown file structure (markdown mode only)
- Image references exist

To run tests manually:
```bash
# Run data structure tests
node tests/data-structure-tests.js

# Run markdown output tests (after markdown conversion)
node tests/markdown-output-tests.js
```

## Output Examples

### Markdown File Format

```markdown
---
title: "Product Name"
description: "Product description for SEO"
layout: product
price: "£199.99"
categories: ["category-name"]
image: "/images/products/product-image.jpg"
---

# Product Name

Product content in markdown format...
```

### JSON Export Format

```json
{
  "pages": [
    {
      "title": "About Us",
      "slug": "about",
      "content": "# About Us\n\nOur story...",
      "description": "Learn about our company"
    }
  ],
  "products": [...],
  "news": [...],
  "categories": [...],
  "home": {...},
  "metadata": {
    "exported_at": "2025-10-17T12:00:00.000Z",
    "format_version": "1.0"
  }
}
```

## Features

- **Universal website support** - Works with any HTML website
- **Smart caching** - Downloads once, converts many times
- **Dual output formats** - Markdown files or single JSON file
- **Automatic validation** - Built-in tests ensure quality output
- **Image downloading** - Extracts and downloads all images
- **Favicon extraction** - Captures all favicon variants
- **Metadata preservation** - Extracts SEO metadata, prices, dates
- **Clean conversion** - Removes navigation, footers, inline styles
- **Product support** - Extracts pricing, categories, specifications
- **Blog support** - Converts blog posts with dates and authors
- **No dependencies** - Uses only Node.js built-in modules

## Troubleshooting

**"pandoc is not installed"**
- Install pandoc using your system's package manager
- Verify with: `pandoc --version`

**"wget command failed"**
- Ensure wget is installed
- Check the URL is accessible
- Try downloading manually first to test

**"No files found in old_site/"**
- Check if the download completed successfully
- Verify the URL structure is supported by wget
- Look for HTML files in `old_site/` subdirectories

**Tests failing**
- Review test output for specific validation errors
- Check that all required fields are extracted
- Verify frontmatter YAML syntax is valid

## License

ISC - Terragon Labs
