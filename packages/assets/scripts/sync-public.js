const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../../..");
const staticDir = path.resolve(__dirname, "../static");

const targetApps = [
  "apps/landing",
  "apps/learner",
  "apps/admin",
  "apps/faculty"
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

targetApps.forEach((appRelativePath) => {
  const appPublicDir = path.join(rootDir, appRelativePath, "public");

  // Copy favicons to public root
  const faviconsDir = path.join(staticDir, "favicons");
  if (fs.existsSync(faviconsDir)) {
    const files = fs.readdirSync(faviconsDir);
    fs.mkdirSync(appPublicDir, { recursive: true });
    files.forEach((file) => {
      if (file !== "favicon_head_snippet.html") {
        fs.copyFileSync(
          path.join(faviconsDir, file),
          path.join(appPublicDir, file)
        );
      }
    });
  }

  // Copy social images to public root
  const socialDir = path.join(staticDir, "social");
  if (fs.existsSync(socialDir)) {
    const files = fs.readdirSync(socialDir);
    files.forEach((file) => {
      fs.copyFileSync(
        path.join(socialDir, file),
        path.join(appPublicDir, file)
      );
    });
  }

  // Copy brand assets to public/assets/brand
  const brandDir = path.join(staticDir, "brand");
  const destBrandDir = path.join(appPublicDir, "assets/brand");
  copyDir(brandDir, destBrandDir);

  console.log(`[assets:sync] Synced public assets to ${appRelativePath}/public`);
});
