import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = './src';
const SRC_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
let updatedFiles = 0;

function getAllSourceFiles(dir) {
  let files = [];
  try {
    readdirSync(dir).forEach(file => {
      const full = join(dir, file);
      if (statSync(full).isDirectory()) {
        files = files.concat(getAllSourceFiles(full));
      } else if (SRC_EXTENSIONS.includes(extname(file).toLowerCase())) {
        files.push(full);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
  return files;
}

const files = getAllSourceFiles(SRC_DIR);
console.log(`Scanning ${files.length} source files to update image extensions...`);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  // Regex matches .jpg, .jpeg, .png when followed by a single quote, double quote, backtick, or closing bracket/parenthesis.
  // This avoids accidental matches on other variables or strings.
  const regex = /\.(jpg|jpeg|png)(?=['"`\)])/g;
  
  if (regex.test(content)) {
    const updatedContent = content.replace(regex, '.webp');
    writeFileSync(file, updatedContent, 'utf8');
    console.log(`Updated references in: ${file}`);
    updatedFiles++;
  }
}

console.log(`\nFinished updating source files. Updated ${updatedFiles} files.`);
