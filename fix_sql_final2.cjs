const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running mysqldump...');
const sqlBuffer = execSync('C:\\xampp\\mysql\\bin\\mysqldump.exe -u root panyaglobal_db', { maxBuffer: 10 * 1024 * 1024 });
let sql = sqlBuffer.toString('utf8');

let lines = sql.split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    line = line.replace(/CHECK\s*\(\s*json_valid\([^)]+\)\s*\)/ig, '');

    if (line.match(/^\s*CONSTRAINT `[^`]+` FOREIGN KEY/i)) {
        continue;
    }

    newLines.push(line);
}

for (let i = 0; i < newLines.length; i++) {
    if (newLines[i].match(/^\)\s*ENGINE=/)) {
        let prev = i - 1;
        while (prev >= 0 && newLines[prev].trim() === '') {
            prev--;
        }
        
        if (prev >= 0) {
            newLines[prev] = newLines[prev].replace(/,\s*$/, '');
        }
    }
}

fs.writeFileSync('infinityfree_dump_final.sql', newLines.join('\n'), 'utf8');
console.log('SQL fixed successfully and saved as infinityfree_dump_final.sql');
