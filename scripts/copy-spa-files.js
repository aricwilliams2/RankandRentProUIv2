import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

// Copy SPA routing files to dist folder
const filesToCopy = [
  '_redirects',
  'vercel.json',
  'netlify.toml',
  'render.yaml',
  '404.html'
];

filesToCopy.forEach(file => {
  const sourcePath = join(process.cwd(), file);
  const destPath = join(process.cwd(), 'dist', file);
  
  if (existsSync(sourcePath)) {
    try {
      copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist folder`);
    } catch (error) {
      console.error(`❌ Failed to copy ${file}:`, error);
    }
  } else {
    console.log(`⚠️  ${file} not found, skipping...`);
  }
});
