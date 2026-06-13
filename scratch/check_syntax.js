const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract everything between <script type="module"> and </script>
const regex = /<script([^>]*)>([\s\S]*?)<\/script>/g;
let match;
let hasErrors = false;

while ((match = regex.exec(html)) !== null) {
  const attrs = match[1];
  let jsCode = match[2];
  
  // Skip external scripts
  if (attrs.includes('src=')) {
    continue;
  }
  if (!jsCode.trim()) {
    continue;
  }
  
  // Replace ES6 import statements with empty comments so vm.Script doesn't crash on module imports
  jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+["'].*?["'];/g, '/* import bypassed */');
  try {
    const vm = require('vm');
    new vm.Script(jsCode);
    console.log("Syntax check passed for script block!");
  } catch (err) {
    console.error("Syntax Error found inside script block:");
    console.error(err);
    hasErrors = true;
  }
}

if (!hasErrors) {
  console.log("No syntax errors detected in index.html scripts.");
} else {
  process.exit(1);
}
