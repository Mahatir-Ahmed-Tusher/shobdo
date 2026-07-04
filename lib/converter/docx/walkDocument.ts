import { bijoyToUnicode, unicodeToBijoy, convertMixedToUnicode } from '../bijoyUnicode';
import { detectEncoding } from '../detectEncoding';
import JSZip from 'jszip';
import { parseXml, buildXml } from './zipIO';
import { callAiCorrection } from '../../ai/aiWorkerClient';

type Direction = 'bijoy-to-unicode' | 'unicode-to-bijoy' | 'auto';
type AiConfig = { useAi?: boolean; aiProvider?: string; apiKeys?: Record<string, string> };

export async function processDocx(zip: JSZip, direction: Direction, aiConfig?: AiConfig): Promise<void> {
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

    const pendingAiNodes: { node: any; text: string }[] = [];

    walkNodes(xmlObj, direction, pendingAiNodes);

    if (aiConfig?.useAi && pendingAiNodes.length > 0) {
      // Process in batches of 30 to avoid overwhelming the prompt size
      const BATCH_SIZE = 30;
      for (let i = 0; i < pendingAiNodes.length; i += BATCH_SIZE) {
        const batch = pendingAiNodes.slice(i, i + BATCH_SIZE);
        const segments = batch.map(b => b.text);
        try {
          const aiResponse = await callAiCorrection(segments, aiConfig.aiProvider!, aiConfig.apiKeys!);
          // aiResponse should contain @@0@@text@@0@@ @@1@@text@@1@@
          for (let j = 0; j < batch.length; j++) {
            const regex = new RegExp(`@@${j}@@([\\s\\S]*?)@@${j}@@`);
            const match = aiResponse.match(regex);
            if (match && match[1]) {
              batch[j].node['#text'] = match[1];
            }
          }
        } catch (error) {
          console.error("AI correction failed for batch", error);
          // Fallback to original locally converted text if AI fails
        }
      }
    }

    const updatedXmlString = buildXml(xmlObj);
    zip.file(filePath, updatedXmlString);
  }
}

function walkNodes(nodes: any[], direction: Direction, pendingAiNodes: { node: any; text: string }[]) {
  if (!Array.isArray(nodes)) return;

  for (const node of nodes) {
    if (node['w:r']) {
      processRun(node['w:r'], direction, pendingAiNodes);
    }
    
    const keys = Object.keys(node);
    for (const key of keys) {
      if (key !== ':@' && typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          walkNodes(node[key], direction, pendingAiNodes);
        } else if (Array.isArray(node[key][0])) {
           walkNodes(node[key], direction, pendingAiNodes);
        }
      }
    }
  }
}

function processRun(runNodes: any[], direction: Direction, pendingAiNodes: { node: any; text: string }[]) {
  let textContent = '';
  let textNodeRef: any = null;
  let rPrNodeRef: any = null;

  for (const child of runNodes) {
    if (child['w:t']) {
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
      if (convertedText.trim().length > 0) {
        pendingAiNodes.push({ node: textNodeRef, text: convertedText });
      }
    } else if (effectiveDirection === 'unicode-to-bijoy') {
      convertedText = unicodeToBijoy(textContent);
    }

    if (convertedText !== textContent) {
      textNodeRef['#text'] = convertedText;

      if (!rPrNodeRef) {
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
