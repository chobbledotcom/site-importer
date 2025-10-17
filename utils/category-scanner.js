const path = require('path')
const { readHtmlFile, listHtmlFiles} = require('./filesystem')

/**
 * Scan all category HTML files to build maps of:
 * - Product slugs to their categories
 * - Product slugs to their display order (position in first category they appear in)
 * @returns {Object} { productCategoriesMap: Map<string, string[]>, productOrderMap: Map<string, number> }
 */
const scanProductCategories = () => {
  const productCategoriesMap = new Map()
  const productOrderMap = new Map()

  const oldSitePath = path.join(__dirname, '..', 'old_site')
  const categoriesDir = path.join(oldSitePath, 'categories')
  const categoryFiles = listHtmlFiles(categoriesDir)

  if (categoryFiles.length === 0) {
    return { productCategoriesMap, productOrderMap }
  }

  categoryFiles.forEach(file => {
    const categorySlug = file.replace('.php.html', '')
    const htmlPath = path.join(categoriesDir, file)
    const htmlContent = readHtmlFile(htmlPath)

    // Find all product links in the category page
    // Pattern: href="/products/PRODUCT-SLUG.php" or href="../products/PRODUCT-SLUG.php.html"
    const productLinkRegex = /href="(?:\.\.)?\/products\/([^"]+)\.php(?:\.html)?"/g
    const seenInThisCategory = new Set()
    let match
    let orderIndex = 1

    while ((match = productLinkRegex.exec(htmlContent)) !== null) {
      const productSlug = match[1]

      // Skip duplicates within the same category (products appear twice: image + button)
      if (seenInThisCategory.has(productSlug)) {
        continue
      }
      seenInThisCategory.add(productSlug)

      // Add category to product's category list
      if (!productCategoriesMap.has(productSlug)) {
        productCategoriesMap.set(productSlug, [])
      }

      const categories = productCategoriesMap.get(productSlug)
      const categoryPath = `categories/${categorySlug}.md`
      if (!categories.includes(categoryPath)) {
        categories.push(categoryPath)
      }

      // Set product order based on first occurrence (products only have one order)
      if (!productOrderMap.has(productSlug)) {
        productOrderMap.set(productSlug, orderIndex)
      }
      orderIndex++
    }
  })

  return { productCategoriesMap, productOrderMap }
}

module.exports = {
  scanProductCategories
}
