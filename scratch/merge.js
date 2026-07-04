const fs = require('fs');
const data = fs.readFileSync('scratch/package/dist/data.js', 'utf8');
const core = fs.readFileSync('scratch/package/dist/core.js', 'utf8');

let ts = data
  .replace(/exports\./g, 'export const ')
  .replace(/"use strict";/g, '')
  .replace(/Object\.defineProperty.*/g, '');
  
ts += '\n' + core
  .replace(/const data_1 = require\("\.\/data"\);/g, '')
  .replace(/data_1\./g, '')
  .replace(/exports\./g, 'export ')
  .replace(/export function/g, 'export function')
  .replace(/"use strict";/g, '')
  .replace(/Object\.defineProperty.*/g, '')
  .replace(/export const bijoyToUnicode = bijoyToUnicode;/g, '')
  .replace(/export const unicodeToBijoy = unicodeToBijoy;/g, '')
  .replace(/export const isUnicode = isUnicode;/g, '')
  .replace(/export const convertMixedToUnicode = convertMixedToUnicode;/g, '');

fs.writeFileSync('lib/converter/bijoyUnicode.ts', ts);
