import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export async function unzipDocx(file: ArrayBuffer | Blob): Promise<JSZip> {
  const zip = new JSZip();
  return await zip.loadAsync(file);
}

export async function zipDocx(zip: JSZip): Promise<Blob> {
  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function parseXml(xmlString: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: false,
  });
  return parser.parse(xmlString);
}

export function buildXml(xmlObj: any): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    preserveOrder: true,
    suppressEmptyNode: true,
  });
  return builder.build(xmlObj);
}
