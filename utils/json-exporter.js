const fs = require('fs');

class JsonExporter {
  constructor() {
    this.data = {
      pages: [],
      news: [],
      products: [],
      categories: [],
      reviews: [],
      home: null,
      metadata: {
        exported_at: new Date().toISOString(),
        format_version: '1.0'
      }
    };
  }

  addPage(item) {
    this.data.pages.push(item);
  }

  addNews(item) {
    this.data.news.push(item);
  }

  addProduct(item) {
    this.data.products.push(item);
  }

  addCategory(item) {
    this.data.categories.push(item);
  }

  addReview(item) {
    this.data.reviews.push(item);
  }

  setHome(item) {
    this.data.home = item;
  }

  writeJson(outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(this.data, null, 2), 'utf8');
    const sizeInMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);

    console.log(`\n✓ JSON export written to: ${outputPath}`);
    console.log(`  Size: ${sizeInMB} MB`);
    console.log(`  Pages: ${this.data.pages.length}`);
    console.log(`  News: ${this.data.news.length}`);
    console.log(`  Products: ${this.data.products.length}`);
    console.log(`  Categories: ${this.data.categories.length}`);
    console.log(`  Reviews: ${this.data.reviews.length}`);
  }

  getData() {
    return this.data;
  }
}

let exporterInstance = null;

const getExporter = () => {
  if (!exporterInstance) exporterInstance = new JsonExporter();
  return exporterInstance;
};

const resetExporter = () => {
  exporterInstance = null;
};

module.exports = {JsonExporter, getExporter, resetExporter};
