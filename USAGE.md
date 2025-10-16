# Site Importer - Quick Start

Import and convert any website to markdown format.

## Installation

Required dependencies:
- Node.js 14+
- wget
- pandoc

Install dependencies:
```bash
# Ubuntu/Debian
apt-get install wget pandoc

# macOS
brew install wget pandoc
```

## Usage

### Markdown Output (default)

```bash
npm run import <url>
```

Example:
```bash
npm run import https://www.example.com
```

### JSON Output

```bash
npm run import <url> --format=json
```

Example:
```bash
npm run import https://www.example.com --format=json
```

This will create a single `content.json` file with all content and images still downloaded to the images directory.

## What it does

1. Deletes any existing `output/` directory
2. Checks if `old_site/` exists - if yes, reuses it; if no, downloads the site
3. Converts HTML content and builds internal data structure
4. Validates data structure integrity
5. Downloads and organizes images
6. Outputs in selected format (JSON or Markdown)
7. Validates output (markdown files only)
8. Reports test results

## Output Structure

### Markdown Format (default)

```
output/
├── pages/          # Static pages as .md files
├── news/           # Blog posts as .md files
├── products/       # Product pages as .md files
├── categories/     # Category pages as .md files
├── images/         # Downloaded images
└── assets/
    └── favicon/    # Favicon files
```

### JSON Format

```
output/
├── content.json    # Single JSON file with all content
├── images/         # Downloaded images
└── assets/
    └── favicon/    # Favicon files
```

The JSON file structure:
```json
{
  "pages": [...],
  "news": [...],
  "products": [...],
  "categories": [...],
  "home": {...},
  "metadata": {
    "exported_at": "2025-10-16T12:00:00.000Z",
    "format_version": "1.0"
  }
}
```

## Testing & Validation

The importer includes built-in validation tests that run automatically:

**Data Structure Tests:**
- Validates all required fields are present
- Checks for duplicate slugs
- Verifies frontmatter format
- Ensures content has proper H1 headings
- Validates metadata completeness

**Markdown Output Tests (markdown mode only):**
- Verifies all files have valid frontmatter
- Checks content structure
- Validates image references exist
- Ensures proper filename formatting
- Verifies no duplicate files

Tests run automatically after conversion and will fail the import if validation fails.

## Development Workflow

**First run:** Downloads the site
```bash
npm run import https://www.example.com
```

**Subsequent runs:** Reuses downloaded site (much faster)
```bash
npm run import https://www.example.com
```

**Force re-download:** Delete old_site directory first
```bash
rm -rf old_site
npm run import https://www.example.com
```

## Configuration

Edit `config.js` to customize:
- Input/output paths
- Content type paths
- Default values

For full documentation, see README.md
