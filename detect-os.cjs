// detect-os.js
const { execSync } = require("child_process");
const os = require("os");

try {
  const platform = os.platform(); // 'win32', 'linux', 'darwin', etc.
  console.log(`Detected platform: ${platform}`);

  if (platform === "win32") {
    console.log("Running Windows backend...");
    execSync("npm run dev:backend_win", { stdio: "inherit" });
  } else {
    console.log("Running Linux/Mac backend...");
    execSync("npm run dev:backend_linux", { stdio: "inherit" });
  }
} catch (err) {
  console.error("Error running backend:", err.message);
  process.exit(1);
}

