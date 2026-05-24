import { chunkPdf } from './chunking';
import { embedMany } from './embeddings';
import { upsertChunks, type ChunkVector } from './vectorstore';
import { downloadPdf } from '@/lib/storage/blob';

export const ingestPdf = async (fileKey: string, url: string): Promise<number> => {
	const blob = await downloadPdf(url);
	const chunks = await chunkPdf(blob);
	if (!chunks.length) {
		throw new Error(`No extractable text found in PDF: ${fileKey}`);
	}

	const embeddings = await embedMany(chunks.map((c) => c.text));
	const vectors: ChunkVector[] = chunks.map((chunk, i) => ({
		...chunk,
		embedding: embeddings[i],
	}));

	await upsertChunks(fileKey, vectors);
	return vectors.length;
};
