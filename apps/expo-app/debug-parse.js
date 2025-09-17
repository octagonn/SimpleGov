const fs = require('fs');
const path = require('path');
const files = [
  path.resolve('package.json'),
  path.resolve('..\\..\\package.json'),
  path.resolve('..\\..\\apps\\expo-app\\package.json'),
  path.resolve('..\\..\\packages\\ui\\package.json'),
  path.resolve('..\\..\\packages\\lib\\package.json'),
  path.resolve('..\\..\\tsconfig.base.json'),
  path.resolve('..\\..\\app.json')
];
for (const file of files) {
  try {
    const buf = fs.readFileSync(file);
    const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
    const str = buf.toString('utf8');
    JSON.parse(str);
    console.log('OK', file, hasBom ? '(BOM)' : '');
  } catch (e) {
    console.error('BAD', file, e.message);
  }
}
