const path = require('path')
const { listHtmlFiles } = require('../utils/filesystem')
const { extractPrice, extractReviews, extractProductName, extractProductImages, extractContentHeading } = require('../utils/metadata-extractor')
const { generateProductFrontmatter } = require('../utils/frontmatter-generator')
const { downloadProductImage, downloadEmbeddedImages } = require('../utils/image-downloader')
const { scanProductCategories } = require('../utils/category-scanner')
const { createConverter } = require('../utils/base-converter')

const { convertSingle, convertBatch } = createConverter({
  contentType: 'product',
  extractors: {
    price: (htmlContent) => extractPrice(htmlContent),
    reviews: (htmlContent) => extractReviews(htmlContent),
    productName: (htmlContent) => extractProductName(htmlContent),
    productHeading: (htmlContent) => extractContentHeading(htmlContent),
    images: (htmlContent) => extractProductImages(htmlContent)
  },
  frontmatterGenerator: (metadata, slug, extracted, context) => {
    const categories = context.productCategoriesMap?.get(slug) || []
    const productOrder = context.productOrderMap?.get(slug)
    const localImages = { header_image: extracted.localImagePath }
    return generateProductFrontmatter(
      metadata,
      slug,
      extracted.price,
      categories,
      extracted.productName,
      localImages,
      extracted.productHeading,
      productOrder
    )
  },
  beforeWrite: async (content, extracted, slug) => {
    extracted.localImagePath = await downloadProductImage(extracted.images.header_image, slug)
    return await downloadEmbeddedImages(content, 'products', slug)
  },
  afterConvert: async (extracted, slug, context) => {
    const { reviewsMap } = context
    if (extracted.reviews.length > 0) {
      extracted.reviews.forEach((review) => {
        const reviewSlug = review.name.toLowerCase().replace(/\s+/g, '-')
        if (reviewsMap.has(reviewSlug)) {
          const existingReview = reviewsMap.get(reviewSlug)
          if (!existingReview.products.includes(`products/${slug}.md`)) {
            existingReview.products.push(`products/${slug}.md`)
          }
        } else {
          reviewsMap.set(reviewSlug, {
            name: review.name,
            body: review.body,
            products: [`products/${slug}.md`]
          })
        }
      })
    }
  }
})

const convertProduct = (file, inputDir, outputDir, reviewsDir, reviewsMap, productCategoriesMap) => {
  return convertSingle(file, inputDir, outputDir, { reviewsMap, productCategoriesMap })
}

/**
 * Convert all products from old site to markdown
 * @returns {Promise<Object>} Conversion results
 */
const convertProducts = async () => {
  const outputDir = path.join(__dirname, '..', 'output', 'products')
  const productsDir = path.join(__dirname, '..', 'old_site', 'products')
  const files = listHtmlFiles(productsDir)

  if (files.length === 0) {
    console.log('✓ Products: 0/0')
    return { successful: 0, failed: 0, total: 0 }
  }

  const { productCategoriesMap, productOrderMap } = scanProductCategories()
  const reviewsMap = new Map()
  const result = await convertBatch(files, productsDir, outputDir, { reviewsMap, productCategoriesMap, productOrderMap })

  if (reviewsMap.size > 0) {
    const { getExporter } = require('../utils/json-exporter')
    const exporter = getExporter()

    reviewsMap.forEach((reviewData, slug) => {
      const reviewFilename = `${slug}.md`
      const productsYaml = reviewData.products.map(p => `"${p}"`).join(', ')
      const frontmatter = `---\nname: "${reviewData.name}"\nproducts: [${productsYaml}]\nrating: 5\n---`

      exporter.addReview({
        slug,
        filename: reviewFilename,
        name: reviewData.name,
        products: reviewData.products,
        rating: 5,
        content: reviewData.body,
        frontmatter
      })
    })
    console.log(`✓ Products: ${result.successful}/${result.total}, Reviews: ${reviewsMap.size}`)
  } else {
    console.log(`✓ Products: ${result.successful}/${result.total}`)
  }

  return result
}

module.exports = {
  convertProduct,
  convertProducts
}
