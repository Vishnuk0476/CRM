const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

let modifiedFiles = 0;

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove console.log(...) but not console.error or console.warn
    content = content.replace(/^[ \t]*console\.log\([^;]+\);?[ \t]*$/gm, '// console.log removed by production cleanup');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`Scrubbed console.log from ${modifiedFiles} files.`);
