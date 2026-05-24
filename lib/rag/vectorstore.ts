import { Pinecone, type PineconeRecord, type Index } from '@pinecone-database/pinecone';
import md5 from 'md5';
import type { Chunk } from './chunking';

let _index: Index | null = null;
const getIndex = (): Index => {
	if (_index) return _index;
	const apiKey = process.env.PINECONE_API_KEY;
	const indexName = process.env.PINECONE_INDEX_NAME;
	if (!apiKey) throw new Error('PINECONE_API_KEY is not set.');
	if (!indexName) throw new Error('PINECONE_INDEX_NAME is not set.');
	_index = new Pinecone({ apiKey }).index(indexName);
	return _index;
};

const toNamespace = (fileKey: string) => fileKey.replace(/[^\x00-\x7F]+/g, '');

export type ChunkVector = Chunk & { embedding: number[] };

export type Match = {
	score: number;
	text: string;
	pageNumber: number;
};

export const upsertChunks = async (
	fileKey: string,
	vectors: ChunkVector[]
): Promise<void> => {
	const namespace = getIndex().namespace(toNamespace(fileKey));
	const records: PineconeRecord[] = vectors.map((v) => ({
		id: md5(JSON.stringify(v.embedding)),
		values: v.embedding,
		metadata: { text: v.text, pageNumber: v.pageNumber },
	}));
	await namespace.upsert(records);
};

export const queryChunks = async (
	fileKey: string,
	embedding: number[],
	topK: number
): Promise<Match[]> => {
	const namespace = getIndex().namespace(toNamespace(fileKey));
	const result = await namespace.query({
		topK,
		vector: embedding,
		includeMetadata: true,
	});

	return (result.matches ?? []).map((m) => ({
		score: m.score ?? 0,
		text: (m.metadata as { text?: string } | undefined)?.text ?? '',
		pageNumber:
			Number((m.metadata as { pageNumber?: number } | undefined)?.pageNumber) ||
			0,
	}));
};
