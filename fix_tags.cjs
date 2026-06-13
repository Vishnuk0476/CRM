const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  
  if (content.match(/\/\s*loading="lazy"\s+decoding="async">/g)) {
    content = content.replace(/\/\s*loading="lazy"\s+decoding="async">/g, 'loading="lazy" decoding="async" />');
    changed = true;
  }
  
  if (content.match(/\/\s*decoding="async">/g)) {
    content = content.replace(/\/\s*decoding="async">/g, 'decoding="async" />');
    changed = true;
  }

  if (content.match(/loading="lazy"\s+decoding="async">/g)) {
    // Check if it's an img tag that was just missing a slash
    // Just blindly fix decoding="async"> to decoding="async" />. React requires self-closing.
    content = content.replace(/loading="lazy"\s+decoding="async">/g, 'loading="lazy" decoding="async" />');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
