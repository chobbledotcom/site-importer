const path = require('path')
const { listHtmlFiles } = require('../utils/filesystem')
const { extractContentHeading } = require('../utils/metadata-extractor')
const { generatePageFrontmatter } = require('../utils/frontmatter-generator')
const { downloadEmbeddedImages } = require('../utils/image-downloader')
const { createConverter } = require('../utils/base-converter')
const fs = require('fs')

const { convertSingle, convertBatch } = createConverter({
  contentType: 'page',
  extractors: {
    pageHeading: (htmlContent) => extractContentHeading(htmlContent)
  },
  frontmatterGenerator: (metadata, slug, extracted) =>
    generatePageFrontmatter(metadata, slug, extracted.pageHeading),
  beforeWrite: async (content, extracted, slug) =>
    await downloadEmbeddedImages(content, 'pages', slug)
})

/**
 * Convert all pages from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertPages = async () => {
  const oldSitePath = path.join(__dirname, '..', 'old_site')
  const outputDir = path.join(__dirname, '..', 'output', 'pages')
  const pagesDir = path.join(oldSitePath, 'pages')
  const pageFiles = listHtmlFiles(pagesDir)

  const rootPages = ['contact.php.html'].filter(file =>
    fs.existsSync(path.join(oldSitePath, file))
  )

  const pagesResult = await convertBatch(pageFiles, pagesDir, outputDir)
  const rootResult = await convertBatch(rootPages, oldSitePath, outputDir)

  const result = {
    successful: pagesResult.successful + rootResult.successful,
    failed: pagesResult.failed + rootResult.failed,
    total: pagesResult.total + rootResult.total
  }

  console.log(`✓ Pages: ${result.successful}/${result.total}`)
  return result
}

const convertPage = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir)

module.exports = {
  convertPage,
  convertPages
}
