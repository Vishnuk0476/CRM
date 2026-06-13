const fs = require('fs');
let content = fs.readFileSync('src/components/FloatingChatWidget.tsx', 'utf-8');
const parts = content.split('import { useState, useEffect } from "react";');
if (parts.length > 2) {
  content = 'import { useState, useEffect } from "react";' + parts[2];
} else if (parts.length === 2) {
  content = 'import { useState, useEffect } from "react";' + parts[1];
}
// Fix the img tag syntax error
content = content.replace(/\/\s*decoding="async">/g, 'decoding="async" />');
// Fix missing src
content = content.replace(/<img\s+alt=\{agentName\}/g, '<img src={agentAvatar} alt={agentName}');
fs.writeFileSync('src/components/FloatingChatWidget.tsx', content);
console.log('Fixed file.');
