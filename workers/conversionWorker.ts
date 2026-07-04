import { processDocx } from '../lib/converter/docx/walkDocument';
import { unzipDocx, zipDocx } from '../lib/converter/docx/zipIO';
import { bijoyToUnicode, unicodeToBijoy, convertMixedToUnicode } from '../lib/converter/bijoyUnicode';
import { detectEncoding } from '../lib/converter/detectEncoding';
import { callAiCorrection } from '../lib/ai/aiWorkerClient';

// Listen for messages from the main thread
self.addEventListener('message', async (e) => {
  const { type, payload, id } = e.data;

  try {
    if (type === 'CONVERT_TEXT') {
      const { text, direction, useAi, aiProvider, apiKeys } = payload;
      let result = text;
      
      let effectiveDirection = direction;
      if (direction === 'auto') {
        const guessed = detectEncoding(text);
        effectiveDirection = guessed === 'bijoy' || guessed === 'mixed' ? 'bijoy-to-unicode' : 'unicode-to-bijoy';
      }

      if (effectiveDirection === 'bijoy-to-unicode') {
        result = convertMixedToUnicode(text);
        
        if (useAi && result.trim()) {
          const aiResponse = await callAiCorrection([result], aiProvider, apiKeys);
          // AI returns @@0@@...@@0@@
          const match = aiResponse.match(/@@0@@([\s\S]*?)@@0@@/);
          if (match && match[1]) {
            result = match[1];
          }
        }
      } else if (effectiveDirection === 'unicode-to-bijoy') {
        result = unicodeToBijoy(text);
      }

      self.postMessage({ type: 'CONVERT_TEXT_SUCCESS', payload: result, id });
    } 
    else if (type === 'CONVERT_DOCX') {
      const { fileData, direction, useAi, aiProvider, apiKeys } = payload;
      
      // 1. Unzip
      const zip = await unzipDocx(fileData);
      
      // 2. Process
      await processDocx(zip, direction, { useAi, aiProvider, apiKeys });
      
      // 3. Zip back
      const blob = await zipDocx(zip);
      
      self.postMessage({ type: 'CONVERT_DOCX_SUCCESS', payload: blob, id });
    }
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', payload: error.message, id });
  }
});
