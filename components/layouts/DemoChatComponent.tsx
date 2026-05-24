'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send } from 'lucide-react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import MessageList from './MessageList';
import {
	loadDemo,
	saveDemo,
	type DemoMessage,
	type DemoSession,
} from '@/lib/demo/storage';

type Props = {
	session: DemoSession;
};

export default function DemoChatComponent({ session }: Props) {
	const sessionRef = useRef<DemoSession>(session);

	const initialMessages = session.messages.map((m) => ({
		id: m.id,
		role: m.role,
		content: m.content,
	}));

	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		error,
		isLoading,
	} = useChat({
		api: '/api/demo/chat',
		body: { fileKey: session.fileKey },
		initialMessages,
	});

	useEffect(() => {
		if (isLoading) return;
		const current = loadDemo();
		if (!current) return;

		const persisted: DemoMessage[] = messages.map((m) => ({
			id: m.id,
			role: m.role as 'user' | 'assistant',
			content: m.content,
		}));
		saveDemo({ ...current, messages: persisted });
		sessionRef.current = { ...current, messages: persisted };
	}, [messages, isLoading]);

	return (
		<div className='flex flex-col h-full text-white bg-black overflow-hidden border border-white/20 rounded-lg'>
			<div className='sticky top-0 z-10 bg-black p-4 border-b border-white/20 shadow-md'>
				<h3 className='text-xl font-bold tracking-tight text-white'>
					Demo chat
				</h3>
				<p className='text-xs text-gray-400 mt-1 truncate'>
					{sessionRef.current.pdfName}
				</p>
			</div>

			<div className='flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'>
				<MessageList messages={messages} isLoading={false} />
				{error && (
					<div className='mt-4 text-red-400 bg-red-500/10 p-3 rounded-md border border-red-500/20'>
						Chat error: {error.message}
					</div>
				)}
			</div>

			<div className='sticky bottom-0 p-4 bg-black border-t border-white/20'>
				<form onSubmit={handleSubmit} className='flex gap-2 items-center'>
					<Input
						value={input}
						onChange={handleInputChange}
						placeholder='Ask a question about the PDF…'
						disabled={isLoading}
						className='flex-1 bg-black border border-white/20 text-white placeholder-gray-400 rounded-md focus:ring-1 focus:ring-white/30 focus:border-white/30 shadow-sm transition-all duration-200 font-medium'
					/>
					<Button
						type='submit'
						disabled={isLoading || !input.trim()}
						className='bg-black hover:bg-white/10 text-white border border-white/20 rounded-md shadow-md hover:shadow-white/20 transition-all duration-300'>
						<Send className='w-5 h-5' />
					</Button>
				</form>
			</div>
		</div>
	);
}
