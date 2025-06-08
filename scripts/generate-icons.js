const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'favicon.png': 32
};

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../app/assets/icon.svg'));

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../assets/', filename));
    
    console.log(`Generated ${filename} (${size}x${size})`);
  }
}

generateIcons().catch(console.error); 