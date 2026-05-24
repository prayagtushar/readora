import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { retrieveContext, retrieveIntro } from '@/lib/rag/retrieval';

const gemini = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = 'gemini-2.5-flash';
const SUMMARY_PATTERN = /summary|summarize|overview|what is.*(pdf|document)/i;

const buildSystemPrompt = (context: string) => `
You are Readora, an AI assistant that answers questions strictly from the user's PDF.

Rules:
- Use ONLY the content in CONTEXT below.
- If the answer is not in the context, reply: "I'm sorry, but I couldn't find the answer to that question based on the provided information."
- Do not mention the context block itself.
- Never invent facts.

Output style:
- Short paragraphs (2–4 sentences) or bullet points when listing.
- Clear, professional, friendly tone.

CONTEXT:
-------------------------
${context}
-------------------------
`.trim();

export async function POST(req: Request) {
	const { messages, fileKey } = await req.json();
	if (!Array.isArray(messages) || typeof fileKey !== 'string' || !fileKey) {
		return NextResponse.json(
			{ error: 'messages must be an array and fileKey must be a non-empty string' },
			{ status: 400 }
		);
	}

	const lastMessage = messages[messages.length - 1];
	if (
		!lastMessage ||
		typeof lastMessage.content !== 'string' ||
		!lastMessage.content.trim()
	) {
		return NextResponse.json(
			{ error: 'Last message content must be a non-empty string' },
			{ status: 400 }
		);
	}

	const context = SUMMARY_PATTERN.test(lastMessage.content)
		? await retrieveIntro(fileKey)
		: await retrieveContext(lastMessage.content, fileKey);

	try {
		const result = streamText({
			model: gemini(MODEL),
			system: buildSystemPrompt(context),
			messages: messages.map((m: { role: string; content: string }) => ({
				role: m.role as 'user' | 'assistant',
				content: m.content,
			})),
		});
		return result.toDataStreamResponse();
	} catch (error) {
		console.error('Demo chat error:', error);
		const msg = error instanceof Error ? error.message : 'Server error';
		const status = msg.toLowerCase().includes('rate limit') ? 429 : 500;
		return NextResponse.json({ error: msg }, { status });
	}
}
