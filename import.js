#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseArgs, validateArgs } = require('./utils/cli-args');
const { cleanDirectory } = require('./utils/directory-cleaner');
const { downloadSite } = require('./utils/site-downloader');

const OLD_SITE_DIR = path.join(__dirname, 'old_site');
const OUTPUT_DIR = path.join(__dirname, 'output');

const { siteUrl, outputFormat } = parseArgs(process.argv);
validateArgs(siteUrl, outputFormat);

console.log('🚀 Starting import process...\n');

cleanDirectory(OUTPUT_DIR, 'output directory');

if (fs.existsSync(OLD_SITE_DIR)) {
  console.log('📁 Using existing old_site directory (skipping download)');
  console.log('   To re-download, delete the old_site directory first\n');
} else {
  fs.mkdirSync(OLD_SITE_DIR, { recursive: true });
  downloadSite(siteUrl, OLD_SITE_DIR);
}

process.env.OUTPUT_FORMAT = outputFormat;
console.log(`📝 Output format: ${outputFormat}\n`);

try {
  const { main } = require('./index.js');
  main();
} catch (error) {
  console.error('❌ Conversion failed:', error.message);
  process.exit(1);
}
