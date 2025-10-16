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

```bash
npm run import <url>
```

Example:
```bash
npm run import https://www.myalarmsecurity.co.uk
```

## What it does

1. Deletes any existing `output/` directory
2. Deletes any existing `old_site/` directory  
3. Downloads the site using wget to `old_site/`
4. Converts HTML content to markdown
5. Downloads and organizes images
6. Outputs everything to `./output/`

## Output Structure

```
output/
├── pages/          # Static pages
├── news/           # Blog posts
├── products/       # Product pages
├── categories/     # Category pages
├── images/         # Downloaded images
└── assets/
    └── favicon/    # Favicon files
```

## Configuration

Edit `config.js` to customize:
- Input/output paths
- Content type paths
- Default values

For full documentation, see README.md
