export async function callAiCorrection(
  segments: string[],
  provider: string,
  apiKeys: Record<string, string>
): Promise<string> {
  const origin = self.location.origin;
  
  let activeProvider = provider;
  let activeKey = '';

  if (activeProvider === 'auto') {
    if (apiKeys.groq && apiKeys.groq.startsWith('gsk_')) {
      activeProvider = 'groq';
      activeKey = apiKeys.groq;
    } else if (apiKeys.gemini && apiKeys.gemini.startsWith('AIza')) {
      activeProvider = 'gemini';
      activeKey = apiKeys.gemini;
    } else if (apiKeys.mistral) {
      activeProvider = 'mistral';
      activeKey = apiKeys.mistral;
    } else {
      throw new Error('No valid API keys found for auto-detect.');
    }
  } else {
    activeKey = apiKeys[activeProvider as keyof typeof apiKeys] || '';
  }

  if (!activeKey) {
    throw new Error(`API Key for ${activeProvider} is missing.`);
  }

  const response = await fetch(`${origin}/api/correct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      segments,
      provider: activeProvider,
      apiKey: activeKey,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API Error: ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body from AI');
  }

  // Parse stream and concatenate result
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  return fullText;
}
