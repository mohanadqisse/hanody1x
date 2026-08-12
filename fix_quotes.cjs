const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      
      // Look for `${API_BASE}/api/... followed by "
      // Regex explanation:
      // match `${API_BASE}/api/ (escaped)
      // match anything until " (captured)
      // match "
      const regex = /\`\$\{API_BASE\}\/api\/([^"]*?)"/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, '`${API_BASE}/api/$1`');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'client', 'src'));
