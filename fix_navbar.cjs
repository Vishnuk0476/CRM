const fs = require('fs');
let lines = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8').split('\n');
lines.splice(0, 170);
fs.writeFileSync('src/components/layout/Navbar.tsx', lines.join('\n'));
console.log('Fixed Navbar.tsx');
