const path = require('path')
const { writeMarkdownFile, ensureDir } = require('./filesystem')
const config = require('../config')

const writeMarkdownFiles = (exporter) => {
  console.log('\n📝 Writing markdown files...\n')

  const writeSingle = (item, dir) => {
    const outputPath = path.join(config.OUTPUT_BASE, dir, item.filename)
    const fullContent = `${item.frontmatter}\n\n${item.content}`
    writeMarkdownFile(outputPath, fullContent)
  }

  const writeCollection = (collection, dir, label) => {
    if (collection.length === 0) return

    const outputDir = path.join(config.OUTPUT_BASE, dir)
    ensureDir(outputDir)

    console.log(`Writing ${collection.length} ${label}...`)
    collection.forEach(item => writeSingle(item, dir))
    console.log(`✓ ${label} written\n`)
  }

  const data = exporter.getData()

  writeCollection(data.pages, config.paths.pages, 'pages')
  writeCollection(data.news, config.paths.news, 'news articles')
  writeCollection(data.products, config.paths.products, 'products')
  writeCollection(data.categories, config.paths.categories, 'categories')
  writeCollection(data.reviews, 'reviews', 'reviews')

  if (data.home) {
    console.log('Writing home page...')
    writeSingle(data.home, '')
    console.log('✓ Home page written\n')
  }
}

module.exports = { writeMarkdownFiles }
