import { embed } from './embeddings';
import { queryChunks } from './vectorstore';

const TOP_K = 5;
// Tuned for gemini-embedding-001 at 768d. Empirical — revisit with eval data.
const SCORE_THRESHOLD = 0.5;
const MAX_CONTEXT_CHARS = 3000;

export const retrieveContext = async (
	query: string,
	fileKey: string
): Promise<string> => {
	const queryEmbedding = await embed(query, 'RETRIEVAL_QUERY');
	const matches = await queryChunks(fileKey, queryEmbedding, TOP_K);

	const relevant = matches
		.filter((m) => m.score >= SCORE_THRESHOLD)
		.map((m) => m.text);

	if (!relevant.length) return 'No relevant context found for this query.';
	return relevant.join('\n').slice(0, MAX_CONTEXT_CHARS);
};

export const retrieveIntro = async (fileKey: string): Promise<string> => {
	const seed = await embed('summary of the document', 'RETRIEVAL_QUERY');
	const matches = await queryChunks(fileKey, seed, TOP_K);

	const ordered = matches
		.slice()
		.sort((a, b) => a.pageNumber - b.pageNumber)
		.map((m) => m.text);

	if (!ordered.length) return 'No introductory content found.';
	return ordered.join('\n\n').slice(0, MAX_CONTEXT_CHARS);
};
