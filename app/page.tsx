import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowRight, FileText, Lightbulb, LogIn, Sparkles, Zap } from 'lucide-react';

import FileUploadButton from '@/components/buttons/FileUploadButton';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { Chat } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export default async function Home() {
	const { userId } = await auth();
	const isAuthenticated = !!userId;

	let mostRecentChat: { id: number } | undefined;
	if (isAuthenticated) {
		const recent = await db
			.select({ id: Chat.id })
			.from(Chat)
			.where(eq(Chat.userId, userId!))
			.orderBy(Chat.createdAt)
			.limit(1);
		mostRecentChat = recent[0];
	}

	return (
		<main className='relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 z-10'>
			{isAuthenticated && (
				<div className='absolute top-4 right-4 z-20'>
					<UserButton />
				</div>
			)}

			<section className='flex flex-col items-center max-w-4xl z-10 space-y-10'>
				<h1 className='font-black text-4xl sm:text-5xl leading-tight text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]'>
					Readora — Chat With Your PDF 📄💬
				</h1>
				<p className='text-lg sm:text-xl font-medium text-gray-300 leading-relaxed max-w-2xl'>
					Upload a PDF and ask grounded, citation-style questions. Readora is a
					retrieval-augmented assistant built on Gemini embeddings, Pinecone
					vector search, and the Gemini Flash chat model.
				</p>

				{isAuthenticated && mostRecentChat && (
					<Link href={`/chat/${mostRecentChat.id}`} className='w-full sm:w-auto'>
						<Button
							size='lg'
							className='w-full sm:w-auto bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-white font-semibold rounded-lg shadow-md hover:shadow-indigo-500/30 transition-all duration-200'>
							<ArrowRight className='mr-2 w-4 h-4' /> Resume last session
						</Button>
					</Link>
				)}

				<div className='flex flex-col gap-4 w-full max-w-md'>
					{!isAuthenticated ? (
						<>
							<Link href='/demo'>
								<Button
									size='xl'
									className='w-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 hover:from-indigo-600/30 hover:to-blue-600/30 border border-indigo-500/40 text-white font-bold rounded-lg shadow-md hover:shadow-indigo-500/30 transition-all duration-200'>
									<Sparkles className='mr-2 w-5 h-5' /> Try the demo — no signup
								</Button>
							</Link>
							<Link href='/sign-in'>
								<Button
									size='xl'
									className='w-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/40 text-white font-bold rounded-lg shadow-md hover:shadow-purple-500/30 transition-all duration-200'>
									<LogIn className='mr-2 w-5 h-5' /> Sign in
								</Button>
							</Link>
						</>
					) : (
						<FileUploadButton />
					)}
				</div>

				<div className='mt-8 text-gray-300 text-sm max-w-xl bg-gray-800/30 p-6 rounded-lg border border-gray-700 shadow-md'>
					<h2 className='flex items-center justify-center gap-2 text-lg font-semibold text-indigo-300 mb-4'>
						<Lightbulb className='w-5 h-5 text-yellow-400' /> How it works
					</h2>
					<ul className='list-disc list-inside text-left space-y-3 text-sm sm:text-base'>
						<li className='flex items-center gap-2'>
							<FileText className='w-4 h-4 text-green-400' />
							PDF is parsed and chunked (1000-char windows, 200 overlap).
						</li>
						<li className='flex items-center gap-2'>
							<Zap className='w-4 h-4 text-indigo-400' />
							Chunks are embedded via Gemini <code>gemini-embedding-001</code>
							(768-d) and indexed in Pinecone.
						</li>
						<li className='flex items-center gap-2'>
							<Sparkles className='w-5 h-5 text-yellow-400' />
							Your query retrieves top-K matches, fed as grounded context to
							Gemini Flash.
						</li>
					</ul>
				</div>
			</section>
		</main>
	);
}
