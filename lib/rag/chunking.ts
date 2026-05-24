import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import {
	Document,
	RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter';

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

export type PdfPage = {
	pageContent: string;
	metadata: { loc: { pageNumber: number } };
};

export type Chunk = {
	text: string;
	pageNumber: number;
};

const truncateBytes = (str: string, bytes: number): string => {
	const enc = new TextEncoder();
	return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));
};

export const parsePdf = async (blob: Blob): Promise<PdfPage[]> => {
	const loader = new PDFLoader(blob);
	return (await loader.load()) as PdfPage[];
};

export const chunkPage = async (page: PdfPage): Promise<Chunk[]> => {
	const cleaned = page.pageContent.replace(/\n/g, '').trim();
	if (!cleaned) return [];

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: CHUNK_SIZE,
		chunkOverlap: CHUNK_OVERLAP,
	});

	const docs = await splitter.splitDocuments([
		new Document({
			pageContent: cleaned,
			metadata: {
				pageNumber: page.metadata.loc.pageNumber,
				text: truncateBytes(cleaned, 36000),
			},
		}),
	]);

	return docs.map((doc) => ({
		text: doc.pageContent,
		pageNumber: page.metadata.loc.pageNumber,
	}));
};

export const chunkPdf = async (blob: Blob): Promise<Chunk[]> => {
	const pages = await parsePdf(blob);
	const perPage = await Promise.all(pages.map(chunkPage));
	return perPage.flat();
};
