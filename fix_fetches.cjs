const fs = require('fs');
const path = require('path');

const API_BASE_IMPORT = `import { API_BASE } from "@/lib/api";\n`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      
      // Replace fetch("/api/ with fetch(API_BASE + "/api/
      if (content.includes('fetch("/api/')) {
        content = content.replace(/fetch\("\/api\//g, 'fetch(API_BASE + "/api/');
        changed = true;
      }
      
      // Replace fetch(`/api/ with fetch(API_BASE + `/api/
      if (content.includes('fetch(`/api/')) {
        content = content.replace(/fetch\(`\/api\//g, 'fetch(API_BASE + `/api/');
        changed = true;
      }

      if (changed) {
        // We only add import if it doesn't exist
        if (!content.includes('import { API_BASE }')) {
          content = API_BASE_IMPORT + content;
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Create the lib/api.ts file
fs.mkdirSync(path.join(__dirname, 'client', 'src', 'lib'), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, 'client', 'src', 'lib', 'api.ts'),
  'export const API_BASE = import.meta.env.VITE_API_URL || "https://hanody1x-1-n380.onrender.com";\n'
);

processDir(path.join(__dirname, 'client', 'src'));
