import { google } from '@ai-sdk/google';
import { embed as aiEmbed, embedMany as aiEmbedMany } from 'ai';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const EMBEDDING_DIMENSIONS = 768;

export type TaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const docModel = google.textEmbeddingModel(EMBEDDING_MODEL, {
	outputDimensionality: EMBEDDING_DIMENSIONS,
	taskType: 'RETRIEVAL_DOCUMENT',
});

const queryModel = google.textEmbeddingModel(EMBEDDING_MODEL, {
	outputDimensionality: EMBEDDING_DIMENSIONS,
	taskType: 'RETRIEVAL_QUERY',
});

const pickModel = (taskType: TaskType) =>
	taskType === 'RETRIEVAL_QUERY' ? queryModel : docModel;

export const embed = async (
	text: string,
	taskType: TaskType = 'RETRIEVAL_DOCUMENT'
): Promise<number[]> => {
	if (!text || !text.trim()) {
		throw new Error('Cannot embed empty text.');
	}
	const { embedding } = await aiEmbed({
		model: pickModel(taskType),
		value: text.replace(/\n/g, ' ').trim(),
	});
	return embedding;
};

export const embedMany = async (
	texts: string[],
	taskType: TaskType = 'RETRIEVAL_DOCUMENT'
): Promise<number[][]> => {
	if (!texts.length) return [];
	const { embeddings } = await aiEmbedMany({
		model: pickModel(taskType),
		values: texts.map((t) => t.replace(/\n/g, ' ').trim()),
	});
	return embeddings;
};
