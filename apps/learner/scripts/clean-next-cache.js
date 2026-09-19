const fs = require("fs");
const path = require("path");

const appDirectory = path.resolve(__dirname, "..");
const generatedDirectories = [".next", ".next-stale-build-cache"];

for (const directory of generatedDirectories) {
  const target = path.join(appDirectory, directory);

  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    console.log(`[learner:clean] Removed ${directory}`);
  }
}
