const parseArgs = (argv) => {
  const args = argv.slice(2)
  const siteUrl = args.find(arg => !arg.startsWith('--'))
  const formatArg = args.find(arg => arg.startsWith('--format='))
  const outputFormat = formatArg ? formatArg.split('=')[1] : null

  return { siteUrl, outputFormat }
}

const validateArgs = (siteUrl, outputFormat) => {
  if (!siteUrl) {
    console.error('❌ ERROR: No URL provided!')
    console.error('Usage: npm run import <url> --format=json|markdown')
    console.error('Example: npm run import https://www.example.com --format=markdown')
    console.error('Example: npm run import https://www.example.com --format=json')
    process.exit(1)
  }

  if (!outputFormat) {
    console.error('❌ ERROR: Format argument is required!')
    console.error('Usage: npm run import <url> --format=json|markdown')
    console.error('Example: npm run import https://www.example.com --format=markdown')
    console.error('Example: npm run import https://www.example.com --format=json')
    process.exit(1)
  }

  if (!['markdown', 'json'].includes(outputFormat)) {
    console.error('❌ ERROR: Invalid format! Must be "markdown" or "json"')
    console.error('Usage: npm run import <url> --format=json|markdown')
    process.exit(1)
  }
}

module.exports = { parseArgs, validateArgs }
