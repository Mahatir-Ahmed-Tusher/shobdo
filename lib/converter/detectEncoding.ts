import { isUnicode } from './bijoyUnicode';

export type EncodingGuess = 'bijoy' | 'unicode' | 'mixed';

export function detectEncoding(input: string): EncodingGuess {
  if (!input || input.trim() === '') return 'unicode'; // default safe

  // Check if it contains Unicode Bengali characters
  const hasUnicode = isUnicode(input);

  // Check if it contains typical Bijoy ASCII mapping characters
  // Common Bijoy characters: v, w, x, y, z, Z, _, `, ~, ˆ, †, ‡, ‰, Š, etc.
  const hasBijoy = /[A-Za-z|†|‡|¶|¡|¨|©|ª|«|¬|®|¯|°|±|²|³|´|µ|¸|¹|º|»|¼|½|¾|¿|À|Á|Â|Ã|Ä|Å|Æ|Ç|È|É|Ê|Ë|Ì|Í|Î|Ï|Ð|Ñ|Ò|Ó|Ô|Õ|Ö|×|Ø|Ù|Ú|Û|Ü|Ý|Þ|ß|à|á|â|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|õ|ö|÷|ø|ù|ú|û|ü|ý|þ|ÿ]/.test(input);

  if (hasUnicode && hasBijoy) {
    return 'mixed';
  } else if (hasBijoy) {
    return 'bijoy';
  } else {
    return 'unicode';
  }
}
