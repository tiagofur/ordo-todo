import sharp from "sharp";
import iconGen from "icon-gen";
import fs from "fs";
import path from "path";

async function generateIcons() {
  const buildDir = path.join(__dirname, "..", "build");
  const svgPath = path.join(buildDir, "icon.svg");
  const pngPath = path.join(buildDir, "icon.png");
  const icoPath = path.join(buildDir, "icon.ico");
  const icnsPath = path.join(buildDir, "icon.icns");

  try {
    console.log("Generating icons...");

    // Convert SVG to PNG (512x512)
    await sharp(svgPath).resize(512, 512).png().toFile(pngPath);

    console.log("✓ PNG icon generated");

    // Generate ICO from PNG
    await iconGen(pngPath, buildDir, {
      ico: { name: "icon" },
      report: false,
    });

    console.log("✓ ICO icon generated");

    // Generate ICNS from PNG
    await iconGen(pngPath, buildDir, {
      icns: { name: "icon" },
      report: false,
    });

    console.log("✓ ICNS icon generated");
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
