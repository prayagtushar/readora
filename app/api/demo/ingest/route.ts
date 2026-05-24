import { NextResponse } from 'next/server';
import { ingestPdf } from '@/lib/rag/ingest';

export const maxDuration = 60;

export async function POST(req: Request) {
	const { file_key, url } = await req.json();
	if (!file_key || !url) {
		return NextResponse.json(
			{ error: 'Missing file_key or url' },
			{ status: 400 }
		);
	}

	try {
		const chunks = await ingestPdf(file_key, url);
		return NextResponse.json({ ok: true, chunks });
	} catch (error) {
		console.error('Demo ingest error:', error);
		return NextResponse.json(
			{
				error: 'Ingestion failed',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
