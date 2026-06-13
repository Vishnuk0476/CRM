const fs = require('fs');
let file = 'src/pages/Reviews.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace("onClick={() = loading=\"lazy\" decoding=\"async\" /> window.open(media.url, '_blank')} />", "onClick={() => window.open(media.url, '_blank')} loading=\"lazy\" decoding=\"async\" />");
fs.writeFileSync(file, content);
console.log('Fixed Reviews.tsx');
