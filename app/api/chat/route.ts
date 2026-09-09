import { NextRequest } from 'next/server';
import { streamAI, getSystemPrompt, type Tool } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIMITS: Record<string, number> = {
  free: 27,
  basic: 800,
  all: Infinity,
};

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = process.env.GROQ_API_KEY;
  console.log('GROQ_API_KEY exists:', !!apiKey);

  if (!apiKey) {
    return Response.json({ error: 'API key missing from environment' }, { status: 500, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tool, message, history } = body as {
      idToken?: string;
      tool?: Tool;
      chatId?: string;
      message?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message || !tool) {
      return Response.json({ error: 'Missing message or tool' }, { status: 400, headers: corsHeaders });
    }

    // Usage tracking is best-effort — if Firestore or firebase-admin is not
    // configured, we skip it entirely so chat still works.
    let usageTracking: { increment: () => Promise<void> } | null = null;
    try {
      const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const adminAuthMod = await import('firebase-admin/auth');
      const getAdminAuth = adminAuthMod.getAuth;

      let uid = 'anonymous';
      const adminApp = getApps().length > 0
        ? getApps()[0]
        : (() => {
            const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (serviceKey) {
              try {
                return initializeApp({ credential: cert(JSON.parse(serviceKey)) });
              } catch {
                console.warn('[chat] Firebase Admin init failed');
                return null;
              }
            }
            console.warn('[chat] Firebase Admin not configured');
            return null;
          })();

      const idToken = body.idToken;
      if (adminApp && idToken) {
        try {
          const decoded = await getAdminAuth(adminApp).verifyIdToken(idToken);
          uid = decoded.uid;
        } catch {
          console.warn('[chat] Token verification failed, proceeding as anonymous');
        }
      }

      const db = getFirestore();
      const usageRef = doc(db, 'usage', uid);
      const usageDoc = await getDoc(usageRef);
      const usageData = usageDoc.exists() ? usageDoc.data() : {};

      let plan = 'free';
      if (usageData.plan) plan = usageData.plan;

      const dateKey = getDateKey();
      const monthKey = getMonthKey();

      let dailyCount = 0;
      let monthlyCount = 0;

      if (usageData.dateKey === dateKey) {
        dailyCount = usageData.dailyCount || 0;
      }
      if (usageData.monthKey === monthKey) {
        monthlyCount = usageData.monthlyCount || 0;
      }

      const limit = LIMITS[plan] ?? LIMITS.free;
      if (dailyCount >= limit) {
        return Response.json({ error: 'LIMIT_REACHED' }, { status: 429, headers: corsHeaders });
      }

      usageTracking = {
        increment: async () => {
          try {
            await setDoc(usageRef, {
              dateKey,
              monthKey,
              dailyCount: dailyCount + 1,
              monthlyCount: monthlyCount + 1,
              plan,
              lastUsed: serverTimestamp(),
            }, { merge: true });
          } catch {
            // best-effort
          }
        },
      };
    } catch (err) {
      console.warn('[chat] Usage tracking unavailable, skipping:', err instanceof Error ? err.message : 'unknown');
    }

    // Build messages
    const systemPrompt = getSystemPrompt(tool);
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (history && Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        messages.push({ role: h.role, content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendToken = (token: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        };

        try {
          await streamAI(messages, sendToken);
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'AI service unavailable';
          console.error('[chat] Stream error:', msg);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        } finally {
          if (usageTracking) {
            await usageTracking.increment();
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[chat] Route error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
