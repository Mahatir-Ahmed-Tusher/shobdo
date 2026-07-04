import { bijoyToUnicode, unicodeToBijoy, convertMixedToUnicode } from '../bijoyUnicode';
import { detectEncoding } from '../detectEncoding';
import JSZip from 'jszip';
import { parseXml, buildXml } from './zipIO';

type Direction = 'bijoy-to-unicode' | 'unicode-to-bijoy' | 'auto';

export async function processDocx(zip: JSZip, direction: Direction): Promise<void> {
  // Find all document parts that might contain text
  // document.xml, header*.xml, footer*.xml, footnotes.xml, endnotes.xml
  const targetFiles: string[] = [];
  zip.folder('word')?.forEach((relativePath, file) => {
    if (
      relativePath === 'document.xml' ||
      relativePath.startsWith('header') ||
      relativePath.startsWith('footer') ||
      relativePath === 'footnotes.xml' ||
      relativePath === 'endnotes.xml'
    ) {
      if (relativePath.endsWith('.xml')) {
        targetFiles.push(`word/${relativePath}`);
      }
    }
  });

  for (const filePath of targetFiles) {
    const file = zip.file(filePath);
    if (!file) continue;

    const xmlString = await file.async('string');
    const xmlObj = parseXml(xmlString);

    walkNodes(xmlObj, direction);

    const updatedXmlString = buildXml(xmlObj);
    zip.file(filePath, updatedXmlString);
  }
}

function walkNodes(nodes: any[], direction: Direction) {
  if (!Array.isArray(nodes)) return;

  for (const node of nodes) {
    // If it's a run node <w:r>
    if (node['w:r']) {
      processRun(node['w:r'], direction);
    }
    
    // Recurse into children
    const keys = Object.keys(node);
    for (const key of keys) {
      if (key !== ':@' && typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          walkNodes(node[key], direction);
        } else if (Array.isArray(node[key][0])) {
           walkNodes(node[key], direction);
        }
      }
    }
  }
}

function processRun(runNodes: any[], direction: Direction) {
  // fast-xml-parser with preserveOrder: true represents children as an array of objects
  // Each object has a single key (the tag name) and its children/value
  
  let textContent = '';
  let textNodeRef: any = null;
  let rPrNodeRef: any = null;

  for (const child of runNodes) {
    if (child['w:t']) {
      // Find the text value
      const tChildren = child['w:t'];
      if (Array.isArray(tChildren)) {
        for (const tChild of tChildren) {
          if (tChild['#text']) {
            textContent = tChild['#text'];
            textNodeRef = tChild;
          }
        }
      }
    }
    if (child['w:rPr']) {
      rPrNodeRef = child['w:rPr'];
    }
  }

  if (textContent && textNodeRef) {
    let convertedText = textContent;
    let effectiveDirection = direction;
    
    if (direction === 'auto') {
      const guessed = detectEncoding(textContent);
      if (guessed === 'bijoy' || guessed === 'mixed') {
        effectiveDirection = 'bijoy-to-unicode';
      } else {
        effectiveDirection = 'unicode-to-bijoy';
      }
    }

    if (effectiveDirection === 'bijoy-to-unicode') {
      convertedText = convertMixedToUnicode(textContent);
      // We could use bijoyToUnicode directly if we're sure it's all bijoy,
      // but convertMixedToUnicode is safer for mixed English/Bengali lines.
    } else if (effectiveDirection === 'unicode-to-bijoy') {
      convertedText = unicodeToBijoy(textContent);
    }

    if (convertedText !== textContent) {
      // Update text
      textNodeRef['#text'] = convertedText;

      // Update fonts
      if (!rPrNodeRef) {
        // If there is no run properties node, we should ideally inject one,
        // but for simplicity we can just let Word use the default style font.
        // Or inject it: runNodes.unshift({ 'w:rPr': [ ... ] })
        const newRPr = { 'w:rPr': [], ':@': {} };
        runNodes.unshift(newRPr);
        rPrNodeRef = newRPr['w:rPr'];
      }
      
      let rFontsNodeRef = null;
      for (const prChild of rPrNodeRef) {
        if (prChild['w:rFonts']) {
          rFontsNodeRef = prChild;
          break;
        }
      }
      
      if (!rFontsNodeRef) {
        rFontsNodeRef = { 'w:rFonts': [], ':@': {} };
        rPrNodeRef.push(rFontsNodeRef);
      }

      const fontName = effectiveDirection === 'bijoy-to-unicode' ? 'Kalpurush' : 'SutonnyMJ';
      
      if (!rFontsNodeRef[':@']) rFontsNodeRef[':@'] = {};
      
      rFontsNodeRef[':@']['@_w:ascii'] = fontName;
      rFontsNodeRef[':@']['@_w:hAnsi'] = fontName;
      rFontsNodeRef[':@']['@_w:cs'] = fontName;
      rFontsNodeRef[':@']['@_w:eastAsia'] = fontName;
    }
  }
}
