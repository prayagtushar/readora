import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';
import { Toaster } from 'sonner';

import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Readora — RAG for your PDFs',
	description:
		'Readora is a retrieval-augmented chat interface for PDF documents. Upload a file and ask grounded, citation-style questions.',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider appearance={{ baseTheme: [neobrutalism] }}>
			<ReactQueryProvider>
				<html lang='en' className='h-full scroll-smooth' suppressHydrationWarning>
					<body
						className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black`}>
						<div className='relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden'>
							<div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,112,243,0.15)_0%,_transparent_60%)] animate-pulse pointer-events-none' />
							<div className='absolute top-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none' />
							<div className='absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none' />
							{children}
						</div>
						<Toaster />
					</body>
				</html>
			</ReactQueryProvider>
		</ClerkProvider>
	);
}
