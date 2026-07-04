import { bijoyToUnicode, unicodeToBijoy, convertMixedToUnicode } from '../bijoyUnicode';
import { detectEncoding } from '../detectEncoding';
import JSZip from 'jszip';
import { parseXml, buildXml } from './zipIO';
import { callAiCorrection, parseAiResponse } from '../../ai/aiWorkerClient';

type Direction = 'bijoy-to-unicode' | 'unicode-to-bijoy' | 'auto';
type AiConfig = { useAi?: boolean; aiProvider?: string; apiKeys?: Record<string, string> };

type AiNodeMeta = {
  textNodeRef: any;
  runNodes: any[];
  rPrNodeRef: any;
  text: string;
};

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

    const pendingAiNodes: AiNodeMeta[] = [];

    walkNodes(xmlObj, direction, pendingAiNodes);

    if (aiConfig?.useAi && pendingAiNodes.length > 0) {
      const BATCH_SIZE = 30;
      for (let i = 0; i < pendingAiNodes.length; i += BATCH_SIZE) {
        const batch = pendingAiNodes.slice(i, i + BATCH_SIZE);
        await correctBatch(batch, aiConfig);
      }
    }

    const updatedXmlString = buildXml(xmlObj);
    zip.file(filePath, updatedXmlString);
  }
}

async function correctBatch(batch: AiNodeMeta[], aiConfig: AiConfig): Promise<void> {
  if (batch.length === 0) return;
  
  const segments = batch.map(b => b.text);
  let corrected: string[] | null = null;
  
  try {
    const aiResponse = await callAiCorrection(segments, aiConfig.aiProvider!, aiConfig.apiKeys!);
    corrected = parseAiResponse(aiResponse, segments.length);
  } catch (error) {
    console.error("AI correction failed", error);
  }
  
  if (!corrected) {
    if (batch.length > 1) {
      const mid = Math.floor(batch.length / 2);
      await correctBatch(batch.slice(0, mid), aiConfig);
      await correctBatch(batch.slice(mid), aiConfig);
    }
    return;
  }
  
  for (let i = 0; i < batch.length; i++) {
    const fixed = corrected[i];
    const orig = batch[i].text;
    if (fixed && fixed !== orig) {
      const meta = batch[i];
      meta.textNodeRef['#text'] = fixed;
      
      // Inject highlight color
      if (!meta.rPrNodeRef) {
        const newRPr = { 'w:rPr': [], ':@': {} };
        meta.runNodes.unshift(newRPr);
        meta.rPrNodeRef = newRPr['w:rPr'];
      }
      
      // Check if w:highlight already exists
      let highlightNode = null;
      for (const prChild of meta.rPrNodeRef) {
        if (prChild['w:highlight']) {
          highlightNode = prChild;
          break;
        }
      }
      
      if (!highlightNode) {
        highlightNode = { 'w:highlight': [], ':@': { '@_w:val': 'yellow' } };
        meta.rPrNodeRef.push(highlightNode);
      } else {
        if (!highlightNode[':@']) highlightNode[':@'] = {};
        highlightNode[':@']['@_w:val'] = 'yellow';
      }
    }
  }
}

function walkNodes(nodes: any[], direction: Direction, pendingAiNodes: AiNodeMeta[]) {
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

function processRun(runNodes: any[], direction: Direction, pendingAiNodes: AiNodeMeta[]) {
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
      
      if (effectiveDirection === 'bijoy-to-unicode' && convertedText.trim().length > 0) {
        pendingAiNodes.push({
          textNodeRef,
          runNodes,
          rPrNodeRef,
          text: convertedText
        });
      }
    }
  }
}
