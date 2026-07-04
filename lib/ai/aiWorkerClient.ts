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

export function parseAiResponse(text: string, numSegments: number): string[] | null {
  if (!text) return null;
  // Remove markdown code blocks if the AI includes them
  const cleanText = text.replace(/^```[a-z]*\n|```$/gm, '').trim();
  
  const parsed = new Map<number, string>();
  // Match @@N@@...@@N@@ or just @@N@@... until the next marker or end of string
  // Matches the notebook: MARKER_RE = re.compile(r'@@(\d+)@@(.*?)(?=@@\d+@@|\Z)', re.DOTALL)
  const markerRegex = /@@(\d+)@@([\s\S]*?)(?=@@\d+@@|$)/g;
  
  let match;
  while ((match = markerRegex.exec(cleanText)) !== null) {
    const id = parseInt(match[1], 10);
    let content = match[2];
    
    // Sometimes the AI might append the closing @@N@@, let's strip it if it's there
    const closingTag = `@@${id}@@`;
    if (content.endsWith(closingTag)) {
      content = content.slice(0, -closingTag.length);
    }
    
    parsed.set(id, content.trim());
  }

  // Verify we got everything
  for (let i = 1; i <= numSegments; i++) {
    if (!parsed.has(i)) {
      return null;
    }
  }

  const results: string[] = [];
  for (let i = 1; i <= numSegments; i++) {
    results.push(parsed.get(i)!);
  }
  return results;
}
