#!/usr/bin/env node

/**
 * Main import script
 * Usage: npm run import https://www.myalarmsecurity.co.uk
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = process.argv[2];
const OLD_SITE_DIR = path.join(__dirname, 'old_site');
const OUTPUT_DIR = path.join(__dirname, 'output');

if (!SITE_URL) {
  console.error('❌ ERROR: No URL provided!');
  console.error('Usage: npm run import <url>');
  console.error('Example: npm run import https://www.myalarmsecurity.co.uk');
  process.exit(1);
}

console.log('🚀 Starting import process...\n');

// Step 1: Delete existing output directory
console.log('📁 Cleaning output directory...');
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  console.log('✓ Output directory cleaned\n');
}

// Step 2: Delete existing old_site directory
console.log('📁 Cleaning old_site directory...');
if (fs.existsSync(OLD_SITE_DIR)) {
  fs.rmSync(OLD_SITE_DIR, { recursive: true, force: true });
  console.log('✓ Old_site directory cleaned\n');
}

// Step 3: Create old_site directory
fs.mkdirSync(OLD_SITE_DIR, { recursive: true });

// Step 4: wget the site
console.log(`📥 Downloading site from ${SITE_URL}...`);
const wgetTempDir = path.join(__dirname, 'wget_temp');
try {
  // Download to temp directory first
  execSync(
    `wget --recursive --no-parent --page-requisites --adjust-extension --no-clobber --directory-prefix="${wgetTempDir}" "${SITE_URL}"`,
    { stdio: 'inherit' }
  );

  // Extract domain name from URL
  const urlObj = new URL(SITE_URL);
  const domain = urlObj.hostname;
  const downloadedSitePath = path.join(wgetTempDir, domain);

  // Move contents to old_site directory
  if (fs.existsSync(downloadedSitePath)) {
    const files = fs.readdirSync(downloadedSitePath);
    files.forEach(file => {
      const srcPath = path.join(downloadedSitePath, file);
      const destPath = path.join(OLD_SITE_DIR, file);
      fs.renameSync(srcPath, destPath);
    });
    // Clean up temp directory
    fs.rmSync(wgetTempDir, { recursive: true, force: true });
  }

  console.log('✓ Site downloaded successfully\n');
} catch (error) {
  console.error('❌ Failed to download site:', error.message);
  // Clean up temp directory on error
  if (fs.existsSync(wgetTempDir)) {
    fs.rmSync(wgetTempDir, { recursive: true, force: true });
  }
  process.exit(1);
}

// Step 5: Run the converter
console.log('🔄 Converting content...\n');
try {
  const { main } = require('./index.js');
  main();
} catch (error) {
  console.error('❌ Conversion failed:', error.message);
  process.exit(1);
}
