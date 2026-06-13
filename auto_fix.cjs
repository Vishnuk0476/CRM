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
      if(file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
let fixedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // 1. Remove console.log
  content = content.replace(/^[ \t]*console\.log\(.*?\);?[ \t]*\n/gm, '');
  
  // 2. Fix catch (err: any) -> catch (err: unknown)
  content = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)/g, 'catch ($1: unknown)');
  
  // 3. Replace generic (error: any) in params
  content = content.replace(/\((err|error|e|res|response|data|event)\s*:\s*any\)/gi, '($1: unknown)');

  // 4. Replace other obvious ': any' with ': unknown' where safe
  content = content.replace(/Array<any>/g, 'Array<unknown>');
  content = content.replace(/:\s*any\[\]/g, ': unknown[]');
  
  // 5. Try to handle try-catch errors globally
  content = content.replace(/catch\s*\(\s*err\s*\)/g, 'catch (err: unknown)');
  content = content.replace(/catch\s*\(\s*error\s*\)/g, 'catch (error: unknown)');

  if(content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
  }
});
console.log(`Fixed ${fixedCount} files`);
