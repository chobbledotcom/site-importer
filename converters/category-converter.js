const path = require('path')
const { listHtmlFiles } = require('../utils/filesystem')
const { extractCategoryName, extractContentHeading } = require('../utils/metadata-extractor')
const { generateCategoryFrontmatter } = require('../utils/frontmatter-generator')
const { downloadEmbeddedImages } = require('../utils/image-downloader')
const { createConverter } = require('../utils/base-converter')

const { convertSingle, convertBatch } = createConverter({
  contentType: 'category',
  extractors: {
    categoryName: (htmlContent) => extractCategoryName(htmlContent),
    categoryHeading: (htmlContent) => extractContentHeading(htmlContent)
  },
  frontmatterGenerator: (metadata, slug, extracted, context) => {
    if (extracted.categoryName) {
      metadata.title = extracted.categoryName
    }
    return generateCategoryFrontmatter(metadata, slug, extracted.categoryHeading, context.categoryIndex)
  },
  beforeWrite: async (content, extracted, slug) =>
    await downloadEmbeddedImages(content, 'categories', slug)
})

/**
 * Convert all categories from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertCategories = async () => {
  const outputDir = path.join(__dirname, '..', 'output', 'categories')
  const categoriesDir = path.join(__dirname, '..', 'old_site', 'categories')
  const files = listHtmlFiles(categoriesDir)

  if (files.length === 0) {
    console.log('✓ Categories: 0/0')
    return { successful: 0, failed: 0, total: 0 }
  }

  const result = await convertBatch(files, categoriesDir, outputDir)
  console.log(`✓ Categories: ${result.successful}/${result.total}`)
  return result
}

const convertCategory = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir)

module.exports = {
  convertCategory,
  convertCategories
}
