#!/usr/bin/env node

/**
 * Main orchestrator for the site conversion process
 * This coordinates all the individual converters
 */

const path = require('path')
const { execSync } = require('child_process')
const { convertPages, convertBlogPosts, convertProducts, convertCategories, convertHomeContent, convertBlogIndex, convertReviewsIndex, convertSpecialPages } = require('./converters')
const { extractFavicons } = require('./utils/favicon-extractor')
const ResultsTracker = require('./utils/results-tracker')
const { getExporter } = require('./utils/json-exporter')
const { writeMarkdownFiles } = require('./utils/markdown-writer')
const { runDataStructureTests } = require('./tests/data-structure-tests')
const { runMarkdownOutputTests } = require('./tests/markdown-output-tests')

/**
 * Check if pandoc is installed
 * @throws {Error} If pandoc is not found
 */
const checkPandoc = () => {
  try {
    execSync('pandoc --version', { stdio: 'ignore' })
  } catch (_error) {
    console.error('\n❌ ERROR: pandoc is not installed!')
    console.error('   Please install pandoc before running the importer:')
    console.error('   - Ubuntu/Debian: sudo apt-get install pandoc')
    console.error('   - macOS: brew install pandoc')
    console.error('   - Windows: https://pandoc.org/installing.html\n')
    process.exit(1)
  }
}

/**
 * Main execution function
 */
const main = async () => {
  checkPandoc()

  const startTime = Date.now()
  const tracker = new ResultsTracker()

  try {
    const oldSitePath = path.join(__dirname, 'old_site')
    const outputBase = path.join(__dirname, 'output')
    const faviconOutputPath = path.join(outputBase, 'assets/favicon')
    tracker.add('Favicons', extractFavicons(oldSitePath, faviconOutputPath))

    tracker.add('Homepage Content', await convertHomeContent())
    tracker.add('Pages', await convertPages())
    tracker.add('Special Pages', await convertSpecialPages())
    tracker.add('Blog Posts', await convertBlogPosts())
    tracker.add('Products', await convertProducts())
    tracker.add('Categories', await convertCategories())
    tracker.add('Blog Index', convertBlogIndex())
    tracker.add('Reviews Index', await convertReviewsIndex())

    console.log('')

    const exporter = getExporter()

    const dataTestsPassed = await runDataStructureTests(exporter)
    if (!dataTestsPassed) {
      console.error('\n❌ Data structure validation failed!')
      process.exit(1)
    }

    const outputFormat = process.env.OUTPUT_FORMAT
    if (outputFormat === 'json') {
      const jsonPath = path.join(outputBase, 'content.json')
      exporter.writeJson(jsonPath)
    } else {
      writeMarkdownFiles(exporter)

      const markdownTestsPassed = await runMarkdownOutputTests()
      if (!markdownTestsPassed) {
        console.error('\n❌ Markdown output validation failed!')
        process.exit(1)
      }
    }

    tracker.displaySummary()

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Time elapsed: ${elapsedTime} seconds`)
    console.log('\n✨ Conversion completed successfully!')

    process.exit(tracker.totalFailed > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n❌ Error during conversion:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main }
