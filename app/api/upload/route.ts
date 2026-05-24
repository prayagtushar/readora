import { auth } from '@clerk/nextjs/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<NextResponse> {
	const url = new URL(req.url);
	const isDemo = url.searchParams.get('mode') === 'demo';
	const body = (await req.json()) as HandleUploadBody;

	try {
		const json = await handleUpload({
			body,
			request: req,
			onBeforeGenerateToken: async () => {
				if (!isDemo) {
					const { userId } = await auth();
					if (!userId) throw new Error('Unauthorized');
				}
				return {
					allowedContentTypes: ['application/pdf'],
					maximumSizeInBytes: 10 * 1024 * 1024,
					tokenPayload: JSON.stringify({ demo: isDemo }),
				};
			},
			onUploadCompleted: async () => {},
		});

		return NextResponse.json(json);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Upload failed' },
			{ status: 400 }
		);
	}
}
