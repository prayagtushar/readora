export const DEMO_KEY = 'readora_demo';
export const DEMO_USED_KEY = 'readora_demo_used';

export type DemoMessage = {
	id: string;
	role: 'user' | 'assistant';
	content: string;
};

export type DemoSession = {
	fileKey: string;
	pdfUrl: string;
	pdfName: string;
	messages: DemoMessage[];
};

export const loadDemo = (): DemoSession | null => {
	if (typeof window === 'undefined') return null;
	const raw = window.localStorage.getItem(DEMO_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as DemoSession;
	} catch {
		return null;
	}
};

export const saveDemo = (session: DemoSession): void => {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(DEMO_KEY, JSON.stringify(session));
	window.localStorage.setItem(DEMO_USED_KEY, '1');
};

export const clearDemo = (): void => {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem(DEMO_KEY);
	window.localStorage.removeItem(DEMO_USED_KEY);
};

export const hasUsedDemo = (): boolean => {
	if (typeof window === 'undefined') return false;
	return window.localStorage.getItem(DEMO_USED_KEY) === '1';
};
