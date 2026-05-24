export const downloadPdf = async (url: string): Promise<Blob> => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to download PDF (${res.status}): ${res.statusText}`);
	}
	return res.blob();
};

export const fileKeyFor = (fileName: string): string => {
	const safe = fileName.replace(/\s+/g, '-').toLowerCase();
	return `uploads/${Date.now()}-${safe}`;
};
