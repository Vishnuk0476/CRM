const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running mysqldump...');
// Run mysqldump and capture stdout directly (this avoids PowerShell encoding issues)
const sqlBuffer = execSync('C:\\xampp\\mysql\\bin\\mysqldump.exe -u root panyaglobal_db');
let sql = sqlBuffer.toString('utf8');

let lines = sql.split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Remove CHECK constraints, e.g. CHECK (json_valid(`details`))
    line = line.replace(/CHECK\s*\(\s*json_valid\([^)]+\)\s*\)/ig, '');

    // If line has CONSTRAINT ... FOREIGN KEY, skip it entirely
    if (line.match(/^\s*CONSTRAINT `[^`]+` FOREIGN KEY/i)) {
        continue;
    }

    newLines.push(line);
}

// Fix trailing commas for the lines right before the closing parenthesis of CREATE TABLE
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

// Write the perfectly formatted UTF-8 SQL file
fs.writeFileSync('infinityfree_dump_final.sql', newLines.join('\n'), 'utf8');
console.log('SQL fixed successfully and saved as infinityfree_dump_final.sql');
