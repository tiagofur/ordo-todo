const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Convert SVG to PNG
async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    await sharp(svgPath).resize(size, size).png().toFile(pngPath);
    console.log(`Generated ${pngPath}`);
  } catch (error) {
    console.error(`Error converting ${svgPath} to ${pngPath}:`, error);
  }
}

async function generateIcons() {
  const svg192 = path.join(iconsDir, "icon-192.svg");
  const svg512 = path.join(iconsDir, "icon-512.svg");
  const png192 = path.join(iconsDir, "icon-192.png");
  const png512 = path.join(iconsDir, "icon-512.png");

  // Check if SVG files exist
  if (!fs.existsSync(svg192) || !fs.existsSync(svg512)) {
    console.error(
      "SVG icon files not found. Please create icon-192.svg and icon-512.svg first."
    );
    return;
  }

  // Convert SVGs to PNGs
  await convertSvgToPng(svg192, png192, 192);
  await convertSvgToPng(svg512, png512, 512);

  console.log("Icon generation complete!");
}

generateIcons().catch(console.error);
