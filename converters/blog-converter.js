const path = require('path')
const { listHtmlFiles } = require('../utils/filesystem')
const { extractBlogDate, extractBlogHeading, extractBlogImage } = require('../utils/metadata-extractor')
const { generateBlogFrontmatter } = require('../utils/frontmatter-generator')
const { downloadProductImage, downloadEmbeddedImages } = require('../utils/image-downloader')
const { createConverter } = require('../utils/base-converter')

const DEFAULT_DATE = '2020-01-01'

const { convertSingle, convertBatch } = createConverter({
  contentType: 'blog',
  extractors: {
    date: (htmlContent, markdown) => extractBlogDate(markdown, DEFAULT_DATE),
    blogHeading: (htmlContent) => extractBlogHeading(htmlContent),
    blogImage: (htmlContent, markdown) => extractBlogImage(markdown)
  },
  beforeWrite: async (content, extracted, slug) => {
    if (extracted.blogImage) {
      extracted.localImagePath = await downloadProductImage(extracted.blogImage, slug)
    }
    return await downloadEmbeddedImages(content, 'news', slug)
  },
  frontmatterGenerator: (metadata, slug, extracted) => ({
    frontmatter: generateBlogFrontmatter(metadata, slug, extracted.date, extracted.blogHeading, extracted.localImagePath),
    filename: `${extracted.date}-${slug}.md`
  })
})

/**
 * Convert all blog posts from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertBlogPosts = async () => {
  const outputDir = path.join(__dirname, '..', 'output', 'news')
  const blogDir = path.join(__dirname, '..', 'old_site', 'blog')
  const files = listHtmlFiles(blogDir)

  const result = await convertBatch(files, blogDir, outputDir)
  console.log(`✓ News: ${result.successful}/${result.total}`)
  return result
}

const convertBlogPost = (file, inputDir, outputDir) =>
  convertSingle(file, inputDir, outputDir)

module.exports = {
  convertBlogPost,
  convertBlogPosts
}
