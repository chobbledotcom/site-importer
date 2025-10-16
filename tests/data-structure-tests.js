const {TestRunner} = require('../utils/test-runner');

const runDataStructureTests = (exporter) => {
  const runner = new TestRunner();
  const data = exporter.getData();

  runner.test('Exporter has all required collections', () => {
    runner.assert(Array.isArray(data.pages), 'pages should be an array');
    runner.assert(Array.isArray(data.news), 'news should be an array');
    runner.assert(Array.isArray(data.products), 'products should be an array');
    runner.assert(Array.isArray(data.categories), 'categories should be an array');
    runner.assert(Array.isArray(data.reviews), 'reviews should be an array');
    runner.assertExists(data.metadata, 'metadata should exist');
  });

  runner.test('Metadata is properly formatted', () => {
    runner.assertExists(data.metadata.exported_at, 'exported_at should exist');
    runner.assertEqual(data.metadata.format_version, '1.0', 'format_version should be 1.0');
    runner.assert(
      new Date(data.metadata.exported_at).getTime() > 0,
      'exported_at should be valid ISO date'
    );
  });

  runner.test('At least some content was collected', () => {
    const totalItems = data.pages.length + data.news.length +
                      data.products.length + data.categories.length;
    runner.assertGreaterThan(totalItems, 0, 'Should have collected some content');
  });

  if (data.pages.length > 0) {
    runner.test('Page items have required fields', () => {
      const page = data.pages[0];
      runner.assertExists(page.slug, 'Page should have slug');
      runner.assertExists(page.filename, 'Page should have filename');
      runner.assertExists(page.content, 'Page should have content');
      runner.assertExists(page.metadata, 'Page should have metadata');
      runner.assertExists(page.frontmatter, 'Page should have frontmatter');
      runner.assert(page.filename.endsWith('.md'), 'Filename should end with .md');
    });

    runner.test('Page content starts with H1', () => {
      const page = data.pages[0];
      const h1Match = /^#\s+.+/m.test(page.content.trim());
      runner.assert(h1Match, 'Page content should start with H1 heading');
    });
  }

  if (data.products.length > 0) {
    runner.test('Product items have required fields', () => {
      const product = data.products[0];
      runner.assertExists(product.slug, 'Product should have slug');
      runner.assertExists(product.filename, 'Product should have filename');
      runner.assertExists(product.content, 'Product should have content');
      runner.assertExists(product.metadata, 'Product should have metadata');
      runner.assertExists(product.frontmatter, 'Product should have frontmatter');
    });

    runner.test('Products with prices have valid price format', () => {
      const productsWithPrice = data.products.filter(p => p.metadata.price);
      if (productsWithPrice.length > 0) {
        productsWithPrice.forEach(product => {
          runner.assert(
            typeof product.metadata.price === 'string' || typeof product.metadata.price === 'number',
            `Product ${product.slug} should have valid price format`
          );
        });
      }
    });
  }

  if (data.news.length > 0) {
    runner.test('News items have required fields', () => {
      const news = data.news[0];
      runner.assertExists(news.slug, 'News should have slug');
      runner.assertExists(news.filename, 'News should have filename');
      runner.assertExists(news.content, 'News should have content');
      runner.assertExists(news.metadata, 'News should have metadata');
      runner.assertExists(news.frontmatter, 'News should have frontmatter');
    });
  }

  if (data.categories.length > 0) {
    runner.test('Category items have required fields', () => {
      const category = data.categories[0];
      runner.assertExists(category.slug, 'Category should have slug');
      runner.assertExists(category.filename, 'Category should have filename');
      runner.assertExists(category.content, 'Category should have content');
    });
  }

  if (data.reviews.length > 0) {
    runner.test('Review items have required fields', () => {
      const review = data.reviews[0];
      runner.assertExists(review.slug, 'Review should have slug');
      runner.assertExists(review.filename, 'Review should have filename');
      runner.assertExists(review.name, 'Review should have name');
      runner.assertExists(review.content, 'Review should have content');
      runner.assert(Array.isArray(review.products), 'Review should have products array');
      runner.assertExists(review.rating, 'Review should have rating');
    });
  }

  runner.test('No duplicate slugs within collections', () => {
    const checkDuplicates = (collection, name) => {
      const slugs = collection.map(item => item.slug);
      const uniqueSlugs = new Set(slugs);
      runner.assertEqual(
        slugs.length,
        uniqueSlugs.size,
        `${name} should not have duplicate slugs`
      );
    };

    checkDuplicates(data.pages, 'Pages');
    checkDuplicates(data.news, 'News');
    checkDuplicates(data.products, 'Products');
    checkDuplicates(data.categories, 'Categories');
  });

  runner.test('Frontmatter is valid YAML format', () => {
    const checkFrontmatter = (item, type) => {
      if (item.frontmatter) {
        runner.assert(
          item.frontmatter.startsWith('---'),
          `${type} frontmatter should start with ---`
        );
        runner.assert(
          item.frontmatter.includes('\n---'),
          `${type} frontmatter should end with ---`
        );
      }
    };

    if (data.pages.length > 0) checkFrontmatter(data.pages[0], 'Page');
    if (data.products.length > 0) checkFrontmatter(data.products[0], 'Product');
    if (data.news.length > 0) checkFrontmatter(data.news[0], 'News');
  });

  return runner.run();
};

module.exports = {runDataStructureTests};
