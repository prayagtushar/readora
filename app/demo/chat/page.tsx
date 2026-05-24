'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import DemoChatComponent from '@/components/layouts/DemoChatComponent';
import PDFViewer from '@/components/layouts/PDFView';
import { clearDemo, loadDemo, type DemoSession } from '@/lib/demo/storage';

export default function DemoChatPage() {
	const [session, setSession] = useState<DemoSession | null>(null);
	const [hydrated, setHydrated] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const s = loadDemo();
		setSession(s);
		setHydrated(true);
		if (!s) router.replace('/demo');
	}, [router]);

	if (!hydrated) return null;
	if (!session) return null;

	const reset = () => {
		clearDemo();
		router.replace('/demo');
	};

	return (
		<div className='flex flex-col h-screen w-full bg-black text-white overflow-hidden'>
			<header className='p-3 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur-md z-50'>
				<Link href='/demo'>
					<Button
						variant='ghost'
						size='sm'
						className='text-gray-300 hover:text-white hover:bg-white/10'>
						<ArrowLeft className='mr-2 w-4 h-4' /> Demo home
					</Button>
				</Link>
				<h1 className='text-sm font-semibold truncate max-w-[50%]'>
					{session.pdfName}
				</h1>
				<Button
					variant='ghost'
					size='sm'
					onClick={reset}
					className='text-gray-300 hover:text-white hover:bg-white/10'>
					<RefreshCcw className='mr-2 w-4 h-4' /> New PDF
				</Button>
			</header>

			<main className='flex flex-1 flex-col md:flex-row overflow-hidden'>
				<section className='flex-1 md:flex-[5] p-4 md:p-6 overflow-hidden border-b md:border-b-0 md:border-r border-white/10'>
					<PDFViewer pdf_url={session.pdfUrl} />
				</section>
				<aside className='flex-1 md:flex-[3] border-t md:border-t-0 md:border-l border-white/10'>
					<DemoChatComponent session={session} />
				</aside>
			</main>
		</div>
	);
}
