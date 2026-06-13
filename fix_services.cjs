const fs = require('fs');
let lines = fs.readFileSync('src/pages/Services.tsx', 'utf-8').split('\n');
lines.splice(328, 523 - 328 + 1);
fs.writeFileSync('src/pages/Services.tsx', lines.join('\n'));
console.log('Fixed Services.tsx');
