const fs = require('fs');

const cleanDirectory = (dirPath, label) => {
  console.log(`📁 Cleaning ${label}...`);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ ${label} cleaned\n`);
  }
};

module.exports = { cleanDirectory };
