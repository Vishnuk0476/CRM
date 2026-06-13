import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const DIRS = ['./public', './src/assets'];
const EXTENSIONS = ['.jpg', '.jpeg', '.png'];
let converted = 0;
let skipped = 0;

function getAllFiles(dir) {
  let files = [];
  try {
    if (statSync(dir).isDirectory()) {
      readdirSync(dir).forEach(file => {
        const full = join(dir, file);
        if (statSync(full).isDirectory()) {
          files = files.concat(getAllFiles(full));
        } else if (EXTENSIONS.includes(extname(file).toLowerCase())) {
          files.push(full);
        }
      });
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
  return files;
}

async function convert() {
  let allFiles = [];
  for (const dir of DIRS) {
    console.log(`Scanning directory: ${dir}`);
    allFiles = allFiles.concat(getAllFiles(dir));
  }
  
  console.log(`Found ${allFiles.length} images to convert...`);
  
  for (const file of allFiles) {
    const ext = extname(file);
    const outPath = join(dirname(file), basename(file, ext) + '.webp');
    try {
      await sharp(file)
        .webp({ quality: 82 })
        .toFile(outPath);
      console.log(`Converted: ${file} -> ${outPath}`);
      converted++;
    } catch (err) {
      console.error(`Skipped ${file}: ${err.message}`);
      skipped++;
    }
  }
  
  console.log(`\nConversion finished.`);
  console.log(`Converted: ${converted} | Skipped: ${skipped}`);
}

convert();
