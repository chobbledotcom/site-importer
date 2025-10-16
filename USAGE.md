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
2. Deletes any existing `old_site/` directory  
3. Downloads the site using wget to `old_site/`
4. Converts HTML content to markdown
5. Downloads and organizes images
6. Outputs everything to `./output/`

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

## Configuration

Edit `config.js` to customize:
- Input/output paths
- Content type paths
- Default values

For full documentation, see README.md
