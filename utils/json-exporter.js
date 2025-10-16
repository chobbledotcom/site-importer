const fs = require('fs');
const path = require('path');

/**
 * JSON data collector - accumulates all content items
 */
class JsonExporter {
  constructor() {
    this.data = {
      pages: [],
      news: [],
      products: [],
      categories: [],
      home: null,
      metadata: {
        exported_at: new Date().toISOString(),
        format_version: '1.0'
      }
    };
  }

  /**
   * Add a page to the export
   * @param {Object} item - Page data
   */
  addPage(item) {
    this.data.pages.push(item);
  }

  /**
   * Add a news/blog post to the export
   * @param {Object} item - News data
   */
  addNews(item) {
    this.data.news.push(item);
  }

  /**
   * Add a product to the export
   * @param {Object} item - Product data
   */
  addProduct(item) {
    this.data.products.push(item);
  }

  /**
   * Add a category to the export
   * @param {Object} item - Category data
   */
  addCategory(item) {
    this.data.categories.push(item);
  }

  /**
   * Set home page data
   * @param {Object} item - Home page data
   */
  setHome(item) {
    this.data.home = item;
  }

  /**
   * Write the collected data to a JSON file
   * @param {string} outputPath - Path to write JSON file
   */
  writeJson(outputPath) {
    const jsonString = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf8');

    // Calculate file size for reporting
    const stats = fs.statSync(outputPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n✓ JSON export written to: ${outputPath}`);
    console.log(`  Size: ${sizeInMB} MB`);
    console.log(`  Pages: ${this.data.pages.length}`);
    console.log(`  News: ${this.data.news.length}`);
    console.log(`  Products: ${this.data.products.length}`);
    console.log(`  Categories: ${this.data.categories.length}`);
  }

  /**
   * Get the collected data
   * @returns {Object} All collected data
   */
  getData() {
    return this.data;
  }
}

// Global singleton instance
let exporterInstance = null;

/**
 * Get the global JSON exporter instance
 * @returns {JsonExporter}
 */
const getExporter = () => {
  if (!exporterInstance) {
    exporterInstance = new JsonExporter();
  }
  return exporterInstance;
};

/**
 * Reset the global exporter (for testing)
 */
const resetExporter = () => {
  exporterInstance = null;
};

module.exports = {
  JsonExporter,
  getExporter,
  resetExporter
};
