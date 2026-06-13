const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexHtmlPath = path.join(rootDir, 'index.html');
const appJsPath = path.join(rootDir, 'app.js');

const NAMESPACING_CODE = `// =====================================================
// LOCALSTORAGE NAMESPACING LAYER (Origin conflict fix)
// =====================================================
const LS_PREFIX = "MMC_INS_";
const KEYS_TO_MIGRATE = [
  'insurance_ledger',
  'insurance_ledger_backup',
  'simulated_date',
  'whatsapp_template',
  'waSent',
  'MMC_FIREBASE_ENABLED',
  'MMC_FIREBASE_API_KEY',
  'MMC_FIREBASE_PROJECT_ID',
  'MMC_FIREBASE_AUTH_DOMAIN',
  'MMC_FIREBASE_DATABASE_URL',
  'MMC_FIREBASE_STORAGE_BUCKET',
  'MMC_FIREBASE_SENDER_ID',
  'MMC_FIREBASE_APP_ID',
  'MMC_FIREBASE_MEASUREMENT_ID',
  'MMC_GDRIVE_ENABLED',
  'MMC_GDRIVE_WEBAPP_URL',
  'MMC_GDRIVE_FOLDER_ID'
];

KEYS_TO_MIGRATE.forEach(key => {
  const newKey = LS_PREFIX + key;
  const oldValue = window.localStorage.getItem(key);
  const newValue = window.localStorage.getItem(newKey);
  if (oldValue !== null && newValue === null) {
    window.localStorage.setItem(newKey, oldValue);
  }
});

const storage = {
  getItem: (key) => window.localStorage.getItem(LS_PREFIX + key),
  setItem: (key, val) => window.localStorage.setItem(LS_PREFIX + key, val),
  removeItem: (key) => window.localStorage.removeItem(LS_PREFIX + key)
};
`;

function processFile(filePath, isHtml) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace localStorage methods with storage methods
  content = content.replace(/localStorage\.getItem/g, 'storage.getItem');
  content = content.replace(/localStorage\.setItem/g, 'storage.setItem');
  content = content.replace(/localStorage\.removeItem/g, 'storage.removeItem');
  
  if (isHtml) {
    // Inject namespacing code right after the opening script tag
    const target = '<script>';
    const index = content.indexOf(target);
    if (index !== -1) {
      const insertPos = index + target.length;
      content = content.slice(0, insertPos) + '\n' + NAMESPACING_CODE + content.slice(insertPos);
    }
  } else {
    // Inject at the very beginning of the js file
    content = NAMESPACING_CODE + '\n' + content;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully processed ${path.basename(filePath)}`);
}

processFile(indexHtmlPath, true);
processFile(appJsPath, false);
console.log("All files updated successfully.");
