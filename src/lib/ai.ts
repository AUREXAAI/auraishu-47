import Groq from 'groq-sdk';

export type Tool = 'chat' | 'solve' | 'coding';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const creatorInstructions =
  ' CREATOR IDENTITY: You are AUREXA AI, created and developed by Ishant V Naik. ' +
  'When someone asks who created you, who made you, who built you, or who developed you, answer in the user’s language. ' +

  'ENGLISH: "I was created and developed by Ishant V Naik, a young developer from Karnataka, India. He was born on 10 January 2009 and is interested in artificial intelligence, software development, and technology innovation." ' +

  'KANNADA: "ನನ್ನನ್ನು Ishant V Naik ಅವರು ರಚಿಸಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ. ಅವರು ಕರ್ನಾಟಕದ ಯುವ ಡೆವಲಪರ್. ಅವರು 10 ಜನವರಿ 2009 ರಂದು ಜನಿಸಿದ್ದು, ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ, ಸಾಫ್ಟ್‌ವೇರ್ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಹೊಸ ತಂತ್ರಜ್ಞಾನಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಹೊಂದಿದ್ದಾರೆ." ' +

  'HINDI: "मुझे Ishant V Naik ने बनाया और विकसित किया है। वह कर्नाटक, भारत के एक युवा डेवलपर हैं। उनका जन्म 10 जनवरी 2009 को हुआ था और उन्हें आर्टिफिशियल इंटेलिजेंस, सॉफ्टवेयर डेवलपमेंट और नई तकनीकों में रुचि है।" ' +

  'If asked for more information about Ishant V Naik, explain that he is a young developer from Karnataka, India, born on 10 January 2009, and interested in AI and software development. ' +

  'Do not invent additional personal details, achievements, qualifications, or biographical information.';

const systemPrompts: Record<Tool, string> = {
  chat:
    "You are AUREXA AI. Reply in the user's language (Kannada, Hindi, or English). Be helpful, clear, natural, and concise. " +
    creatorInstructions,

  solve:
    "You are AUREXA AI. Reply in the user's language (Kannada, Hindi, or English). Explain solutions in numbered steps and clearly highlight the final answer. " +
    creatorInstructions,

  coding:
    "You are AUREXA AI. Reply in the user's language (Kannada, Hindi, or English). Provide code in Markdown code blocks with appropriate language tags. Explain important implementation details. " +
    creatorInstructions,
};

export function getSystemPrompt(tool: Tool): string {
  return systemPrompts[tool] || systemPrompts.chat;
}

/**
 * Providers are attempted in this order:
 * 1. Groq model 1
 * 2. Groq model 2
 * 3. OpenAI
 *
 * Verify model availability in your provider account.
 */
export const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

export const GROQ_TEMPERATURE = 0.6;
export const GROQ_MAX_TOKENS = 1024;

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

/**
 * Collect a complete response before sending it to the UI.
 * This prevents partial output from a failed model being mixed
 * with the next model's response.
 */
async function generateGroqResponse(
  model: string,
  messages: Message[],
): Promise<string> {
  const client = getGroqClient();

  if (!client) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const stream = await client.chat.completions.create({
    model,
    temperature: GROQ_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    stream: true,
    messages,
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;

    if (typeof token === 'string') {
      fullResponse += token;
    }
  }

  if (!fullResponse.trim()) {
    throw new Error(`Model "${model}" returned an empty response`);
  }

  return fullResponse;
}

export async function streamGroq(
  messages: Message[],
  onToken: (token: string) => void,
): Promise<string> {
  const client = getGroqClient();

  if (!client) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  let lastError: unknown = null;

  for (const model of GROQ_MODELS) {
    try {
      console.info(`Trying Groq model: ${model}`);

      const response = await generateGroqResponse(model, messages);

      // Send the response only after the model finishes successfully.
      const chunkSize = 32;

      for (let i = 0; i < response.length; i += chunkSize) {
        onToken(response.slice(i, i + chunkSize));
      }

      console.info(`Groq model succeeded: ${model}`);

      return response;
    } catch (error) {
      lastError = error;

      const message =
        error instanceof Error ? error.message : String(error);

      console.warn(`Groq model "${model}" failed: ${message}`);
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : 'All configured Groq models failed';

  throw new Error(`All Groq models failed: ${message}`);
}

/**
 * Final provider fallback.
 * Requires OPENAI_API_KEY in the server environment.
 */
export async function streamOpenAI(
  messages: Message[],
  onToken: (token: string) => void,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: GROQ_TEMPERATURE,
        max_tokens: GROQ_MAX_TOKENS,
        stream: true,
        messages,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');

    throw new Error(
      `OpenAI request failed (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  if (!response.body) {
    throw new Error('OpenAI returned an empty response stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed.startsWith('data:')) {
          continue;
        }

        const data = trimmed.slice(5).trim();

        if (!data || data === '[DONE]') {
          continue;
        }

        let parsed: any;

        try {
          parsed = JSON.parse(data);
        } catch {
          // Ignore malformed server-sent event chunks.
          continue;
        }

        if (parsed.error) {
          throw new Error(
            parsed.error.message || 'OpenAI streaming error',
          );
        }

        const token = parsed.choices?.[0]?.delta?.content;

        if (typeof token === 'string' && token.length > 0) {
          fullResponse += token;
          onToken(token);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!fullResponse.trim()) {
    throw new Error('OpenAI returned an empty response');
  }

  return fullResponse;
}

/**
 * Main AI entry point.
 * Tries Groq first, then OpenAI if Groq fails.
 */
export async function streamAI(
  messages: Message[],
  onToken: (token: string) => void,
): Promise<string> {
  let groqError = 'GROQ_API_KEY is not configured';

  if (process.env.GROQ_API_KEY) {
    try {
      return await streamGroq(messages, onToken);
    } catch (error) {
      groqError =
        error instanceof Error ? error.message : String(error);

      console.warn(`Groq fallback exhausted: ${groqError}`);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      console.info('Trying OpenAI fallback');

      return await streamOpenAI(messages, onToken);
    } catch (error) {
      const openaiError =
        error instanceof Error ? error.message : String(error);

      console.error(`OpenAI fallback failed: ${openaiError}`);

      throw new Error(
        `AI providers failed. Groq: ${groqError}. OpenAI: ${openaiError}`,
      );
    }
  }

  throw new Error(
    `No AI provider could generate a response. Groq: ${groqError}. Configure OPENAI_API_KEY for the final fallback.`,
  );
    }
