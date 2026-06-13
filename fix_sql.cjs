const fs = require('fs');

let lines = fs.readFileSync('infinityfree_dump_fresh.sql', 'utf8').split('\n');
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

// Now fix the trailing commas for the lines right before the closing parenthesis of CREATE TABLE
for (let i = 0; i < newLines.length; i++) {
    // If the current line is the closing parenthesis of CREATE TABLE
    if (newLines[i].match(/^\)\s*ENGINE=/)) {
        // Find the previous non-empty line
        let prev = i - 1;
        while (prev >= 0 && newLines[prev].trim() === '') {
            prev--;
        }
        
        if (prev >= 0) {
            // Remove the trailing comma from the previous line
            newLines[prev] = newLines[prev].replace(/,\s*$/, '');
        }
    }
}

fs.writeFileSync('infinityfree_dump_perfect.sql', newLines.join('\n'));
console.log('SQL fixed successfully!');
