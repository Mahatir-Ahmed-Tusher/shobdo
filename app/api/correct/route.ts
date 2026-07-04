import { NextResponse } from 'next/server';
import { checkRateLimit, getCache, setCache } from '../../../lib/cache/redis';
import { AI_PROMPT } from '../../../lib/ai/prompt';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';
import { Groq } from 'groq-sdk';
import crypto from 'crypto';

export const maxDuration = 60; // Max duration for Vercel Serverless

function hashContent(text: string, model: string): string {
  return crypto.createHash('sha256').update(`${text}_${model}_${AI_PROMPT}`).digest('hex');
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = await checkRateLimit(ip);
    
    if (!isAllowed) {
      return new NextResponse('Rate limit exceeded. Please wait a minute.', { status: 429 });
    }

    const { segments, provider, apiKey } = await req.json();

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return new NextResponse('Missing segments', { status: 400 });
    }
    
    if (!apiKey) {
      return new NextResponse('Missing API Key', { status: 400 });
    }

    // Format text with markers (1-based to match python script)
    const inputFormatted = segments.map((s: string, i: number) => `@@${i+1}@@${s}@@${i+1}@@`).join('\n');
    
    // Check cache
    const cacheKey = hashContent(inputFormatted, provider);
    const cachedResponse = await getCache(cacheKey);
    
    if (cachedResponse) {
      // Simulate stream for cached response
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(cachedResponse));
          controller.close();
        }
      });
      return new NextResponse(stream);
    }

    if (provider === 'groq') {
      const groq = new Groq({ apiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: AI_PROMPT },
          { role: 'user', content: inputFormatted }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.1,
        max_completion_tokens: 2048,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            controller.enqueue(new TextEncoder().encode(content));
          }
          controller.close();
          // Set cache in background
          setCache(cacheKey, fullResponse).catch(console.error);
        }
      });

      return new NextResponse(stream);
    } else {
      let aiModel;
      
      if (provider === 'gemini') {
        const google = createGoogleGenerativeAI({ apiKey });
        aiModel = google('gemini-2.5-flash');
      } else if (provider === 'mistral') {
        const mistral = createMistral({ apiKey });
        aiModel = mistral('mistral-small-latest');
      } else {
        return new NextResponse('Invalid provider', { status: 400 });
      }

      const result = await streamText({
        model: aiModel,
        system: AI_PROMPT,
        prompt: inputFormatted,
        temperature: 0.1,
        onFinish: async ({ text }) => {
          await setCache(cacheKey, text);
        }
      });

      return result.toTextStreamResponse();
    }
  } catch (error: any) {
    console.error('Correction API Error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
