'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import DemoUploadButton from '@/components/buttons/DemoUploadButton';
import { clearDemo, hasUsedDemo, loadDemo, type DemoSession } from '@/lib/demo/storage';

export default function DemoPage() {
	const [session, setSession] = useState<DemoSession | null>(null);
	const [used, setUsed] = useState(false);

	useEffect(() => {
		setSession(loadDemo());
		setUsed(hasUsedDemo());
	}, []);

	const reset = () => {
		clearDemo();
		setSession(null);
		setUsed(false);
	};

	return (
		<main className='relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 z-10'>
			<div className='absolute top-4 left-4 z-20'>
				<Link href='/'>
					<Button
						variant='ghost'
						size='sm'
						className='text-gray-300 hover:text-white hover:bg-white/10'>
						<ArrowLeft className='mr-2 w-4 h-4' /> Home
					</Button>
				</Link>
			</div>

			<section className='flex flex-col items-center max-w-4xl z-10 space-y-8'>
				<h1 className='font-black text-4xl sm:text-5xl leading-tight text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]'>
					Try Readora — no signup
				</h1>
				<p className='text-base sm:text-lg text-gray-300 max-w-2xl'>
					Upload one PDF and chat with it. The file is indexed in our vector
					store; your conversation lives in your browser only.
				</p>

				{session ? (
					<div className='flex flex-col items-center gap-4 w-full max-w-md'>
						<div className='w-full bg-gray-800/40 border border-white/10 rounded-lg p-4 text-left'>
							<p className='text-xs uppercase tracking-wider text-gray-400 mb-1'>
								Your demo PDF
							</p>
							<p className='text-sm font-medium text-white truncate'>
								{session.pdfName}
							</p>
						</div>
						<Link href='/demo/chat' className='w-full'>
							<Button
								size='lg'
								className='w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-white font-semibold rounded-lg'>
								<ArrowRight className='mr-2 w-4 h-4' /> Resume demo chat
							</Button>
						</Link>
						<Button
							variant='ghost'
							size='sm'
							onClick={reset}
							className='text-gray-400 hover:text-white hover:bg-white/10'>
							<RefreshCcw className='mr-2 w-4 h-4' /> Start over with a new PDF
						</Button>
					</div>
				) : used ? (
					<div className='flex flex-col items-center gap-4 w-full max-w-md text-center'>
						<p className='text-sm text-yellow-300'>
							You&apos;ve already used your demo upload in this browser. Sign up to
							upload more PDFs and keep persistent chat history.
						</p>
						<div className='flex gap-3'>
							<Link href='/sign-up'>
								<Button
									size='lg'
									className='bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/40 text-white font-bold rounded-lg'>
									Create an account
								</Button>
							</Link>
							<Button
								variant='ghost'
								size='lg'
								onClick={reset}
								className='text-gray-300 hover:text-white hover:bg-white/10 border border-white/20'>
								Reset demo
							</Button>
						</div>
					</div>
				) : (
					<DemoUploadButton />
				)}

				<div className='mt-4 text-gray-400 text-xs max-w-md'>
					Demo limits: 1 PDF per browser · 10MB max · chat history stored
					locally in <code>localStorage</code>, not on our servers.
				</div>
			</section>
		</main>
	);
}
