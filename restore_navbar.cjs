const fs = require('fs');
const readline = require('readline');
const fileStream = fs.createReadStream('C:\\\\Users\\\\Vishnu Nishad\\\\.gemini\\\\antigravity\\\\brain\\\\490bf7af-cc35-49a6-90e1-d8e8c748ee83\\\\.system_generated\\\\logs\\\\transcript.jsonl');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let foundContent = null;
let linesArr = [];

rl.on('line', (line) => {
  linesArr.push(line);
});

rl.on('close', () => {
    for (let i = linesArr.length - 1; i >= 0; i--) {
        const line = linesArr[i];
        if (line.includes('export default Navbar;') && line.includes('import { useState, useEffect }')) {
             try {
                 const data = JSON.parse(line);
                 const text = data.output || data.content;
                 if (text) {
                     const match = text.match(/1: import \\{ useState, useEffect \\} from "react";[\\s\\S]*?export default Navbar;/);
                     if (match) {
                         foundContent = match[0];
                         break;
                     }
                 }
             } catch(e) {}
        }
    }
    
    if (foundContent) {
        foundContent = foundContent.replace(/^\\d+: /gm, '');
        fs.writeFileSync('src/components/layout/Navbar.tsx', foundContent);
        console.log('Restored Navbar.tsx from logs');
    } else {
        console.log('Could not find Navbar.tsx in logs');
    }
});
