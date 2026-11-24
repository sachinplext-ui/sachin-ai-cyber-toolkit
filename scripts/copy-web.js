import fs from 'node:fs';
import path from 'node:path';
const src = path.resolve('public');
const dest = path.resolve('www');
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Copied public/ to www/ for Android packaging.');
