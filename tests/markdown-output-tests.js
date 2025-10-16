const fs = require('fs');
const path = require('path');
const {TestRunner} = require('../utils/test-runner');
const config = require('../config');

const runMarkdownOutputTests = () => {
  const runner = new TestRunner();

  const checkDirectory = (dir, label) => {
    const dirPath = path.join(config.OUTPUT_BASE, dir);
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .map(f => ({filename: f, path: path.join(dirPath, f)}));
  };

  const pages = checkDirectory(config.paths.pages, 'pages');
  const news = checkDirectory(config.paths.news, 'news');
  const products = checkDirectory(config.paths.products, 'products');
  const categories = checkDirectory(config.paths.categories, 'categories');
  const reviews = checkDirectory('reviews', 'reviews');

  runner.test('Markdown files were created', () => {
    const total = pages.length + news.length + products.length + categories.length;
    runner.assertGreaterThan(total, 0, 'Should have created some markdown files');
  });

  runner.test('All markdown files have valid frontmatter', () => {
    const allFiles = [...pages, ...news, ...products, ...categories, ...reviews];

    allFiles.forEach(({filename, path}) => {
      const content = fs.readFileSync(path, 'utf8');
      runner.assert(
        content.startsWith('---\n'),
        `${filename} should start with YAML frontmatter`
      );

      const secondDelimiter = content.indexOf('\n---\n', 4);
      runner.assert(
        secondDelimiter > 0,
        `${filename} should have closing frontmatter delimiter`
      );
    });
  });

  runner.test('Markdown files have content after frontmatter', () => {
    const allFiles = [...pages, ...news, ...products, ...categories];

    allFiles.forEach(({filename, path}) => {
      const content = fs.readFileSync(path, 'utf8');
      const secondDelimiter = content.indexOf('\n---\n', 4);
      const bodyContent = content.substring(secondDelimiter + 5).trim();

      runner.assert(
        bodyContent.length > 0,
        `${filename} should have content after frontmatter`
      );
    });
  });

  runner.test('Markdown content starts with H1', () => {
    const allFiles = [...pages, ...news, ...products, ...categories];

    allFiles.forEach(({filename, path}) => {
      const content = fs.readFileSync(path, 'utf8');
      const secondDelimiter = content.indexOf('\n---\n', 4);
      const bodyContent = content.substring(secondDelimiter + 5).trim();

      runner.assert(
        /^#\s+/.test(bodyContent),
        `${filename} content should start with H1 heading`
      );
    });
  });

  if (products.length > 0) {
    runner.test('Product files have price in frontmatter', () => {
      products.forEach(({filename, path}) => {
        const content = fs.readFileSync(path, 'utf8');
        const frontmatterEnd = content.indexOf('\n---\n', 4);
        const frontmatter = content.substring(0, frontmatterEnd);

        runner.assert(
          frontmatter.includes('price:'),
          `${filename} should have price in frontmatter`
        );
      });
    });
  }

  runner.test('No broken image links (local images should exist)', () => {
    const allFiles = [...pages, ...news, ...products, ...categories];
    const imagePattern = /!\[.*?\]\((\/images\/.*?)\)/g;

    allFiles.forEach(({filename, path: filePath}) => {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;

      while ((match = imagePattern.exec(content)) !== null) {
        const imagePath = match[1];
        const fullImagePath = path.join(config.OUTPUT_BASE, imagePath);

        runner.assert(
          fs.existsSync(fullImagePath),
          `${filename} references ${imagePath} which doesn't exist`
        );
      }
    });
  });

  runner.test('Filenames are valid (no special characters)', () => {
    const allFiles = [...pages, ...news, ...products, ...categories, ...reviews];
    const validFilenamePattern = /^[a-z0-9-]+\.md$/;

    allFiles.forEach(({filename}) => {
      runner.assertMatches(
        filename,
        validFilenamePattern,
        `${filename} should only contain lowercase letters, numbers, and hyphens`
      );
    });
  });

  runner.test('No duplicate filenames across collections', () => {
    const allFiles = [...pages, ...news, ...products, ...categories, ...reviews];
    const filenames = allFiles.map(f => f.filename);
    const uniqueFilenames = new Set(filenames);

    runner.assertEqual(
      filenames.length,
      uniqueFilenames.size,
      'Should not have duplicate filenames across all markdown files'
    );
  });

  if (reviews.length > 0) {
    runner.test('Review files have proper structure', () => {
      reviews.forEach(({filename, path}) => {
        const content = fs.readFileSync(path, 'utf8');
        const frontmatterEnd = content.indexOf('\n---\n', 4);
        const frontmatter = content.substring(0, frontmatterEnd);

        runner.assert(
          frontmatter.includes('name:'),
          `${filename} should have name in frontmatter`
        );
        runner.assert(
          frontmatter.includes('products:'),
          `${filename} should have products in frontmatter`
        );
        runner.assert(
          frontmatter.includes('rating:'),
          `${filename} should have rating in frontmatter`
        );
      });
    });
  }

  return runner.run();
};

module.exports = {runMarkdownOutputTests};
