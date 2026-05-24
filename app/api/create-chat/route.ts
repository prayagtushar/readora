import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Chat } from '@/lib/db/schema';
import { ingestPdf } from '@/lib/rag/ingest';

export async function POST(req: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { file_key, fileName, url } = await req.json();
	if (!file_key || !fileName || !url) {
		return NextResponse.json(
			{ error: 'Missing file_key, fileName, or url' },
			{ status: 400 }
		);
	}

	try {
		const chunkCount = await ingestPdf(file_key, url);
		console.log(`✅ Ingested ${chunkCount} chunks for ${file_key}`);

		const [chat] = await db
			.insert(Chat)
			.values({ fileKey: file_key, pdfName: fileName, pdfUrl: url, userId })
			.returning({ insertedId: Chat.id });

		return NextResponse.json({ id: chat.insertedId }, { status: 201 });
	} catch (error) {
		console.error('Create chat error:', error);
		return NextResponse.json(
			{
				error: 'Failed to create chat',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
