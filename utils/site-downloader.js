const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const downloadSite = (siteUrl, oldSiteDir) => {
  console.log(`📥 Downloading site from ${siteUrl}...`);
  const wgetTempDir = path.join(__dirname, '..', 'wget_temp');

  try {
    execSync(
      `wget --recursive --no-parent --page-requisites --adjust-extension --no-clobber --directory-prefix="${wgetTempDir}" "${siteUrl}"`,
      { stdio: 'inherit' }
    );

    const domain = new URL(siteUrl).hostname;
    const downloadedSitePath = path.join(wgetTempDir, domain);

    if (fs.existsSync(downloadedSitePath)) {
      fs.readdirSync(downloadedSitePath).forEach(file => {
        fs.renameSync(
          path.join(downloadedSitePath, file),
          path.join(oldSiteDir, file)
        );
      });
      fs.rmSync(wgetTempDir, { recursive: true, force: true });
    }

    console.log('✓ Site downloaded successfully\n');
  } catch (error) {
    if (fs.existsSync(wgetTempDir)) {
      fs.rmSync(wgetTempDir, { recursive: true, force: true });
    }
    throw new Error(`Failed to download site: ${error.message}`);
  }
};

module.exports = { downloadSite };
